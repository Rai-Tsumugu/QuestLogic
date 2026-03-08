# QuestLogic API 連携ガイドライン (v3.1)

このドキュメントは、現時点の `backend/src` 実装を基準に整理した API ガイドです。  
v3.1 では、フロントエンド要望に挙がっていた `family` / `quests` / `settings` / `devices` 系 API の実装有無を再監査し、実パス・実レスポンス・未実装項目・Prisma スキーマ不整合の注意点を追記しました。

## v3.1 監査メモ (2026-03-08)

今回の監査は以下を根拠に行っています。

- `backend/src/routes/*.ts`
- `backend/src/controllers/*.ts`
- 生成済み Prisma schema: `backend/node_modules/.prisma/client/schema.prisma`
- `backend` ディレクトリでの `npm run build`

重要な注意:

- 現在の `backend` は `npm run build` が失敗します。
- 失敗理由は、コントローラーが参照している Prisma フィールド / モデルと、生成済み Prisma Client の型が一致していないためです。
- 特に `Family.minutesPerPoint`, `Family.isForceLocked`, `Family.aiSettings`, `Device`, `Quest.createdAt` の不整合が確認されました。
- そのため以下の判定では、「ルーター定義があるか」と「現行 Prisma スキーマで成立しているか」を分けて読んでください。

### グループA: ゲーム状態管理

- `GET /api/family/:familyId/game-status`
  - 判定: 指定 URL は未実装
  - 代替実装: `GET /api/family/game-status`
  - 認証: `Authorization: Bearer <token>` 必須 + Parent のみ
  - 実レスポンス: `success`, `gameRemainingMinutes`, `smartphoneRemainingMinutes`, `isForceLocked`
  - 備考: `familyId` は URL パラメータではなく JWT から取得する設計です。`family.routes.ts` にも、`:familyId` 版はセキュリティ上の理由で公開しない旨のコメントがあります。
  - 実装予定: `:familyId` 版を追加する明示的な記述は見当たりません。エイリアス追加だけなら 0.5 日、`familyId` 一致検証とテスト込みなら 1 日程度です。
- `POST /api/family/:familyId/lock`
  - 判定: 指定 URL は未実装
  - 代替実装: `POST /api/family/lock`
  - 認証: `Authorization: Bearer <token>` 必須 + Parent のみ
  - 実リクエスト: Body は `locked: boolean`
  - 実レスポンス: `success`, `locked`
  - 実装予定: `:familyId` 版追加の記述は見当たりません。工数は 0.5 日から 1 日程度です。
- `POST /api/family/:familyId/extend-time`
  - 判定: 指定 URL は未実装
  - 代替実装: `POST /api/family/extend-time`
  - 認証: `Authorization: Bearer <token>` 必須 + Parent のみ
  - 実リクエスト: Body は `minutes: number`
  - 実レスポンス: `success`, `newGameRemainingMinutes`, `newSmartphoneRemainingMinutes`
  - 実装予定: `:familyId` 版追加の記述は見当たりません。工数は 0.5 日から 1 日程度です。
- グループA 共通の注意:
  - ルーター / コントローラー上は実装があります。
  - ただし現行 Prisma Client には `minutesPerPoint` / `isForceLocked` が無く、`npm run build` は失敗します。デプロイ済み環境で別 schema を使っている可能性はありますが、現リポジトリだけを見る限り動作保証はできません。

### グループB: クエスト詳細情報

- `GET /api/quests`
  - 判定: 実装あり
  - 認証: `Authorization: Bearer <token>` 必須。Parent / Child とも利用可能
  - 実レスポンスに含まれるもの:
    - `beforeImageUrl`
    - `afterImageUrl`
    - `subject`
    - `createdAt`
    - `aiResult`
    - `child.name`
    - `child.avatarUrl`
  - `aiResult.feedback_to_parent` について:
    - `aiResult` は JSON を丸ごと返す実装です。
    - そのため保存済み JSON に `feedback_to_parent` があれば、そのままスネークケースで返ります。
  - 含まれないもの:
    - `topic` は `getQuests` の `select` に入っていないため返りません。
  - Prisma 注意:
    - コントローラーは `createdAt` を返す前提ですが、生成済み Prisma schema の `Quest` には `createdAt` が無く `startedAt` / `finishedAt` です。
    - 逆に生成済み schema には `topic` があるのに、`getQuests` は返していません。
    - この不整合のため、現リポジトリでは `npm run build` が失敗します。
- `GET /api/quests/:id`
  - 判定: 未実装
  - 実装予定: 明示的な予定は見当たりません
  - 工数見込み:
    - 既存一覧 API を流用して家族所属チェックを付けるだけなら 0.5 日から 1 日
    - Prisma schema / migration / 型再生成まで合わせるなら 1 日から 1.5 日

### グループC: 設定・デバイス管理

- `GET /api/settings/ai`
  - 判定: 指定 URL は未実装
  - 代替実装: `GET /api/family/settings/ai`
  - 認証: `Authorization: Bearer <token>` 必須 + Parent のみ
  - 実レスポンス: `success`, `data.strictness`, `data.focus`, `data.ng.missingProcess`, `data.ng.workTimeMismatch`, `data.ng.imageReuse`
  - 実装予定: `/api/settings/ai` 直下に切り出す計画は確認できません。エイリアス追加は 0.5 日程度です。
