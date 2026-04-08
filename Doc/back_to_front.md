# QuestLogic API 連携ガイドライン (v5.0)

このドキュメントは、最新のOTP連携やPostgreSQL(Prisma)移行を含むバックエンド実装基準のAPI連携ガイドです。

## 1. 認証とベースURL設定

* **API ベースURL**: `https://QL-api.adcsvmc.net/api`
* **テストログイン**: `GET /api/auth/test/login/:role` (Basic認証必須)
    * *注意: `app.ts` ではなく `auth.routes.ts` のパスを使用してください。*
* **共通ヘッダー**:
    ```http
    Authorization: Bearer <token>
    ```

## 2. v5.0 の重要アップデート (フロントエンド対応必須)

### 2.1 ワンタイムパスワード (OTP) による家族連携
固定の招待コードは廃止され、5分間有効なOTP方式に変更されました。
* **親アプリ側**: `POST /api/users/invite-code` を呼び出し、レスポンスの `expiresAt` を基に画面上で **5分間のカウントダウンタイマー** を実装してください。
* **子供アプリ側**: コード入力時、5分を過ぎている場合は `400 Bad Request` とエラーメッセージが返ります。適切にアラートを表示してください。

### 2.2 レベル・経験値(EXP) システムの追加
* 起動時やバックグラウンド復帰時は必ず `GET /api/users/me` を呼び出し、`level`, `exp`, `currentPoints`, `currentMinutes` を再同期してください。
* `POST /api/quests/submit` のレスポンスに `isLevelUp` (boolean) と `newLevel` (number) が追加されました。レベルアップ演出のトリガーとして使用してください。

### 2.3 デバイス管理のDB化
固定値・モック配列を廃止しました。以下のAPIで実データを管理してください。
* 一覧取得: `GET /api/family/devices`
* 追加: `POST /api/family/devices`
* 削除: `DELETE /api/family/devices/:id`

## 3. 実装上の注意点と既知のバグ (バックエンド修正予定)

バックエンドの監査（Code Audit）により、現在以下の問題が確認されています。テスト時に留意してください。

1.  **時間延長バグ**: `POST /api/family/extend-time` で延長した際、家族内の「すべての子供」に同じポイントが付与され、意図した時間のN倍になるバグがあります。（バックエンドで修正予定）
2.  **画像クリーンアップ**: `POST /api/quests/submit` 実行後、サーバー側に画像ファイルが残ったままになる仕様です。連続送信テスト時はサーバー容量に注意してください。
3.  **無効なJWTの挙動**: JWTが無効または期限切れの場合、正しく `401 Unauthorized` が返るようになりました。フロントエンドはこれを受けて強制ログアウト（signOut）処理を走らせてください。