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

## 7. API インターフェース (Cloud Functions & Backend)

本システムは、クライアント(App)とバックエンド(Firebase)の通信において、以下のAPIおよびトリガーを使用します。

### 7.1 ユーザー管理 (User Management)
| Method | Endpoint | Description | Access | Payload / Note |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/user/parent/signup` | (Trigger) 親アカウント作成時、初期データ(Family, User)を生成。 | System | Auth Trigger (onCreate) |
| `POST` | `/api/family/child` | 新しい子アカウントを作成し、Familyに追加する。 | Parent | `{ displayName: string }` -> `{ pin: string }` |
| `POST` | `/api/auth/child/login` | PINコードを用いて子として認証する(またはそのためのToken発行)。 | Public | `{ familyId: string, pin: string }` |
| `GET` | `/api/family/members` | 家族メンバー一覧を取得する。 | Auth User | - |

### 7.2 学習・クエスト (Quest & Learning)
| Method | Endpoint | Description | Access | Payload / Note |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/quest/start` | クエストを開始し、Before画像を登録する。 | Child | `{ subject: string, beforeImageUrl: string }` |
| `POST` | `/api/quest/finish` | クエストを完了し、After画像を登録。AI解析をリクエストする。 | Child | `{ questId: string, afterImageUrl: string, duration: number }` |
| `GET` | `/api/quest/list` | クエスト履歴を取得する(フィルタリング可)。 | Auth User | `?childId=...&date=...` |
| `GET` | `/api/quest/:id` | クエストの詳細情報を取得する。 | Auth User | - |

### 7.3 AI解析 (AI Analysis)
| Method | Endpoint | Description | Access | Payload / Note |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/analyze` | (Internal/Admin) Gemini APIを用いた画像解析を実行する。 | System | 通常は `/api/quest/finish` から非同期または同期で呼び出される。 |

### 7.4 親の承認・管理 (Parent Review)
| Method | Endpoint | Description | Access | Payload / Note |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/quest/approve` | クエスト結果を承認し、エネルギー確定とボーナス付与を行う。 | Parent | `{ questId: string, stampId?: string, comment?: string }` |
| `POST` | `/api/quest/reject` | クエスト結果を却下し、やり直しを指示する。 | Parent | `{ questId: string, reason: string }` |
| `POST` | `/api/quest/correct` | 親がスコアや評価を手動で修正する。 | Parent | `{ questId: string, correctScore: number }` |

### 7.5 ゲーミフィケーション・IoT (Gamification & Device)
| Method | Endpoint | Description | Access | Payload / Note |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/energy/balance` | 現在のエネルギー残高を取得する。 | Child/Parent | - |
| `POST` | `/api/device/unlock` | Smart-Gate Boxの解錠をリクエストし、エネルギー消費を開始する。 | Child | `{ deviceId: string }` |
| `POST` | `/api/device/lock` | Smart-Gate Boxの施錠を確認し、エネルギー消費を停止する。 | Child | `{ deviceId: string }` |
| `POST` | `/api/device/status` | デバイスの状態(Open/Close)を同期する。 | Device | IoTデバイスからのHeartbeat等 |
