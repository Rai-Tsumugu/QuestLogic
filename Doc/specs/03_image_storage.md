# 03_image_storage.md

## 概要
撮影した画像をFirebase Storageにセキュアに保存するためのパス設計とセキュリティルール。

## ストレージ構造 (Firebase Storage)

パス形式:
`images/{familyId}/{childId}/{questId}/{type}.jpg`

*   `familyId`: 所属するFamily ID
*   `childId`: 学習者のUID
*   `questId`: クエスト（タスク）ごとのユニークID
*   `type`: `"before"` or `"after"`

例: `images/fam_001/user_child_A/quest_999/before.jpg`

## セキュリティルール (Firestore Rules)
```javascript
match /images/{familyId}/{childId}/{questId}/{fileName} {
  // 読み取り: 家族メンバーなら誰でもOK
  allow read: if request.auth != null && 
               (request.auth.uid == childId || 
                exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid))); // ※仮の構造
                
  // 書き込み: 本人のみOK
  allow write: if request.auth != null && request.auth.uid == childId;
}
```
※実際の実装では `users` ドキュメントの `familyId` を参照して一致確認を行うカスタムクレームまたはFirestore読み込みが必要。

## ライフサイクルポリシー (Lifecycle Management)
Google Cloud Storage Lifecycle Management を設定。
*   **Age: 90 days**: Delete (自動削除)
*   ※長期保存が必要な「思い出レポート」用には、別途サムネイル(256x256)を生成し、別パス(`thumbnails/...`)に保存する（無期限）。

## 受け入れ条件 (Acceptance Criteria)
1.  **アップロード成功**: アプリから指定パスに画像が保存されること。
2.  **アクセス制御**: 別Familyのユーザーがアクセスしようとした場合、Permission Deniedとなること。
3.  **パス構造**: 指定したディレクトリ階層通りにファイルが配置されていること。
