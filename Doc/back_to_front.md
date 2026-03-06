# 🚀 QuestLogic API 連携ガイドライン (v1.0)

バックエンドAPIの本番環境構築が完了しました。
このドキュメントは、フロントエンドおよびモバイルアプリ開発チームが `QuestLogic API` をスムーズに利用するためのガイドラインです。

## 1. 基本情報 (Base Information)

* **Base URL (本番環境):** `https://QL-api.adcsvmc.net/api`
* **API テストポータル (動作確認用):** `https://QL-api.adcsvmc.net/dev/test.html`
  *(※ Basic認証: ID `admin` / PW `Quest2404`)*
* **認証方式 (JWT):**
  APIリクエストの際は、HTTPヘッダーに必ず以下のフォーマットでトークンを含めてください。
  `Authorization: Bearer <取得したJWTトークン>`

---

## 2. 共通レスポンスフォーマット

APIは原則として以下のJSON形式でレスポンスを返します。通信時のエラーハンドリングに活用してください。

**✅ 成功時 (HTTP 200)**
```json
{
  "success": true,
  "data": { ... } // または "message": "成功しました"
}
```

**❌ エラー時 (HTTP 400, 401, 404, 500 など)**
```json
{
  "success": false,
  "error": "エラーの詳細な理由"
}
```

---

## 3. API エンドポイント一覧

### 🔑 3-1. 認証・テスト (Auth)
*(※ 現在は開発用のダミーログインエンドポイントを使用しています。)*

* **GET `/test/login/:role`**
  * **概要:** 開発用のログイン処理を行い、JWTトークンを取得します。
  * **Path Parameter:** `role` (`child` または `parent`)
  * **レスポンス例:**
    ```json
    { "success": true, "token": "eyJhb...", "user": { "id": "...", "role": "CHILD" } }
    ```
  * **実装時の注意:** 取得した `token` をアプリ内のローカルストレージ(AsyncStorage等)に保存し、以降の通信ヘッダーで使用してください。

### 👨‍👩‍👧 3-2. ユーザー＆家族管理 (Users & Family)

* **PUT `/users/profile`**
  * **概要:** ユーザーのプロフィール（学年・得意なこと）を更新します。
  * **権限:** 全員 (Child / Parent)
  * **Body (JSON):**
    ```json
    { "grade": "小1", "specialty": "算数" }
    ```

* **GET `/users/invite-code`**
  * **概要:** 自分の家族に子供を招待するための「6桁の招待コード」を取得します。
  * **権限:** 親 (Parent) のみ

* **POST `/users/join-family`**
  * **概要:** 親から共有された招待コードを入力し、家族連携を行います。
  * **権限:** 子供 (Child) のみ
  * **Body (JSON):**
    ```json
    { "inviteCode": "a1b2c3" }
    ```

### ⚔️ 3-3. クエスト機能 (Quest - コアゲームループ)

* **POST `/quests/submit`**
  * **概要:** 勉強のBefore/After画像を送信し、AIによる分析と経験値(EXP)・ゲーム時間の獲得を行います。
  * **権限:** 子供 (Child) のみ
  * **Content-Type:** `multipart/form-data` (※JSONではありません)
  * **Body (FormData):**
    * `beforeImage`: (File) 勉強前の画像
    * `afterImage`: (File) 勉強後の画像
    * `childId`: (String) 子供のユーザーID
    * `familyId`: (String) 家族のID
  * **レスポンスの注目ポイント:**
    * `isLevelUp` (boolean): `true` の場合、レベルアップ演出（ポップアップ等）を画面に出してください。
    * `newLevel` (number): 上がった後の新しいレベル。
    * `data.aiResult`: AIからの評価星数(`score_breakdown`)や先生のコメント(`feedback_to_child`)が含まれます。

* **POST `/quests/:id/bonus`**
  * **概要:** 提出されたクエストに対し、親が追加のボーナスゲーム時間を与えます。
  * **権限:** 親 (Parent) のみ
  * **Path Parameter:** `id` (クエストID)
  * **Body (JSON):**
    ```json
    { "bonusPoints": 10 }
    ```

### 🎮 3-4. 報酬の消費 (Rewards)

* **POST `/users/consume-points`**
  * **概要:** 獲得したゲーム時間を消費します。（スマホのロック解除などに連動して呼び出してください）
  * **権限:** 子供 (Child) のみ
  * **Body (JSON):**
    ```json
    { "minutes": 15 }
    ```

---

## 4. フロントエンド実装推奨フロー

アプリのコアとなるユーザー体験(UX)フローは、以下の順序で実装することを推奨します。

1. **初期ログイン:** `/test/login/child` または `parent` を叩き、トークンを保存。
2. **家族連携:**
   * 親画面：`/users/invite-code` でコードを表示。
   * 子供画面：入力フォームを作り、`/users/join-family` でコードを送信。
3. **プロフィール登録:** `/users/profile` で学年(`小1`〜`高3`)と得意なことを登録。
4. **宿題提出（メイン機能）:** カメラを起動して2枚の写真を撮影し、`FormData`として `/quests/submit` へ送信。
5. **結果表示:** レスポンスの `isLevelUp` をチェックし、アニメーション分岐。AIの評価結果を星（★）でUIに反映。

---

## 5. 開発時の注意事項・お願い ⚠️

* **CORSについて:** 現在は全てのドメインからの通信を許可(`origin: '*'`)しています。ローカル開発環境(localhost)から直接APIを叩いてもCORSエラーは発生しません。
* **画像アップロードのタイムアウト:** Gemini AIの分析に数秒〜十数秒かかる場合があります。フロントエンド側（axiosやfetch等）の**リクエストタイムアウト設定を30秒以上（推奨60秒）**に設定し、通信中は「AI分析中...」のようなローディングスピナー(Lottie等)を必ず表示してください。
* **不明点がある場合:** APIの挙動がおかしい、または欲しいデータの形が違う場合は、バックエンド担当までいつでも気軽にご相談ください！