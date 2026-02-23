# 01_user_management.md

## 概要
親（管理者）と子（学習者）のアカウント管理、および認証フローを定義する。

## データモデル (Firestore)

### `users` collection
ユーザーの基本情報を格納する。

| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | String | Firebase Auth UID (Primary Key) |
| `role` | String | `"parent"` or `"child"` |
| `displayName` | String | 表示名 |
| `familyId` | String | 紐付くFamily ID |
| `createdAt` | Timestamp | 作成日時 |
| `updatedAt` | Timestamp | 更新日時 |

### `families` collection
家族グループの管理情報を格納する。

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Family ID (Primary Key) |
| `parentUid` | String | 親ユーザーのUID |
| `childUids` | Array<String> | 子ユーザーのUIDリスト |
| `inviteCode` | String | 子用招待コード (Optional) |

## API インターフェース

### 1. 親アカウント登録 (SignUp)
*   **Trigger**: Firebase Auth (Email/Pass or Social) `onCreate`
*   **Logic**:
    1.  `families` ドキュメントを作成 (`id` = unique UUID)。
    2.  `users` ドキュメントを作成 (`role` = "parent", `familyId` = generated ID)。

### 2. 子アカウント追加 (Add Child)
*   **Endpoint**: `POST /api/family/child` (Cloud Functions)
*   **Auth**: Parent Only
*   **Request**: `{ "displayName": "太郎" }`
*   **Logic**:
    1.  Firebase Auth に子ユーザーを作成（Emailはdummy+uuid@example.com等で自動生成、PasswordはParentが設定 or 自動生成）。
    2.  `users` ドキュメントを作成 (`role` = "child", `familyId` = parent's familyId)。
    3.  `families` の `childUids` に追加。
    4.  子用のPINコード（4桁）を発行し、親に返す。

### 3. 子ログイン (Child Login via PIN)
*   **Endpoint**: `POST /api/auth/child/login`
*   **Request**: `{ "familyId": "...", "pin": "1234" }` (※PIN認証の実装方針による。Firebase Authを使う場合はEmail/Passで裏側でログインさせる)
*   **Alternative Flow (Simple)**:
    1.  家族共有端末で親がログイン状態。
    2.  アプリ内で「ユーザー切り替え」画面を表示。
    3.  子のアイコンを選択 -> PIN入力 -> ローカルステートでActive UserをSwitch。

## 受け入れ条件 (Acceptance Criteria)
1.  **親登録**: メールアドレス/Google認証で新規登録し、Firestoreに`users` (`role: parent`) と `families` が作成されること。
2.  **子追加**: 親がアプリから子の名前を入力し、追加できること。Firestoreに正しく反映されること。
3.  **子切り替え**: 親アカウントでログイン中のアプリから、PINコード入力などで子ユーザーとして振る舞えること（または子専用ログインができること）。
