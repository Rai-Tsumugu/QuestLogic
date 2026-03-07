# QuestLogic API 連携ガイドライン (v3.0)

このドキュメントは、現時点の `backend/src` 実装を基準に整理した API ガイドです。  
v2.0 からの主な更新点は、`family` 系 API の追加、`/api/analyze` の認証要件変更、`/api/test/login/:role` の Basic 認証必須化、`quests` / `users` 系レスポンスの変更です。

## 1. ベース情報

- 本番オリジン: `https://QL-api.adcsvmc.net`
- API プレフィックス: `/api`
- API ルート: `https://QL-api.adcsvmc.net/api`
- 開発テストポータル: `https://QL-api.adcsvmc.net/dev/test.html`
- テストポータル Basic 認証: ID `admin` / PW `Quest2404`

### フロントエンド設定の注意

- `frontend/src/lib/api.ts` は `EXPO_PUBLIC_API_BASE_URL` に `/api` を含まない値を想定しています。
- 例:
  - `.env`: `EXPO_PUBLIC_API_BASE_URL=https://QL-api.adcsvmc.net`
  - 実際の API 呼び出し先: `https://QL-api.adcsvmc.net/api/...`

## 2. 認証

### 2.1 JWT

JWT が必要な API は、以下の形式でトークンを送ってください。

```http
Authorization: Bearer <token>
```

### 2.2 Basic 認証

以下は Basic 認証が必要です。

- `GET /dev/test.html`
- `GET /api/test/login/:role`

Basic 認証情報:

```text
ID: admin
PW: Quest2404
```

### 2.3 JWT 取得方法

- 開発用ダミーログイン: `GET /api/test/login/:role`
- Google ログイン: `POST /api/auth/google`

## 3. レスポンス形式

現実装では、全 API が完全に同じ形式ではありません。

### 3.1 一般的な成功レスポンス

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

### 3.2 一般的なエラーレスポンス

```json
{
  "error": "エラー内容"
}
```

### 3.3 例外

- `/api/analyze` は `success` ラッパーなしで JSON を直接返します。
- 一部 API は `data` ではなく、トップレベルに `inviteCode`, `earnedMinutes`, `remainingPoints` などを返します。

## 4. API 一覧

### 4.1 ヘルスチェック

#### GET `/api/health`

- 用途: サーバー稼働確認
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

### 4.2 認証・開発用 API

#### GET `/api/test/login/:role`

- 用途: 開発用ダミーログイン
- 認証: Basic 認証必須
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

#### POST `/api/auth/google`

- 用途: Google `idToken` を検証し、QuestLogic 用 JWT を発行
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

### 4.3 Analyze API

#### POST `/api/analyze`

- 用途: Before / After 画像の AI 分析
- 認証: JWT 必須
- Content-Type: `multipart/form-data`
- Body:
  - `beforeImage`: File
  - `afterImage`: File
  - `metadata`: JSON 文字列 任意
