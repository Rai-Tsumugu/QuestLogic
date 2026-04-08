# システム設計書 (System Design Document)

## 1. システム概要
**QuestLogic** は、子供の自律性を育むことを目的としたゲーミフィケーション学習支援アプリケーションです。親と子が同じアプリケーション内で異なるインターフェースとフローを持つ「デュアルアプリ戦略」を採用しています。

### コア技術スタック (v5.0 更新)
* **Frontend**: React Native (Expo)
* **Backend**: Node.js, Express, TypeScript
* **Database**: PostgreSQL, Prisma (ORM)
* **Authentication**: Google OAuth 2.0 + Custom JWT
* **AI**: Google Gemini API (gemini-flash) - 画像解析およびフィードバック生成に使用。

---

## 2. 認証とユーザー管理

### 2.1 認証フロー
Firebase Authから独自JWT認証へ移行しました。
1.  **Google ログイン**: モバイルアプリ側でGoogleの `idToken` を取得し、`POST /api/auth/google` へ送信。
2.  **JWT 発行**: バックエンドで検証後、独自のJWTアクセストークン（24時間有効）を発行。
3.  **新規登録と役割**: 
    * 初回ログイン時に `PARENT` の場合は、自動的に `Family` グループが生成されます。
    * `CHILD` の場合は、未所属状態で作成され、のちに家族連携（OTP）を行います。

### 2.2 家族連携フロー (OTP方式)
1.  親が `POST /api/users/invite-code` を実行。サーバーは **5分間のみ有効な6桁の数字コード** を生成。
2.  子供が `POST /api/users/join-family` にてコードを送信。
3.  期限内であれば連携が完了し、使用されたコードはDB上で即座に破棄（null化）されます。

---

## 3. データベーススキーマ (Prisma / PostgreSQL)

### 3.1 ユーザーと家族 (`User`, `Family`)
* **Family**: 家族設定 (`minutesPerPoint`, `aiSettings`, 強制ロック状態) と OTP (`inviteCode`, `inviteCodeExpiresAt`) を管理。
* **User**: `role` (PARENT/CHILD)、ウォレット機能 (`currentPoints`)、ゲーミフィケーション要素 (`level`, `exp`) を管理。

### 3.2 クエスト・学習 (`Quest`)
学習セッションの提出とAI分析結果を保持します。
* `status`: PENDING, ANALYZING, COMPLETED 等
* `beforeImageUrl`, `afterImageUrl`: ローカルサーバーのアップロードパス
* `aiResult`: JSONB形式で格納されたGeminiの分析データ（スコア、フィードバック等）
* `earnedPoints`: このクエストで獲得したゲームポイント

### 3.3 デバイス (`Device`)
家族が所有する制限対象のデバイスを管理します。

---

## 4. コアロジックとアルゴリズム

### 4.1 学習の提出とAI解析
* **トリガー**: 子供がBefore/After画像を同時に `POST /api/quests/submit` に提出。
* **AI分析**: Gemini APIが同期的に画像を比較し、以下の基準で評価（JSON返却）。
    * **作業量 (Volume)**: Before/Afterの差分。
    * **試行錯誤 (Process)**: 消しゴムの跡、修正の形跡。
    * **丁寧さ (Carefulness)**: 文字や図の丁寧さ。
    * **振り返り (Review)**: 丸付けや解き直し。
* **スコア確定**: 返却された `total_score` を基に獲得ポイントと経験値を算出。

### 4.2 ゲーミフィケーションとレベルシステム
* **ポイント(時間)換算**: `獲得時間(分) = ポイント × Family.minutesPerPoint` 
    * デフォルトは 1ポイント = 2分。
* **経験値 (EXP) とレベル**: 
    * クエスト完了時のAIスコアがそのままEXPとして加算されます。
    * `New Level = floor(New EXP / 100) + 1` の計算式に基づき、100 EXPごとにレベルアップします。
* **親による介入**: 親は `POST /api/quests/:id/bonus` により、クエストに対して手動で追加ボーナスポイントを付与できます。

---

## 5. UI/UX アーキテクチャ

* **Child Flow**: クエストボード -> カメラ(Before) -> 集中タイマー -> カメラ(After) -> AI結果表示とレベルアップ演出。
* **Parent Flow**: ダッシュボード -> 家族の残り時間管理 (`gameRemainingMinutes`) -> クエスト履歴確認 -> ボーナス付与またはデバイスロックの実行。