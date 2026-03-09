# QuestLogic API 連携ガイドライン (v4.0)

このドキュメントは、2026-03-08 時点の `backend/src` 実装を基準に、フロントエンドが実際に連携できる API を整理したものです。  
v4.0 では、`GET /api/users/me` と `POST /api/family/devices` / `DELETE /api/family/devices/:id` の追加を反映し、アプリ内の固定値・モック配列を置き換えるための実運用手順を明記しました。

## 1. 監査対象と結論

監査対象:

- `backend/src/app.ts`
- `backend/src/routes/*.ts`
- `backend/src/controllers/*.ts`
- `backend/src/middlewares/auth.middleware.ts`
- `backend/src/prisma/schema.prisma`
- `backend/node_modules/.prisma/client/schema.prisma`
- `backend` ディレクトリでの `npm run build`

結論:

- ルート定義上、公開 API は合計 22 本あります。
- 新しく使うべき API は以下です。
  - `GET /api/users/me`
  - `POST /api/family/devices`
  - `DELETE /api/family/devices/:id`
- `GET /api/family/devices` は固定値ではなく DB 上の実データを返す想定に変わっています。
- `POST /api/quests/submit` は実際に Gemini 呼び出しと DB 更新を行う実装です。
- 一方で `POST /api/analyze` はまだ `app.ts` 内のダミー JSON を返す暫定実装です。
- `backend/src/prisma/schema.prisma` には `minutesPerPoint` / `isForceLocked` / `aiSettings` / `Device` / `Quest.createdAt` が定義されていますが、生成済み Prisma Client が古く、2026-03-08 時点で `npm run build` は失敗します。
- したがって本ドキュメントは「ルーター / コントローラー実装上の契約」をまとめたものです。ローカルリポジトリ単体では、Prisma Client 再生成前提の箇所があります。

## 2. v4.0 の更新ポイント

- `GET /api/users/me` を追加記載
  - 起動時 / 復帰時に最新の `level`, `exp`, `currentPoints` を同期する用途を明記
- `POST /api/family/devices` と `DELETE /api/family/devices/:id` を追加記載
  - デバイスの固定値配列を廃止し、DB の実データ管理に切り替える用途を明記
- `GET /api/quests` の返却項目を現行コードに合わせて修正
  - `topic` を含む
- `GET /api/family/game-status` の返却項目を現行コードに合わせて修正
  - `childName` を含む
- 既知の実装注意を更新
  - `PATCH /api/family/settings/ai` と CORS
  - Prisma schema と生成済み Client の不整合
  - `/api/analyze` がまだダミー実装

## 3. ベース情報

- 本番オリジン: `https://QL-api.adcsvmc.net`
- API プレフィックス: `/api`
- API ベース URL: `https://QL-api.adcsvmc.net/api`
- 開発テストポータル: `https://QL-api.adcsvmc.net/dev/test.html`
- テストポータル Basic 認証:
  - ID: `admin`
  - PW: `Quest2404`

フロントエンド設定の注意:

- `frontend/src/lib/api.ts` は `EXPO_PUBLIC_API_BASE_URL` に `/api` を含まない値を想定しています。
- 設定例:
  - `.env`: `EXPO_PUBLIC_API_BASE_URL=https://QL-api.adcsvmc.net`
  - 実際の呼び先: `https://QL-api.adcsvmc.net/api/...`

## 4. 認証と共通仕様

### 4.1 JWT

JWT 必須 API では以下の形式で送ります。

```http
Authorization: Bearer <token>
```

JWT ペイロードには少なくとも以下が入る前提です。

```json
{
  "userId": "user_id",
  "role": "PARENT",
  "familyId": "family_id"
}
```

### 4.2 Basic 認証

以下は Basic 認証必須です。

- `GET /api/test/login/:role`
- `GET /dev/test.html`

### 4.3 共通レスポンス傾向

成功レスポンスは完全統一ではありません。主に以下の形です。

```json
{
  "success": true,
  "message": "..."
}
```

```json
{
  "success": true,
  "data": {}
}
```

エラーは主に以下です。

```json
{
  "error": "エラー内容"
}
```

例外:

- `POST /api/analyze` は `success` ラッパーなしで JSON を直接返します。
- 一部 API は `data` を使わず、`inviteCode`, `earnedPoints`, `remainingPoints` などをトップレベルで返します。

### 4.4 CORS 注意