- レスポンス:
  - `success` ラッパーなし
  - 現在の `app.ts` 実装は暫定ダミー JSON を返却

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
  "features": [],
  "suspicion_flag": false,
  "suspicion_reason": null,
  "feedback_to_child": "子供向けメッセージ",
  "feedback_to_parent": "親向けメッセージ"
}
```

### 4.4 Users API

以下はすべて JWT 必須です。

#### PUT `/api/users/profile`

- 用途: プロフィール更新
- 権限: Child / Parent
- Body:

```json
{
  "grade": "小1",
  "specialty": "算数",
  "name": "たろう",
  "avatarUrl": "https://..."
}
```

- すべて任意項目です
- レスポンス例:

```json
{
  "success": true,
  "message": "プロフィールを更新しました。",
  "data": {
    "id": "user_id",
    "grade": "小1",
    "specialty": "算数",
    "name": "たろう",
    "avatarUrl": "https://..."
  }
}
```

#### GET `/api/users/invite-code`

- 用途: 招待コード取得
- 権限: Parent のみ
- レスポンス例:

```json
{
  "success": true,
  "inviteCode": "a1b2c3"
}
```

#### POST `/api/users/join-family`

- 用途: 招待コードで家族連携
- 権限: Child のみ
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

#### POST `/api/users/consume-points`

- 用途: ポイント消費
- 権限: Child のみ
- Body:

```json
{
  "consumePoints": 15
}
```

- レスポンス例:

```json
{
  "success": true,
  "remainingPoints": 25,
  "remainingMinutes": 50,
  "minutesPerPoint": 2
}
```

### 4.5 Quests API

以下はすべて JWT 必須です。

#### POST `/api/quests/submit`

- 用途: クエスト提出、Gemini 分析、ポイントと EXP 付与
- 権限: Child のみ
- Content-Type: `multipart/form-data`
- Body:
  - `beforeImage`: File
  - `afterImage`: File
  - `subject`: String 任意
  - `topic`: String 任意
- 備考:
  - `childId` と `familyId` は送らず、JWT から取得します
- レスポンス例:

```json
{
  "success": true,
  "message": "AI分析が完了し、ポイントを獲得しました！",
  "isLevelUp": false,
  "newLevel": 1,
  "data": {
    "id": "quest_id",
    "childId": "user_id",
    "familyId": "family_id",
    "status": "COMPLETED",
    "aiResult": {
      "score_breakdown": {
        "volume": 8,
        "process": 9,
        "carefulness": 7,
        "review": 6
      },
      "total_score": 81,
      "feedback_to_child": "子供への優しいメッセージ",
      "feedback_to_parent": "親へのメッセージ"
    }
  },
  "earnedPoints": 16,
  "earnedMinutes": 32,
  "currentPoints": 40,
  "currentMinutes": 80,
  "minutesPerPoint": 2
}
```

#### POST `/api/quests/:id/bonus`

- 用途: 親が追加ボーナスを付与
- 権限: Parent のみ
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
  "message": "子供に 10 ポイントの追加ボーナスを付与しました！",
  "earnedPoints": 26,
  "earnedMinutes": 52,
  "currentPoints": 50,
  "currentMinutes": 100,
  "minutesPerPoint": 2
}
```

#### GET `/api/quests`

- 用途: 家族のクエスト一覧取得
- 権限: Child / Parent
- レスポンス例:

```json
{
  "success": true,
  "data": [
    {
      "id": "quest_id",
      "familyId": "family_id",
      "status": "COMPLETED",
      "earnedPoints": 16,
      "createdAt": "2026-03-06T00:00:00.000Z",
      "beforeImageUrl": "uploads/before.jpg",
      "afterImageUrl": "uploads/after.jpg",
      "subject": "算数",
      "aiResult": {
        "feedback_to_parent": "親へのメッセージ"
      },
      "child": {
        "name": "テスト生徒",
        "avatarUrl": null
      }
    }
  ]
}
```

### 4.6 Family API

以下はすべて JWT 必須です。

#### GET `/api/family/settings`

- 用途: 家族設定の取得
- 権限: Parent のみ
- レスポンス例:

```json
{
  "success": true,
  "familyId": "family_id",
  "minutesPerPoint": 2,
  "updatedAt": "2026-03-06T00:00:00.000Z"
}
```

#### PUT `/api/family/settings`

- 用途: 1ポイントあたりの分数設定を更新
- 権限: Parent のみ
- Body:

```json
{
  "minutesPerPoint": 3
}
```

- バリデーション:
  - 1〜60 の整数
- レスポンス例:

```json
{
  "success": true,
  "minutesPerPoint": 3,
  "updatedAt": "2026-03-06T00:00:00.000Z"
}
```

#### GET `/api/family/game-status`

- 用途: 家族内の子供ポイント合計から残りゲーム時間を取得
- 権限: Parent のみ
- レスポンス例:

