# API データ形式仕様書 (API Data Formats)

本ドキュメントは、QuestLogic システムにおける最新のAPIデータ形式（Request/Response Schema）を定義します。
全てのAPIは `application/json` を使用し、認証が必要なエンドポイントはヘッダーに `Authorization: Bearer <token>` を要求します。

---

## 1. 認証とユーザー管理 (Auth & User Management)

### 1.1 Googleログイン (Google Login)
* **Endpoint**: `POST /api/auth/google`
* **Access**: Public
* **Description**: GoogleのidTokenを検証し、QuestLogic独自のJWTを発行します。新規ユーザーの場合はアカウント（および親の場合はFamily）が自動作成されます。
* **Request Body**:
    ```json
    {
      "idToken": "google_oauth_id_token_...",
      "role": "PARENT" // または "CHILD" (新規登録時のみ使用)
    }
    ```
* **Response Body**:
    ```json
    {
      "success": true,
      "message": "ログインに成功しました。",
      "token": "eyJhbGciOiJIUzI1...",
      "user": {
        "id": "user_uuid",
        "name": "ユーザー名",
        "role": "PARENT",
        "avatarUrl": "https://...",
        "familyId": "family_uuid"
      }
    }
    ```

### 1.2 ユーザー情報取得 (Get Current User)
* **Endpoint**: `GET /api/users/me`
* **Access**: Auth User (Parent / Child)
* **Response Body**:
    ```json
    {
      "success": true,
      "data": {
        "id": "user_uuid",
        "name": "たろう",
        "role": "CHILD",
        "level": 3,
        "exp": 245,
        "currentPoints": 18,
        "currentMinutes": 36,
        "minutesPerPoint": 2,
        "grade": "小3",
        "specialty": "算数",
        "avatarUrl": "https://...",
        "familyId": "family_uuid"
      }
    }
    ```

### 1.3 家族連携: OTP招待コード取得 (Generate OTP)
* **Endpoint**: `POST /api/users/invite-code`
* **Access**: Parent Only
* **Description**: 5分間のみ有効な6桁のワンタイムパスワード(OTP)を発行します。
* **Response Body**:
    ```json
    {
      "success": true,
      "inviteCode": "843912",
      "expiresAt": "2026-03-27T12:05:00.000Z"
    }
    ```

### 1.4 家族連携: 家族への参加 (Join Family)
* **Endpoint**: `POST /api/users/join-family`
* **Access**: Child Only
* **Request Body**:
    ```json
    {
      "inviteCode": "843912"
    }
    ```
* **Response Body**:
    ```json
    {
      "success": true,
      "message": "家族に参加しました。",
      "data": { "familyId": "family_uuid" }
    }
    ```

---

## 2. クエスト・学習 (Quest & Learning)

### 2.1 クエスト提出とAI分析 (Submit Quest)
* **Endpoint**: `POST /api/quests/submit`
* **Access**: Child Only
* **Content-Type**: `multipart/form-data`
* **Request FormData**:
    * `beforeImage`: File (必須)
    * `afterImage`: File (必須)
    * `subject`: "算数" 等 (任意)
    * `topic`: "図形" 等 (任意)
    * `userName`: "たろう" 等 (任意・AIプロンプト用)
* **Response Body**:
    ```json
    {
      "success": true,
      "message": "レベルアップしました！ Lv.4",
      "isLevelUp": true,
      "newLevel": 4,
      "data": {
        "id": "quest_uuid",
        "childId": "child_uuid",
        "familyId": "family_uuid",
        "status": "COMPLETED",
        "aiResult": {
          "score_breakdown": { "volume": 8, "process": 9, "carefulness": 7, "review": 6 },
          "total_score": 81,
          "feedback_to_child": "たろうさん、よく頑張りました！",
          "feedback_to_parent": "親へのメッセージ"
        }
      },
      "earnedPoints": 16,
      "earnedMinutes": 32,
      "currentPoints": 34,
      "currentMinutes": 68,
      "minutesPerPoint": 2
    }
    ```

### 2.2 クエスト履歴取得 (List Quests)
* **Endpoint**: `GET /api/quests`
* **Access**: Auth User (Parent / Child)
* **Response Body**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "quest_uuid",
          "familyId": "family_uuid",
          "status": "COMPLETED",
          "earnedPoints": 16,
          "createdAt": "2026-03-27T12:00:00.000Z",
          "beforeImageUrl": "uploads/...",
          "afterImageUrl": "uploads/...",
          "subject": "算数",
          "topic": "図形",
          "aiResult": { ... },
          "child": { "name": "たろう", "avatarUrl": null }
        }
      ]
    }
    ```

### 2.3 ボーナスポイント付与 (Add Bonus)
* **Endpoint**: `POST /api/quests/:id/bonus`
* **Access**: Parent Only
* **Request Body**:
    ```json
    { "bonusPoints": 10 }
    ```

---

## 3. 家族設定とゲーミフィケーション (Family & Game)

### 3.1 ゲーム状態取得 (Get Game Status)
* **Endpoint**: `GET /api/family/game-status`
* **Access**: Parent Only
* **Response Body**:
    ```json
    {
      "success": true,
      "gameRemainingMinutes": 68,
      "smartphoneRemainingMinutes": 68,
      "isForceLocked": false,
      "childName": "たろう"
    }
    ```

### 3.2 時間の延長 (Extend Time)
* **Endpoint**: `POST /api/family/extend-time`
* **Access**: Parent Only
* **Request Body**:
    ```json
    { "minutes": 30 }
    ```

### 3.3 ポイント消費 (Consume Points)
* **Endpoint**: `POST /api/users/consume-points`
* **Access**: Child Only
* **Request Body**:
    ```json
    { "consumePoints": 15 }
    ```

### 3.4 デバイス管理 (Device Management)
* **List (GET)**: `/api/family/devices`
* **Add (POST)**: `/api/family/devices` `{"name": "Switch"}`
* **Delete (DELETE)**: `/api/family/devices/:id`