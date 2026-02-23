# Phase 1 詳細設計書: AI評価エンジンの確立

## 1. AIロジック詳細設計 (AI Logic Design)

SmartStudy Gateの核となる、Gemini AIを用いた学習評価ロジックの詳細です。

### 1.1 画像解析フロー
1.  **ユーザーアクション**:
    *   **Before撮影**: 学習開始前のノート（空白ページや教科書）を撮影。
    *   **After撮影**: 学習完了後のノート（書き込み済み）を撮影。
    *   **メタデータ入力**: 教科（算数/計算）、単元（任意）、親のこだわり設定（API送信時に付与）。
2.  **APIリクエスト構成**:
    *   **Model**: `gemini-3-flash-preview` (マルチモーダル性能と長いコンテキストを活かす)
    *   **Input**:
        *   Image 1: Before Image
        *   Image 2: After Image
        *   Text: System Prompt + User Metadata
3.  **解析プロセス**:
    *   画像間の差分（Delta）を認識し、書き込み量を特定。
    *   書き込まれた内容から「質」に関わる特徴（消し跡、図、赤ペン）を抽出。
    *   不自然な点（時間不相応な量、筆跡の乱れ）をチェック。

### 1.2 プロンプト設計案 (System Prompt Draft)

Geminiに与えるシステムプロンプトの構成案です。

#### 役割定義 (Role Definition)
> あなたは、子供の自律的な学習を支援する熟練の「AI家庭教師」です。
> あなたの目的は、単に「正解したか」を判定することではなく、子供の「努力のプロセス」と「誠実さ」を評価し、親に客観的なレポートを提供することです。
> 親は忙しく、詳細をチェックできないため、あなたの分析が頼りです。

#### 評価基準 (Evaluation Criteria)

| 評価項目 | 判定ロジック・着眼点 | 加点ウェイト (例) |
| :--- | :--- | :--- |
| **作業量 (Volume)** | Before/Afterの差分。ページがどの程度埋まっているか（スカスカか、びっしりか）。 | 30% |
| **試行錯誤 (Process)** | 消しゴムを使った跡、二重線での修正、余白への計算、独自のメモ書き。 | 40% |
| **丁寧さ (Carefulness)** | 文字の乱雑さ（殴り書きでないか）、図や線の丁寧さ。 | 20% |
| **振り返り (Review)** | 赤ペンや青ペンによる丸付け、解き直し、間違いの原因メモ。 | 10% |
| **不審点 (Suspicion)** | 筆跡が明らかに異なる、内容が教科書等の丸写しに見える、時間が短すぎるのに量が多すぎる。 | (検知時フラグ) |

#### 出力フォーマット (JSON Schema)
APIからのレスポンスは以下のJSON形式を強制します。

```json
{
  "summary": "概ね良好ですが、後半少し書き込みが雑になっています。",
  "score_breakdown": {
    "volume": 8, // 10点満点
    "process": 6,
    "carefulness": 5,
    "review": 9
  },
  "total_score": 75, // バリアブルな重み付け計算後のスコア
  "features": [ // 検知された特徴的な要素
    { "type": "erasure_mark", "location": "top-right", "description": "計算ミスを修正した跡があります" },
    { "type": "red_pen", "location": "bottom", "description": "間違えた問題に解説を追記しています" }
  ],
  "suspicion_flag": false, // 不審な点があればtrue
  "suspicion_reason": null,
  "feedback_to_child": "計算ミスを自分で気づいて直せたね！その調子！",
  "feedback_to_parent": "解き直しの形跡があり、理解しようとする姿勢が見られます。"
}
```

---

## 2. プロトタイプ(MVP)要件定義

### 2.1 画面遷移 (Screen Flow)
`[Login]` -> `[Role Select (Parent/Child)]`

**Child Flow:**
`[Home (Energy/Quest)]` -> `[Quest Detail]` -> `[Camera (Before)]` -> `(Studying...)` -> `[Camera (After)]` -> `[Analyzing Animation]` -> `[Result]`

**Parent Flow:**
`[Dashboard]` -> `[Report Detail (Approve/Reject)]` -> `[Settings]`

### 2.2 データモデル (Data Model / Firebase check)

**Users Collection**
- `uid`: string (Parent/Child)
- `role`: "parent" | "child"
- `familyId`: string

**Quests (Homework) Collection**
- `id`: string
- `childId`: string
- `status`: "pending" | "started" | "reviewing" | "completed" | "rejected"
- `beforeImageUrl`: string (Storage Path)
- `afterImageUrl`: string (Storage Path)
- `startedAt`: Timestamp
- `finishedAt`: Timestamp
- `aiAnalysisResult`: Map (JSON from Gemini)
- `parentAction`: "approved" | "rejected" | "none"
- `earnedPoints`: number

## 3. 検証(PoC)計画

### 3.1 テスト目的
- Gemini 1.5 Proが、手書きノートの「努力の痕跡（消し跡など）」をどの程度認識できるかを確認する。
- Before/Afterの差分解析が、空白ページへの書き込みだけでなく、途中からの書き込み等にも対応できるか検証する。

### 3.2 テストデータセット
以下のパターンを含むノート画像各10セット（計30セット以上）を用意。
1.  **理想的なノート**: びっしり書いてあり、解き直しもある。
2.  **手抜きノート**: 答えだけ書いてある、スカスカ、字が汚い。
3.  **不正疑惑ノート**: 明らかに他人の字、教科書のコピーのような内容。

### 3.3 評価指標
- **Qualitative Match Rate**: AIのコメント（「雑ですね」等）が、人間の親の感覚と「一致」または「許容範囲」である割合。目標80%以上。