`app.ts` の CORS 設定は `GET`, `POST`, `PUT`, `DELETE` だけを許可しています。  
そのため、ブラウザから別オリジンで `PATCH /api/family/settings/ai` を叩くと preflight 失敗の可能性があります。

## 5. 実装済み API 一覧

| Method | Path | 認証 | ロール | 状態 | 備考 |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/health` | 不要 | 全員 | 実装あり | ヘルスチェック |
| GET | `/api/test/login/:role` | Basic | 全員 | 実装あり | 開発用ダミーログイン |
| POST | `/api/auth/google` | 不要 | 全員 | 実装あり | Google `idToken` 検証 |
| POST | `/api/analyze` | JWT | 全員 | 暫定実装 | ダミー JSON を返却 |
| GET | `/api/users/me` | JWT | Parent / Child | 実装あり | 最新ユーザー状態取得 |
| GET | `/api/users/invite-code` | JWT | Parent | 実装あり | 招待コード取得 |
| POST | `/api/users/join-family` | JWT | Child | 実装あり | 招待コードで家族参加 |
| POST | `/api/users/consume-points` | JWT | Child | 実装あり | ポイント消費 |
| PUT | `/api/users/profile` | JWT | Parent / Child | 実装あり | プロフィール更新 |
| GET | `/api/quests` | JWT | Parent / Child | 実装あり | 家族のクエスト一覧 |
| POST | `/api/quests/submit` | JWT | Child | 実装あり | Gemini 分析 + DB 保存 |
| POST | `/api/quests/:id/bonus` | JWT | Parent | 実装あり | 追加ボーナス付与 |
| GET | `/api/family/settings` | JWT | Parent | 実装あり | 家族設定取得 |
| PUT | `/api/family/settings` | JWT | Parent | 実装あり | `minutesPerPoint` 更新 |
| GET | `/api/family/game-status` | JWT | Parent | 実装あり | 残り時間取得 |
| POST | `/api/family/lock` | JWT | Parent | 実装あり | 強制ロック切替 |
| POST | `/api/family/extend-time` | JWT | Parent | 実装あり | 時間延長 |
| GET | `/api/family/settings/ai` | JWT | Parent | 実装あり | AI 設定取得 |
| PATCH | `/api/family/settings/ai` | JWT | Parent | 実装あり | AI 設定部分更新 |
| GET | `/api/family/devices` | JWT | Parent | 実装あり | 実デバイス一覧取得 |
| POST | `/api/family/devices` | JWT | Parent | 実装あり | デバイス追加 |
| DELETE | `/api/family/devices/:id` | JWT | Parent | 実装あり | デバイス削除 |

## 6. API 詳細

### 6.1 ヘルスチェック

#### GET `/api/health`

- 用途: サーバー稼働確認
- 認証: 不要

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

### 6.2 開発用ログイン

#### GET `/api/test/login/:role`

- 用途: 開発用ダミーログイン
- 認証: Basic 認証必須
- Path Parameter:
  - `role`: `parent` のとき `PARENT`、それ以外は `CHILD`
- 動作:
  - Family が 1 件も無ければ作成
  - 指定ロールのユーザーが無ければ作成
  - 24 時間有効の JWT を返却

```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "user_id",
    "name": "テスト生徒",
    "role": "CHILD",
    "familyId": "family_id"
  }
}
```

### 6.3 認証

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

- 備考:
  - `idToken` は必須
  - 新規ユーザー時のみ `role` が利用されます
  - 新規ユーザー時は Family も自動作成されます

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

### 6.4 Analyze API

#### POST `/api/analyze`

- 用途: Before / After 画像の AI 分析用エンドポイント
- 認証: JWT 必須
- Content-Type: `multipart/form-data`
- Body:
  - `beforeImage`: File
  - `afterImage`: File
  - `metadata`: JSON 文字列 任意
- 現状:
  - `app.ts` にダミーレスポンスが直書きされています
  - 実 DB 更新は行いません
  - アプリの実運用ロジックとしては `POST /api/quests/submit` を使う方が現実的です

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

### 6.5 Users API

以下はすべて JWT 必須です。

#### GET `/api/users/me`

- 用途: アプリ起動時 / バックグラウンド復帰時の最新ユーザー状態同期
- 権限: Parent / Child
- 用途上の推奨:
  - ローカルストレージの古い `level`, `exp`, `currentPoints` を信頼しない
  - 初期表示前にこの API で再同期する

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "たろう",
    "role": "CHILD",
    "level": 3,
    "exp": 245,
    "currentPoints": 18,
    "grade": "小3",
    "specialty": "算数",
    "avatarUrl": "https://...",
    "familyId": "family_id"
  }
}
```