- `PATCH /api/settings/ai`
  - 判定: 指定 URL は未実装
  - 代替実装: `PATCH /api/family/settings/ai`
  - 認証: `Authorization: Bearer <token>` 必須 + Parent のみ
  - 実リクエスト: AI 設定の部分更新
  - 実レスポンス: `success`, `data`
  - 実装予定: `/api/settings/ai` 直下に切り出す計画は確認できません。エイリアス追加は 0.5 日程度です。
- `GET /api/family/:familyId/devices`
  - 判定: 指定 URL は未実装
  - 代替実装: `GET /api/family/devices`
  - 認証: `Authorization: Bearer <token>` 必須 + Parent のみ
  - 実レスポンス: `success`, `data: [{ id, name }]`
  - 実装予定: `:familyId` 版追加の記述は見当たりません。工数は 0.5 日から 1 日程度です。
- グループC 共通の注意:
  - `family.controller.ts` には実装があります。
  - ただし生成済み Prisma schema には `aiSettings` も `Device` モデルも存在せず、ここも `npm run build` 失敗箇所です。

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
- 備考:
  - 実装済みなのは一覧 API のみで、`GET /api/quests/:id` は未公開です。
  - `topic` は現在の一覧レスポンスに含まれません。
  - `aiResult` は JSON を丸ごと返すため、`feedback_to_parent` は内部キーのスネークケースのまま返ります。
  - コントローラーは `createdAt` を返す前提ですが、現リポジトリの生成済み Prisma Client とは不整合があります。
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

フロントエンド要望にあった `/:familyId/...` や `/api/settings/ai` 直下の URL は公開されていません。  
現実装で公開されているのは、以下の `/api/family/...` ルートです。

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
- 備考:
  - 要望にあった `GET /api/family/:familyId/game-status` ではなく、この URL が実装されています。
  - `familyId` は URL パラメータではなく JWT から取得します。
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
- 備考:
  - 要望にあった `POST /api/family/:familyId/lock` ではなく、この URL が実装されています。
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
- 備考:
  - 要望にあった `GET /api/settings/ai` は未公開で、実装済みなのはこの URL です。
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
- 備考:
  - 要望にあった `PATCH /api/settings/ai` は未公開で、実装済みなのはこの URL です。
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
- 備考:
  - 要望にあった `GET /api/family/:familyId/devices` ではなく、この URL が実装されています。
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

- 現在の `frontend/src/lib/gemini.ts` は `/api/analyze` 呼び出し時に JWT を付けていません。v3.1 のバックエンド仕様に合わせるには `Authorization` ヘッダー追加が必要です。
- `backend/src/public/test.html` は `quests/submit` に `childId` と `familyId` をまだ送っていますが、バックエンド側では現在それらを参照していません。
- `consume-points` を呼ぶクライアントは、`minutes` ではなく `consumePoints` を送ってください。
- `family/settings` の `minutesPerPoint` は 1〜60 の整数制約があります。
- `family` 系の実装済み URL は `/:familyId/...` ではなく、JWT の `familyId` を使う `/api/family/...` 形式です。
- `GET /api/quests` では `topic` は返らず、個別取得用の `GET /api/quests/:id` も未実装です。
- `PATCH /api/family/settings/ai` は Express ルーター上は存在しますが、`app.ts` の CORS `methods` に `PATCH` が含まれていないため、別オリジンのブラウザ実行では preflight 失敗の可能性があります。
- 現在のリポジトリでは Prisma schema とコントローラーの不整合により `npm run build` が失敗します。動作確認前に schema / migration / `prisma generate` の同期が必要です。

## 7. 未公開 / 未実装 API

旧設計書またはフロントエンド要望にあった以下の API / URL は、現リポジトリでは未実装です。

- `POST /api/user/parent/signup`
- `POST /api/family/child`
- `POST /api/auth/child/login`
- `GET /api/family/members`
- `POST /api/quest/start`
- `POST /api/quest/finish`
- `GET /api/quest/:id`
- `GET /api/quest/list`
- `GET /api/quests/:id`
- `GET /api/family/:familyId/game-status` は未公開で、実装済みなのは `GET /api/family/game-status`
- `POST /api/family/:familyId/lock` は未公開で、実装済みなのは `POST /api/family/lock`
- `POST /api/family/:familyId/extend-time` は未公開で、実装済みなのは `POST /api/family/extend-time`
- `GET /api/settings/ai` は未公開で、実装済みなのは `GET /api/family/settings/ai`
- `PATCH /api/settings/ai` は未公開で、実装済みなのは `PATCH /api/family/settings/ai`
- `GET /api/family/:familyId/devices` は未公開で、実装済みなのは `GET /api/family/devices`
- `POST /api/family/settings` は未実装で、実装済みなのは `PUT /api/family/settings`
- `POST /api/quest/approve`
- `POST /api/quest/reject`
- `POST /api/quest/correct`
- `GET /api/energy/balance`
- `POST /api/device/unlock`
- `POST /api/device/status`
