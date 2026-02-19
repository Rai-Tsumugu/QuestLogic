# システム設計書 (System Design Document)

## 1. システム概要
**QuestLogic** (プロジェクト名) は、子供の自律性を育むことを目的としたゲーミフィケーション学習支援アプリケーションです。親と子が同じアプリケーション内で異なるインターフェースとフローを持つ「デュアルアプリ戦略」を採用し、ロールベースの認証によって管理されます。

### コア技術
*   **Frontend**: React Native (Expo)
*   **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions)
*   **AI**: Google Gemini API (v3 Flash) - 画像解析およびフィードバック生成に使用。
*   **IoT**: "Smart-Gate Box" (将来的な統合) - 物理的な報酬の解錠に使用。

---

## 2. 認証とユーザー管理 (Authentication & User Management)

### 2.1 ロールとアカウント構造
*   **Parent (親/管理者)**: 
    *   Firebase Auth アカウント (Email/Password, Social) と紐づく。
    *   "Family" (家族グループ) を管理する。
    *   クエスト (学習結果) の承認を行う。
*   **Child (子供/学習者)**:
    *   主にFamily内のデータエンティティとして管理される。
    *   PINコード (共有端末の場合) または専用のサブアカウント認証情報 (個人端末の場合) を介してアプリにアクセスする。

### 2.2 データモデル (`users`, `families`)

#### `users` Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | String | Firebase Auth UID (Primary Key) |
| `role` | String | `"parent"` or `"child"` |
| `displayName` | String | ユーザー名 |
| `familyId` | String | 紐づく Family ID |
| `createdAt` | Timestamp | 作成日時 |

#### `families` Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Family ID (Primary Key) |
| `parentUid` | String | 親ユーザーの UID |
| `childUids` | Array<String> | 子ユーザーの UID リスト |
| `inviteCode` | String | 他の保護者や子供を招待するためのオプションコード |

### 2.3 認証フロー
1.  **Parent SignUp (親登録)**: `families` ドキュメントと `users` ドキュメント (`role: parent`) を作成する。
2.  **Add Child (子追加)**: 親が Cloud Function をトリガー -> 子ユーザーを作成 -> `families.childUids` を更新 -> PINコードを返す。
3.  **Child Login (子ログイン)**:
    *   **共有端末**: 親がログイン -> "Switch User" (ユーザー切り替え) -> 子を選択 -> PIN入力。
    *   **個人端末**: 専用の子クレデンシャル (またはQRコードログイン機構) を介してログイン。

---

## 3. データベーススキーマ (Firestore)

### 3.1 クエスト管理 (`quest_results`)
各学習セッションの結果を格納する。

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Quest ID (Primary Key) |
| `childId` | String | 子ユーザーの UID |
| `familyId` | String | Family ID |
| `subject` | String | "Math" (算数), "English" (英語) など |
| `startedAt` | Timestamp | 開始時刻 (Before撮影時) |
| `finishedAt` | Timestamp | 終了時刻 (After撮影時) |
| `durationMin` | Number | 計算された学習時間 (分) |
| `images` | Map | `{ before: path, after: path }` |
| `aiResult` | Map | AI生データ (`{ score, breakdown, feedback, tags }`) |
| `finalScore` | Number | 確定スコア (初期値は aiResult.score と同じ) |
| `status` | String | `"pending_review"`(確認待), `"approved"`(承認済), `"rejected"`(却下) |
| `earnedEnergy` | Number | 計算された報酬時間 (分) |

**インデックス (Indexes)**:
*   `familyId` ASC + `finishedAt` DESC (親ダッシュボード用)
*   `childId` ASC + `subject` ASC + `finishedAt` DESC (子供の履歴用)

### 3.2 ゲーミフィケーション (`energy_transactions`)
「遊び時間 (Energy)」の獲得と消費を追跡する。

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | String | 子ユーザーの UID |
| `amount` | Number | プラス (獲得) または マイナス (消費) |
| `reason` | String | "quest_reward", "play_session", "bonus" など |
| `relatedQuestId` | String | 関連するクエストID (オプション) |
| `timestamp` | Timestamp | トランザクション日時 |