#### GET `/api/users/invite-code`

- 用途: 親が家族招待コードを取得
- 権限: Parent のみ

```json
{
  "success": true,
  "inviteCode": "a1b2c3"
}
```

#### POST `/api/users/join-family`

- 用途: 子供が招待コードで家族に参加
- 権限: Child のみ
- Body:

```json
{
  "inviteCode": "a1b2c3"
}
```

- 備考:
  - 現実装では、既存の `familyId` があっても上書き更新されます

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

- 用途: 子供がポイントを消費
- 権限: Child のみ
- Body:

```json
{
  "consumePoints": 15
}
```

- レスポンス:

```json
{
  "success": true,
  "remainingPoints": 25,
  "remainingMinutes": 50,
  "minutesPerPoint": 2
}
```

#### PUT `/api/users/profile`

- 用途: プロフィール更新
- 権限: Parent / Child
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

### 6.6 Quests API

以下はすべて JWT 必須です。

#### GET `/api/quests`

- 用途: JWT 内の `familyId` に属するクエスト一覧取得
- 権限: Parent / Child
- 並び順: `createdAt desc`
- 返却項目:
  - `id`
  - `familyId`
  - `status`
  - `earnedPoints`
  - `createdAt`
  - `beforeImageUrl`
  - `afterImageUrl`
  - `subject`
  - `topic`
  - `aiResult`
  - `child.name`
  - `child.avatarUrl`

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
      "topic": "分数",
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

#### POST `/api/quests/submit`

- 用途: クエスト提出、Gemini 分析、ポイント / EXP / レベル更新
- 権限: Child のみ
- Content-Type: `multipart/form-data`
- Body:
  - `beforeImage`: File 必須
  - `afterImage`: File 必須
  - `subject`: String 任意
  - `topic`: String 任意
  - `userName`: String 任意
- 備考:
  - `childId` と `familyId` は body ではなく JWT から取得
  - `earnedPoints = floor(total_score / 5)`
  - `earnedMinutes = earnedPoints * minutesPerPoint`
  - `newLevel = floor(newExp / 100) + 1`

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

- 用途: 親が家族内クエストへ追加ボーナスを付与
- 権限: Parent のみ
- Body:

```json
{
  "bonusPoints": 10
}
```

- 備考:
  - `quest.familyId !== JWT.familyId` の場合は `403`
  - 実装上、負数チェックは入っていません

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

### 6.7 Family API

以下はすべて JWT 必須かつ Parent 専用です。  
`familyId` は URL パラメータではなく JWT から取得します。

#### GET `/api/family/settings`

- 用途: 家族設定取得
- レスポンス:

```json
{
  "success": true,
  "familyId": "family_id",
  "minutesPerPoint": 2,
  "updatedAt": "2026-03-06T00:00:00.000Z"
}
```

#### PUT `/api/family/settings`

- 用途: `minutesPerPoint` 更新
- Body:

```json
{
  "minutesPerPoint": 3
}
```

- バリデーション:
  - 1 以上 60 以下の整数

```json
{
  "success": true,
  "minutesPerPoint": 3,
  "updatedAt": "2026-03-06T00:00:00.000Z"
}
```

#### GET `/api/family/game-status`

- 用途: 家族内の子供ポイント合計から残り時間を算出
- 現実装:
  - `gameRemainingMinutes = 子供全員の currentPoints 合計 * minutesPerPoint`
  - `smartphoneRemainingMinutes` は同値
  - `childName` は先頭の子供名、いなければ `"お子様"`

```json
{
  "success": true,
  "gameRemainingMinutes": 80,
  "smartphoneRemainingMinutes": 80,
  "isForceLocked": false,
  "childName": "テスト生徒"
}
```

#### POST `/api/family/lock`

- 用途: 強制ロック / 解除
- Body:

```json
{
  "locked": true
}
```

```json
{
  "success": true,
  "locked": true
}
```

#### POST `/api/family/extend-time`

- 用途: 家族内の子供全員へポイント加算して残り時間を延長
- Body:

```json
{
  "minutes": 30
}
```

- 現実装:
  - `pointsToAdd = ceil(minutes / minutesPerPoint)`
  - 家族内の全 CHILD に同じポイントを付与

```json
{
  "success": true,
  "newGameRemainingMinutes": 110,
  "newSmartphoneRemainingMinutes": 110
}
```

#### GET `/api/family/settings/ai`

