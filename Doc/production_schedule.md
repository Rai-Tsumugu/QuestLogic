# 制作スケジュール (Production Schedule) - Weekly Breakdown

本プロジェクトは全5週間の開発期間を予定しています。
各週のゴールと具体的なタスクを定義します。

---

## 📅 Week 1: Foundation & Authentication (基盤と認証)
**Goal**: アプリが起動し、ユーザーがログインでき、カメラが動く状態にする。

| Task ID | Component | Detail | Reference Docs |
| :--- | :--- | :--- | :--- |
| **1.1** | **Project Setup** | Expo, Firebase Project作成, GitHub Repo設定 | `01`, `14` |
| **1.2** | **DB Setup** | Firestore設計・セキュリティルール初期適用 | `05`, `14` |
| **1.3** | **Auth UI/Logic** | 親アカウント登録、子アカウント追加フローの実装 | `01` |
| **1.4** | **Camera UI** | Before撮影画面の実装（グリッド表示含む） | `02` |
| **1.5** | **Switch User** | 親→子へのユーザー切り替え機能 | `01` |

*   **Deliverable**: ログインしてカメラを起動できるアプリ。

---

## 📅 Week 2: The Core Loop (撮る・送る・見る)
**Goal**: 「撮影→AI分析→結果表示」の一連の流れ（Happy Path）を通す。

| Task ID | Component | Detail | Reference Docs |
| :--- | :--- | :--- | :--- |
| **2.1** | **Image Storage** | Firebase Storageへのアップロード処理 | `03` |
| **2.2** | **Timer Logic** | 集中タイマーの実装（バックグラウンド検知は簡易版でOK） | `02` |
| **2.3** | **Cloud Functions** | Gemini APIを叩くバックエンドAPIの実装 | `04` |
| **2.4** | **AI Logic** | プロンプトエンジニアリングとレスポンスのパース処理 | `04`, `11` |
| **2.5** | **Result View (Basic)** | AI分析結果（スコア・テキスト）の表示 | `06` |
| **2.6** | **Parent Dashboard (Basic)** | 親画面でのデータ参照（リスト表示） | `08` |

*   **Deliverable**: ノートを撮影するとAIが評価を返してくれる状態。

---

## 📅 Week 3: Gamification & Polish (楽しさの演出)
**Goal**: アプリを使いたくなる「ワクワク感」を実装する。子供側のUI完成度を高める。

| Task ID | Component | Detail | Reference Docs |
| :--- | :--- | :--- | :--- |
| **3.1** | **Gamification Logic** | エネルギー計算ロジック（基本分＋ボーナス分）の実装 | `07` |
| **3.2** | **Animation (Result)** | スコア演出、宝箱が開くアニメーション等の実装 | `06`, `13` |
| **3.3** | **Character UI** | AIコメントをキャラクター（ワイズ）が喋るUIの実装 | `11` |
| **3.4** | **After Camera (Ghost)** | Before画像を半透明で重ねる撮影モードの実装 | `02` |
| **3.5** | **Unlock Mock** | 「遊ぶ」ボタン押下時の演出（IoT連携はモック） | `07` |

*   **Deliverable**: RPGのような演出があり、エネルギーが貯まる楽しさを感じる状態。

---

## 📅 Week 4: Advanced Features & Parent Controls (親機能と例外対応)
**Goal**: 親子のコミュニケーション機能を完成させ、イレギュラーな事態に対応する。

| Task ID | Component | Detail | Reference Docs |
| :--- | :--- | :--- | :--- |
| **4.1** | **Parent Actions** | 承認・スタンプ送信・却下機能の実装 | `08` |
| **4.2** | **Notification** | 親のアクションを子供に通知する機能 (FCM) | `06`, `08` |
| **4.3** | **Comparison UI** | 親画面でのBefore/Afterスライダーの実装 | `08` |
| **4.4** | **Error Handling** | ネットワーク切断やエラー時のRPG風UI実装 | `10` |
| **4.5** | **Sound Design** | BGM/SEの実装 | `12` |
| **4.6** | **Concentration Mode** | アプリ離脱検知の厳密化 | `02` |

*   **Deliverable**: 親が承認でき、エラー時も世界観が壊れない完成度の高い状態。

---

## 📅 Week 5: Stabilization & Launch (安定化)
**Goal**: バグを潰し、本番運用に耐えうる品質にする。

| Task ID | Component | Detail | Reference Docs |
| :--- | :--- | :--- | :--- |
| **5.1** | **E2E Testing** | 主要シナリオ（`tests/*`）の通しテスト | `Tests` |
| **5.2** | **Performance** | 画像読み込み速度の改善、インデックス最適化 | `14` |
| **5.3** | **Final Polish** | 文言統一、微細なレイアウト崩れの修正 | `13` |
| **5.4** | **Store Prep** | アプリアイコン、スプラッシュスクリーンの最終化 | - |

*   **Final Deliverable**: **Release Candidate (v1.0)**

---

## リスクと対策
*   **AI精度のブレ**: Week 2で早期にプロンプトを確定させる。必要ならRule-basedな評価（文字数カウント等）も併用する。
*   **Gemini API制限**: 開発中はMockデータを使用し、コストと枠を節約する。
