# 14_database_indices.md

## 概要
Firestoreのクエリパフォーマンスを最適化するためのインデックス設計。
複合クエリが必要な箇所を定義する。

## 1. 必要な複合インデックス (Composite Indexes)

### 1.1 Quest Results (for Parent Dashboard)
親が「特定の家族の」「完了したクエスト」を「新しい順」に見るためのクエリ。
```javascript
// Query
collection("quest_results")
  .where("familyId", "==", currentFamilyId)
  .orderBy("finishedAt", "desc")
```
*   **Index**: `familyId (ASC) + finishedAt (DESC)`

### 1.2 Quest Results (for Child History)
子供が「自分の」「特定の教科の」履歴を見る場合。
```javascript
// Query
collection("quest_results")
  .where("childId", "==", currentChildId)
  .where("subject", "==", selectedSubject)
  .orderBy("finishedAt", "desc")
```
*   **Index**: `childId (ASC) + subject (ASC) + finishedAt (DESC)`

### 1.3 Energy Transactions (for History)
エネルギーの獲得・消費履歴。
```javascript
// Query
collection("energy_transactions")
  .where("userId", "==", currentChildId)
  .orderBy("timestamp", "desc")
```
*   **Index**: `userId (ASC) + timestamp (DESC)`

## 2. セキュリティルール詳細 (Security Rules)

### 2.1 共通関数
```javascript
function isFamilyMember(familyId) {
  return exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid));
}

function isParent(familyId) {
  // DB構造に依存するが、Roleチェックを行う
  let userRole = get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
  return userRole == 'parent' && isFamilyMember(familyId);
}
```

### 2.2 コレクション別ルール
*   **quest_results**:
    *   `read`: `isFamilyMember(resource.data.familyId)` (家族なら読める)
    *   `create`: `request.resource.data.childId == request.auth.uid` (自分のみ作成可)
    *   `update`: 
        *   Child: 禁止 (改ざん防止)
        *   Parent: `isParent(resource.data.familyId)` (承認ステータス更新可)
