# 05_data_persistence.md

## 概要
AI分析結果および各クエスト（学習セッション）の結果を永続化するためのDBスキーマ設計。

## データモデル (Firestore)

### `quest_results` collection
学習1回ごとのリザルトデータ。

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Quest ID (Primary Key) |
| `childId` | String | 実施した子供のUID |
| `familyId` | String | Family ID |
| `subject` | String | 教科 (e.g., "Math", "English") |
| `startedAt` | Timestamp | 開始時刻 (Before撮影時) |
| `finishedAt` | Timestamp | 終了時刻 (After撮影時) |
| `durationMin` | Number | 学習時間(分) |
| `images` | Map | `{ before: storagePath, after: storagePath }` |
| `childComment`| String | 学習後の子供の感想 (任意入力) |
| `aiResult` | Map | `{ score, breakdown, feedback..., tags }` (AI生データ) |
| `finalScore` | Number | 親の承認後の確定スコア (初期値はaiResult.score) |
| `status` | String | `"pending_review"`(親確認待) \| `"approved"` \| `"rejected"` |
| `earnedEnergy` | Number | 獲得した報酬時間(分) |

### Indexes
*   `familyId` ASC, `finishedAt` DESC (親ダッシュボード表示用)
*   `childId` ASC, `finishedAt` DESC (子供履歴表示用)

## データ整合性
*   Storageへの画像アップロード完了後に、Firestoreドキュメントを作成あるいは更新する（Transaction推奨）。

## 受け入れ条件 (Acceptance Criteria)
1.  AI分析完了後、全てのフィールドが埋まった状態でドキュメントが作成されること。
2.  画像のStorage Pathが正しくリンクされていること。
3.  クエリ（親用、子供用）がパフォーマンス問題なく動作すること。