- 用途: AI 設定取得
- 備考:
  - DB に未設定ならデフォルト値を返します

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
- Body 例:

```json
{
  "strictness": 4,
  "ng": {
    "imageReuse": true
  }
}
```

- 現実装:
  - トップレベルは浅いマージ
  - `ng` だけはネストマージ

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

- 用途: 家族に紐づく実デバイス一覧取得
- モック配列の代替として使うべき API

```json
{
  "success": true,
  "data": [
    {
      "id": "device_id",
      "name": "Nintendo Switch"
    }
  ]
}
```

#### POST `/api/family/devices`

- 用途: デバイス追加
- 権限: Parent のみ
- Body:

```json
{
  "name": "Nintendo Switch"
}
```

- 備考:
  - DB に `familyId` 付きで作成されます
  - 現実装は重複チェックなしです

```json
{
  "success": true,
  "data": {
    "id": "device_id",
    "name": "Nintendo Switch",
    "familyId": "family_id"
  }
}
```

#### DELETE `/api/family/devices/:id`

- 用途: デバイス削除
- 権限: Parent のみ
- 備考:
  - 自分の family に属するデバイスだけ削除可能

```json
{
  "success": true,
  "message": "デバイスを削除しました。"
}
```

## 7. フロントエンド実装上の推奨

- アプリ起動時とバックグラウンド復帰時に `GET /api/users/me` を呼び、`level`, `exp`, `currentPoints` を再同期してください。
- デバイス一覧の固定値は廃止し、`GET /api/family/devices` を表示元にしてください。
- デバイス追加 / 削除は `POST /api/family/devices` と `DELETE /api/family/devices/:id` に統一してください。
- `family` 系 API は `/:familyId/...` ではなく、JWT の `familyId` を前提とする `/api/family/...` を使用してください。
- `POST /api/quests/submit` では `childId` / `familyId` を body に入れないでください。
- `POST /api/users/consume-points` の body 名は `minutes` ではなく `consumePoints` です。
- `PATCH /api/family/settings/ai` をブラウザから直接使う場合は CORS 設定の修正が必要です。
- `/api/analyze` はまだ固定レスポンスです。実運用の学習提出フローでは `POST /api/quests/submit` を優先してください。

## 8. 既知の不整合と注意点

- `backend/src/prisma/schema.prisma` と生成済み Prisma Client が同期していません。
- 2026-03-08 時点の `npm run build` では以下が原因で失敗します。
  - `Family.minutesPerPoint`
  - `Family.isForceLocked`
  - `Family.aiSettings`
  - `Device` モデル
  - `Quest.createdAt`
- ソース上では新 API 群は実装済みですが、ローカルリポジトリでビルドを通すには Prisma Client の再生成が必要です。
- `POST /api/family/extend-time` のエラーメッセージは「正の整数」と言っていますが、実コード上は整数チェックまではしていません。
- `POST /api/quests/:id/bonus` は `bonusPoints` が負数でも通る実装になっています。
- `POST /api/family/devices` は空文字以外の文字列なら保存でき、トリムや重複チェックはありません。

## 9. 未公開 / 未実装 / パス変更あり

以下は旧設計書やフロント要望に存在したものの、現行 `backend/src` では公開されていません。

- `POST /api/user/parent/signup`
- `POST /api/family/child`
- `POST /api/auth/child/login`
- `GET /api/family/members`
- `POST /api/quest/start`
- `POST /api/quest/finish`
- `GET /api/quest/:id`
- `GET /api/quest/list`
- `GET /api/quests/:id`
- `POST /api/quest/approve`
- `POST /api/quest/reject`
- `POST /api/quest/correct`
- `GET /api/energy/balance`
- `POST /api/device/unlock`
- `POST /api/device/status`

パス変更あり:

- `GET /api/family/:familyId/game-status`
  - 実装済みなのは `GET /api/family/game-status`
- `POST /api/family/:familyId/lock`
  - 実装済みなのは `POST /api/family/lock`
- `POST /api/family/:familyId/extend-time`
  - 実装済みなのは `POST /api/family/extend-time`
- `GET /api/settings/ai`
  - 実装済みなのは `GET /api/family/settings/ai`
- `PATCH /api/settings/ai`
  - 実装済みなのは `PATCH /api/family/settings/ai`
- `GET /api/family/:familyId/devices`
  - 実装済みなのは `GET /api/family/devices`
- `POST /api/family/settings`
  - 実装済みなのは `PUT /api/family/settings`
