# API データ形式仕様書 (API Data Formats)

本ドキュメントは、QuestLogic システムにおけるAPIのデータ形式（Request/Response Schema）を詳細に定義します。
全てのAPIは `application/json` を使用し、認証が必要なエンドポイントはヘッダーに `Authorization: Bearer <token>` を要求します。

---

## 1. ユーザー管理 (User Management)

### 1.1 親アカウント登録 (Parent SignUp Trigger)
*   **Endpoint**: `POST /api/user/parent/signup`
*   **Description**: Firebase Auth の `onCreate` トリガーによってシステム内部から呼び出される想定。初期データ構造定義用。
*   **Trigger Payload**:
    ```json
    {
      "uid": "user_abc123",
      "email": "parent@example.com",
      "displayName": "Parent User"
    }
    ```
*   **Created Data (Firestore)**:
    *   `families/{familyId}`: `{ parentUid: "user_abc123", childUids: [] }`
    *   `users/{uid}`: `{ role: "parent", familyId: "{familyId}" }`

### 1.2 子アカウント追加 (Add Child)
*   **Endpoint**: `POST /api/family/child`
*   **Access**: Parent Only
*   **Request Body**:
    ```json
    {
      "displayName": "Kenta",
      "birthDate": "2012-04-01" // Optional
    }
    ```
*   **Response Body**:
    ```json
    {
      "success": true,
      "child": {
        "uid": "child_xyz789",
        "displayName": "Kenta",
        "role": "child",
        "pin": "1234" // 初期PINコードを返す
      }
    }
    ```