**インデックス (Indexes)**:
*   `userId` ASC + `timestamp` DESC

---

## 4. ファイルストレージ戦略 (File Storage Strategy)

### 4.1 パス構造
解析用画像を Firebase Storage にセキュアに保存する。
`images/{familyId}/{childId}/{questId}/{type}.jpg`

*   `type`: `"before"` または `"after"`

### 4.2 ライフサイクル
*   **保持期間**: 90日 (Google Cloud Lifecycle Management を使用)。
*   **長期保存**: 重要な記録 (例: 特定の「思い出」クエスト) は、サムネイルが生成され、永続パスに保存される場合がある。

---

## 5. コアロジックとアルゴリズム

### 5.1 AI解析 (Cloud Functions + Gemini API)
*   **トリガー**: "After" 画像のアップロード完了。
*   **入力**: Before画像, After画像, メタデータ (教科, 時間)。
*   **プロンプト戦略**:
    *   役割: "中学生向けの励まし上手なAIコーチ"。
    *   **差分解析 (Delta Analysis)**: 画像の差分に基づいて作業量 (Volume) を評価。
    *   **プロセス解析 (Process Analysis)**: "消しゴムの跡" (試行錯誤) や "赤ペンの跡" (修正・振り返り) を検出し、高く評価する。
*   **出力 JSON**:
    *   `score` (0-100)
    *   `breakdown` (`volume`, `quality`, `process`)
    *   `feedback_child` (共感的で具体的な褒め言葉)
    *   `feedback_parent` (客観的なレポート)

### 5.2 エネルギー計算 (ゲーミフィケーション)
`CalculatedEnergy (計算獲得エネルギー) = BaseTime (基本時間) + BonusTime (ボーナス時間)`

*   **BaseTime**: `DurationMin (学習時間) * QualityMultiplier (品質係数)`
    *   スコア 100-80: x1.0
    *   スコア 79-60: x0.8
    *   それ以下: 大幅に減額
*   **BonusTime**:
    *   **Correction Bonus (訂正ボーナス)**: +5分 (AIが自己修正を検知した場合)
    *   **Streak Bonus (継続ボーナス)**: +3分/日 (継続利用に対して)
    *   **Parent Boost (親からの応援)**: +10分 (親が「スタンプ」を送った場合)

---

## 6. UI/UX アーキテクチャ

### 6.1 画面フロー
*   **Child Flow (子供用フロー)**:
    `Home (クエストボード)` -> `Quest Detail (詳細)` -> `Camera (Before撮影)` -> `Timer (集中タイマー)` -> `Camera (After撮影)` -> `Result View (結果)`
*   **Parent Flow (親用フロー)**:
    `Dashboard (ダッシュボード)` -> `Report Detail (レポート確認)` -> `Action (承認/却下)`

### 6.2 主要なインタラクション機能
*   **Camera Leveler (カメラ水平器)**: スマホが水平になるまでシャッターを無効化し、真上からの撮影を強制する。
*   **Ghost Overlay (ゴーストオーバーレイ)**: "After" 撮影時に半透明の "Before" 画像を表示し、位置合わせを容易にする。
*   **Concentration Timer (集中タイマー)**: アプリのバックグラウンド滞在時間を追跡し、学習中に他のアプリを開くとペナルティまたは警告を与える。
*   **Before/After Slider (比較スライダー)**: 学習前後のノートの状態を簡単に比較できる親用UIコンポーネント。

---

## 7. API インターフェース (Cloud Functions)

| Endpoint | Method | Description | Access |
| :--- | :--- | :--- | :--- |
| `/api/family/child` | POST | 新しい子アカウントを作成する。 | Parent |
| `/api/analyze` | POST | クエストのAI解析をトリガーする。 | Auth User |
| `/api/quest/approve` | POST | 親がクエスト結果を承認する。 | Parent |
| `/api/quest/reject` | POST | 親がクエスト結果を却下する。 | Parent |