```json
{
  "success": true,
  "gameRemainingMinutes": 80,
  "smartphoneRemainingMinutes": 80,
  "isForceLocked": false
}
```

#### POST `/api/family/lock`

- 用途: 強制ロック / 解除
- 権限: Parent のみ
- Body:

```json
{
  "locked": true
}
```

- レスポンス例:

```json
{
  "success": true,
  "locked": true
}
```

#### GET `/api/family/settings/ai`

- 用途: AI 設定取得
- 権限: Parent のみ
- レスポンス例:

```json
{
  "success": true,
  "data": {
    "strictness": 3,
    "focus": 2,
    "ng": {
      "missingProcess": true,
      "workTimeMismatch": false,
      "imageReuse": false
    }
  }
}
```

#### PATCH `/api/family/settings/ai`

- 用途: AI 設定部分更新
- 権限: Parent のみ
- Body 例:

```json
{
  "strictness": 4,
  "ng": {
    "imageReuse": true
  }
}
```

- レスポンス例:

```json
{
  "success": true,
  "data": {
    "strictness": 4,
    "focus": 2,
    "ng": {
      "missingProcess": true,
      "workTimeMismatch": false,
      "imageReuse": true
    }
  }
}
```

#### GET `/api/family/devices`

- 用途: デバイス一覧取得
- 権限: Parent のみ
- レスポンス例:

```json
{
  "success": true,
  "data": [
    {
      "id": "device_id",
      "name": "Quest Gate"
    }
  ]
}
```

## 5. v2.0 からの変更点

- `/api/analyze` は無認証ではなく、JWT 必須になりました。
- `/api/analyze` は現時点でダミー JSON を返す暫定実装です。
- `/api/test/login/:role` は Basic 認証必須になりました。
- `/api/users/join-family` と `/api/users/consume-points` は Child 限定ガードが追加されました。
- `/api/users/consume-points` のリクエストボディは `minutes` ではなく `consumePoints` です。
- `/api/quests/submit` は `childId` / `familyId` を body で受け取らず、JWT から取得します。
- `/api/quests/submit` の報酬仕様が変わり、`earnedPoints`, `earnedMinutes`, `currentPoints`, `currentMinutes`, `minutesPerPoint` を返します。
- `/api/quests/:id/bonus` は同一家族チェックを行い、レスポンスも `data` 返却ではなくポイント / 分数情報返却に変わりました。
- `GET /api/quests` は `createdAt`, 画像 URL, `subject`, `aiResult`, `child` 情報を含む一覧返却に変わりました。
- `family` 系 API が追加されました。

## 6. フロントエンド実装上の注意

- 現在の `frontend/src/lib/gemini.ts` は `/api/analyze` 呼び出し時に JWT を付けていません。v3.0 のバックエンド仕様に合わせるには `Authorization` ヘッダー追加が必要です。
- `backend/src/public/test.html` は `quests/submit` に `childId` と `familyId` をまだ送っていますが、バックエンド側では現在それらを参照していません。
- `consume-points` を呼ぶクライアントは、`minutes` ではなく `consumePoints` を送ってください。
- `family/settings` の `minutesPerPoint` は 1〜60 の整数制約があります。

## 7. 未公開 / 未実装の旧設計 API

旧設計書にあった以下の API は、現リポジトリでは未実装です。

- `POST /api/user/parent/signup`
- `POST /api/family/child`
- `POST /api/auth/child/login`
- `GET /api/family/members`
- `POST /api/quest/start`
- `POST /api/quest/finish`
- `GET /api/quest/:id`
- `GET /api/quest/list`
- `POST /api/family/settings` は未実装で、実装済みなのは `PUT /api/family/settings`
- `POST /api/quest/approve`
- `POST /api/quest/reject`
- `POST /api/quest/correct`
- `GET /api/energy/balance`
- `POST /api/device/unlock`
- `POST /api/device/status`
