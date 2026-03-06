# QuestLogic API 連携ガイドライン (v2.0)

このドキュメントは、2026年3月6日時点の実装コードを基準に整理した API ガイドです。  
旧版のような予定仕様ではなく、`backend/src` と `frontend/src` で実際に使われている内容を優先しています。

## 1. ベース情報

- 本番オリジン: `https://QL-api.adcsvmc.net`
- API プレフィックス: `/api`
- API ルート: `https://QL-api.adcsvmc.net/api`
- 開発テストポータル: `https://QL-api.adcsvmc.net/dev/test.html`
- テストポータル Basic 認証: ID `admin` / PW `Quest2404`

### フロントエンド設定の注意

- `frontend/src/lib/gemini.ts` は `EXPO_PUBLIC_API_BASE_URL` に `/api` を含まない値を想定しています。
- 例:
  - モバイルアプリの `.env`: `EXPO_PUBLIC_API_BASE_URL=https://QL-api.adcsvmc.net`
  - 実際の呼び出し先: `https://QL-api.adcsvmc.net/api/analyze`

## 2. 認証

JWT が必要な API は以下の形式です。

```http
Authorization: Bearer <token>
```

JWT を取得する方法は、現状 2 系統あります。

- 開発用ダミーログイン: `GET /api/test/login/:role`
- Google ログイン: `POST /api/auth/google`

## 3. レスポンス形式

現実装では、全 API が完全に同じレスポンス形式ではありません。

### 3.1 よくある成功レスポンス

```json
{
  "success": true,
  "message": "..."
}
```

または

```json
{
  "success": true,
  "data": { "...": "..." }
}
```

または、`/api/analyze` のように `success` を持たず、AI の結果 JSON をそのまま返す API もあります。

### 3.2 よくあるエラーレスポンス

```json
{
  "error": "エラー内容"
}
```

`success: false` は現実装では基本的に返していません。  
フロント側では `success` の有無だけでなく HTTP ステータスと `error` を見る前提で実装してください。

## 4. プロジェクト内で実際に使われている API

### 4.1 モバイルフロントエンドが現在使用中

#### POST `/api/analyze`

- 用途: Before / After 画像を Gemini で分析する
- 認証: 不要
- Content-Type: `multipart/form-data`
- Body:
  - `beforeImage`: File
  - `afterImage`: File
  - `metadata`: JSON 文字列

```json
{
  "subject": "算数",
  "topic": "計算",
  "parent_focus": "途中式"
}
```

- レスポンス: AI 分析結果を JSON でそのまま返却

```json
{
  "summary": "全体の要約",
  "score_breakdown": {
    "volume": 8,
    "process": 9,
    "carefulness": 7,
    "review": 6
  },
  "total_score": 81,
  "features": [
    {
      "type": "特徴種別",
      "location": "場所",
      "description": "詳細説明"
    }
  ],
  "suspicion_flag": false,
  "suspicion_reason": null,
  "feedback_to_child": "子供向けメッセージ",
  "feedback_to_parent": "親向けメッセージ"
}
```

- 使用箇所: `frontend/src/lib/gemini.ts`

### 4.2 開発テストポータルが現在使用中

以下は `backend/src/public/test.html` から利用されています。

#### GET `/api/test/login/:role`

- 用途: 開発用ダミーログイン
- 認証: 不要
- Path Parameter:
  - `role`: `child` または `parent`
- 備考:
  - `parent` のときは `PARENT`
  - それ以外は `CHILD`
- レスポンス例:

```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "user_id",
    "name": "テスト生徒",
    "role": "CHILD",
    "familyId": "family_id",
    "level": 1,
    "exp": 0,
    "currentPoints": 0,
    "grade": null,
    "specialty": null
  }
}
```

#### PUT `/api/users/profile`

- 用途: プロフィール更新
- 認証: JWT 必須
- 権限意図: Child / Parent
- Body:

```json
{
  "grade": "小1",
  "specialty": "算数"
}
```

- 追加で `name`, `avatarUrl` も更新可能
- レスポンス例:

```json
{
  "success": true,
  "message": "プロフィールを更新しました。",
  "data": {
    "id": "user_id",
    "grade": "小1",
    "specialty": "算数"
  }
}
```

#### GET `/api/users/invite-code`

- 用途: 家族の招待コード取得
- 認証: JWT 必須
- 実装上の権限: Parent のみ
- レスポンス例:

```json
{
  "success": true,
  "inviteCode": "a1b2c3"
}
```

#### POST `/api/users/join-family`

- 用途: 招待コードで家族連携
- 認証: JWT 必須
- 仕様意図: Child 向け
- Body:

