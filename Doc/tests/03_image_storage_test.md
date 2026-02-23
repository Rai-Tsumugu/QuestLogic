# 03_image_storage_test.md

## テスト概要
Storageへの画像アップロード、パス構造、アクセス権限のテスト。

## テストケース

### 1. アップロードとパス (Path Verification)
- [ ] **TC-03-001**: 正しいパスへの保存
    - **手順**: アプリからBefore画像をアップロード。
    - **期待値**: Firebase Console等で確認し、`images/{familyId}/{childId}/{questId}/before.jpg` に保存されていること。

### 2. セキュリティルール (Security Rules)
- [ ] **TC-03-002**: 他人の画像へのアクセス拒否
    - **手順**: 別のアカウント(Different Family)で認証し、上記の画像のURLにアクセスを試みる。
    - **期待値**: Permission Denied (403 Error) となること。
- [ ] **TC-03-003**: 自分の画像へのアクセス許可
    - **手順**: 画像をアップロードした本人または親アカウントでアクセス。
    - **期待値**: 画像がダウンロードできること。