### 1.3 子ログイン (Child Login)
*   **Endpoint**: `POST /api/auth/child/login`
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "familyId": "family_001",
      "pin": "1234"
    }
    ```
*   **Response Body**:
    ```json
    {
      "success": true,
      "token": "firebase_custom_token_...",
      "user": {
        "uid": "child_xyz789",
        "displayName": "Kenta",
        "role": "child"
      }
    }
    ```

### 1.4 家族メンバー取得 (Get Family Members)
*   **Endpoint**: `GET /api/family/members`
*   **Access**: Auth User (Parent/Child)
*   **Response Body**:
    ```json
    {
      "familyId": "family_001",
      "parent": {
        "uid": "user_abc123",
        "displayName": "Parent User",
        "photoUrl": "https://..."
      },
      "children": [
        {
          "uid": "child_xyz789",
          "displayName": "Kenta",
          "photoUrl": "https://...",
          "balance": 45 // 現在のエネルギー残高
        }
      ]
    }
    ```

---

## 2. クエスト・学習 (Quest & Learning)

### 2.1 クエスト開始 (Start Quest)
*   **Endpoint**: `POST /api/quest/start`
*   **Access**: Child
*   **Request Body**:
    ```json
    {
      "subject": "Math", // "Math", "English", "Science", etc.
      "beforeImageUrl": "gs://bucket/path/to/before.jpg" // 事前にUpload済みのパス
    }
    ```
*   **Response Body**:
    ```json
    {
      "questId": "quest_999",
      "startedAt": "2026-02-19T10:00:00Z"
    }
    ```

### 2.2 クエスト完了 (Finish Quest)
*   **Endpoint**: `POST /api/quest/finish`
*   **Access**: Child
*   *Note*: このAPIを呼ぶと自動的にバックグラウンドでAI解析がトリガーされます。
*   **Request Body**:
    ```json
    {
      "questId": "quest_999",
      "afterImageUrl": "gs://bucket/path/to/after.jpg",
      "durationMin": 30
    }
    ```
*   **Response Body**:
    ```json
    {
      "success": true,
      "status": "analyzing",
      "message": "AI解析を開始しました。結果をお待ちください。"
    }
    ```

### 2.3 クエスト詳細取得 (Get Quest Detail)
*   **Endpoint**: `GET /api/quest/:id`
*   **Access**: Auth User
*   **Response Body**:
    ```json
    {
      "id": "quest_999",
      "childId": "child_xyz789",
      "subject": "Math",
      "status": "pending_review", // analyzerd, approved, rejected
      "images": {
        "before": "https://...",
        "after": "https://..."
      },
      "durationMin": 30,
      "aiResult": { // 解析完了後のみ
        "score": 85,
        "feedback_child": "すごい！図を書いて考えているね！",
        "feedback_parent": "途中計算が丁寧に残されており、理解度が深いです。",
        "features": ["red_pen", "erasure"]
      },
      "finalScore": 85,
      "earnedEnergy": 45,
      "createdAt": "2026-02-19T10:00:00Z"
    }
    ```

### 2.4 クエスト履歴取得 (List Quests)
*   **Endpoint**: `GET /api/quest/list`
*   **Query Params**:
    *   `childId`: (Optional) 特定の子のみ
    *   `status`: (Optional) `pending_review` など
    *   `limit`: 20
*   **Response Body**:
    ```json
    {
      "items": [
        { "id": "quest_999", "subject": "Math", "score": 85, "createdAt": "..." },
        { "id": "quest_998", "subject": "English", "score": 90, "createdAt": "..." }
      ],
      "nextCursor": "..."
    }
    ```

---

## 3. 親の管理アクション (Parent Actions)

### 3.1 承認 (Approve)
*   **Endpoint**: `POST /api/quest/approve`
*   **Access**: Parent
*   **Request Body**:
    ```json
    {
      "questId": "quest_999",
      "stampId": "stamp_good_job", // Optional
      "comment": "よく頑張ったね！" // Optional
    }
    ```
*   **Response Body**:
    ```json
    {
      "success": true,
      "quest": {
        "id": "quest_999",
        "status": "approved",
        "earnedEnergy": 55, // スタンプボーナス加算後の最終値
        "parentComment": "よく頑張ったね！"
      }
    }
    ```

### 3.2 却下 (Reject)
*   **Endpoint**: `POST /api/quest/reject`
*   **Access**: Parent
*   **Request Body**:
    ```json
    {
      "questId": "quest_999",
      "reason": "handwriting_too_messy" // or "just_copying"
    }
    ```
*   **Response Body**:
    ```json
    {
      "success": true,
      "quest": { "id": "quest_999", "status": "rejected" }
    }
    ```

### 3.3 スコア修正 (Correct)
*   **Endpoint**: `POST /api/quest/correct`
*   **Access**: Parent
*   **Request Body**:
    ```json
    {
      "questId": "quest_999",
      "correctScore": 70, // 親が付け直したスコア
      "comment": "字をもっと丁寧に書こう"
    }
    ```
*   **Response Body**:
    ```json
    {
      "success": true,
      "energyUpdate": {
        "old": 45,
        "new": 35
      }
    }
    ```

---

## 4. ゲーミフィケーション & IoT

### 4.1 エネルギー残高取得 (Get Balance)
*   **Endpoint**: `GET /api/energy/balance`
*   **Access**: Child (Self) / Parent (Target Child)
*   **Response Body**:
    ```json
    {
      "childId": "child_xyz789",
      "currentBalance": 120, // 分
      "todayEarned": 45,
      "todayConsumed": 30
    }
    ```

### 4.2 解錠リクエスト (Unlock Device)
*   **Endpoint**: `POST /api/device/unlock`
*   **Access**: Child
*   **Request Body**:
    ```json
    {
      "deviceId": "box_001"
    }
    ```
*   **Response Body**:
    *   *Success*: `200 OK`
        ```json
        { "success": true, "status": "unlocked", "remainingTime": 120 }
        ```
    *   *Error (残高不足)*: `403 Forbidden`
        ```json
        { "error": "insufficient_energy", "currentBalance": 0 }
        ```

### 4.3 状態同期 (Device Status Sync)
*   **Endpoint**: `POST /api/device/status`
*   **Access**: IoT Device (Service Account)
*   **Request Body**:
    ```json
    {
      "deviceId": "box_001",
      "status": "closed", // "open" or "closed"
      "timestamp": "2026-02-19T12:00:00Z"
    }
    ```
*   **Response Body**:
    ```json
    { "command": "none" } // "lock" 等の指令があれば返す
    ```