```json
{
  "inviteCode": "a1b2c3"
}
```

- レスポンス例:

```json
{
  "success": true,
  "message": "テスト用ファミリー に参加しました！",
  "data": {
    "id": "user_id",
    "familyId": "family_id"
  }
}
```

#### POST `/api/quests/submit`

- 用途: クエスト提出と AI 分析、経験値とポイント付与
- 認証: JWT 必須
- 仕様意図: Child 向け
- Content-Type: `multipart/form-data`
- Body:
  - `beforeImage`: File
  - `afterImage`: File
  - `childId`: String
  - `familyId`: String
  - `subject`: String 任意
  - `topic`: String 任意
  - `parentFocus`: String 任意

- レスポンス例:

```json
{
  "success": true,
  "message": "レベルアップしました！ Lv.2",
  "isLevelUp": true,
  "newLevel": 2,
  "data": {
    "id": "quest_id",
    "childId": "user_id",
    "familyId": "family_id",
    "status": "COMPLETED",
    "earnedPoints": 32,
    "aiResult": {
      "score_breakdown": {
        "volume": 8,
        "process": 9,
        "carefulness": 7,
        "review": 6
      },
      "total_score": 81,
      "feedback_to_child": "よく頑張ったね"
    }
  }
}
```

#### POST `/api/quests/:id/bonus`

- 用途: 親が追加ボーナスを付与
- 認証: JWT 必須
- 実装上の権限: Parent のみ
- Body:

```json
{
  "bonusPoints": 10
}
```

- レスポンス例:

```json
{
  "success": true,
  "message": "子供に 10 分の追加ボーナスを付与しました！",
  "data": {
    "id": "quest_id",
    "earnedPoints": 42
  }
}
```

#### POST `/api/users/consume-points`

- 用途: ゲーム時間の消費
- 認証: JWT 必須
- 仕様意図: Child 向け
- Body:

```json
{
  "minutes": 15
}
```

- レスポンス例:

```json
{
  "success": true,
  "message": "15分 のロックを解除しました。",
  "currentPoints": 25
}
```

## 5. 実装済みだが、現行フロントでは未使用の公開 API

### POST `/api/auth/google`

- 用途: Google の `idToken` を検証して JWT を発行
- 認証: 不要
- Body:

```json
{
  "idToken": "google_id_token",
  "role": "CHILD"
}
```

- レスポンス例:

```json
{
  "success": true,
  "message": "ログインに成功しました。",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "user_id",
    "name": "ユーザー名",
    "role": "CHILD",
    "avatarUrl": "https://...",
    "familyId": "family_id"
  }
}
```

### GET `/api/quests`

- 用途: 家族のクエスト一覧取得
- 認証: JWT 必須
- 権限意図: Child / Parent
- レスポンス例:

```json
{
  "success": true,
  "data": [
    {
      "id": "quest_id",
      "familyId": "family_id",
      "status": "COMPLETED",
      "earnedPoints": 32,
      "child": {
        "name": "テスト生徒",
        "avatarUrl": null
      }
    }
  ]
}
```

### GET `/api/health`

- 用途: ヘルスチェック
- 認証: 不要
- レスポンス例:

```json
{
  "success": true,
  "message": "QuestLogic API稼働中",
  "ai": {
    "configured": true,
    "provider": "gemini"
  }
}
```

## 6. 現時点で API として未公開のもの

- `getQuestById` はコントローラ実装がありますが、ルート未接続のため公開 API ではありません。
- 旧設計書にあった以下の API は、現リポジトリでは未実装です。
  - `POST /api/user/parent/signup`
  - `POST /api/family/child`
  - `POST /api/auth/child/login`
  - `GET /api/family/members`
  - `POST /api/quest/start`
  - `POST /api/quest/finish`
  - `GET /api/quest/:id`
  - `GET /api/quest/list`
  - `POST /api/family/settings`
  - `POST /api/quest/approve`
  - `POST /api/quest/reject`
  - `POST /api/quest/correct`
  - `GET /api/energy/balance`
  - `POST /api/device/unlock`
  - `POST /api/device/status`

## 7. フロントエンド実装上の注意

- `/api/analyze` は `success` ラッパーがなく、AI 結果 JSON を直接返します。
- `/api/users/invite-code` は `data.inviteCode` ではなくトップレベルの `inviteCode` を返します。
- `/api/users/consume-points` は `data.currentPoints` ではなくトップレベルの `currentPoints` を返します。
- `/api/test/login/:role` の返却 `user` には、DB に存在するプロフィール項目がそのまま入ります。
- 画像分析は数秒から十数秒かかることがあるため、クライアント側タイムアウトは 30 秒以上を推奨します。
