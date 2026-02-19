# Week 4 Day 1: Parent Actions (承認・却下)（当日運用版）

## 作業時間目安
- 想定: 3-4時間
- 実行主体: 作業者

## 本日のゴール
1. 親詳細画面に「承認」「却下」ボタンを配置。
1. 承認時に「スタンプ」を選べる。
1. アクション結果がDB (`quest_results`) に反映され、ステータスが更新される。

## 本日の重点差分
- 承認・却下・スタンプ保存の3分岐を同日で検証する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-17.1 Action Bar
- [ ] 実施操作: Action Bar。実施内容: 詳細画面下部に固定アクションバーを作成。 / `Approve` (Primary Color), `Reject` (Danger Color)。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Action Bar に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-17.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-17.2 Stamp Modal
- [ ] 実施操作: Stamp Modal。実施内容: 承認ボタン押下で、スタンプ選択モーダルを表示。 / 数種類のアイコン（花丸、Good、Check）から選択。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Stamp Modal に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-17.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-17.3 Update Status
- [ ] 実施操作: Update Status。実施内容: DB更新処理: `status: 'approved'`, `parentStamp: 'flower'`, `approvedAt: now`。 / 却下の場合: `status: 'rejected'`, `rejectReason: 'text'`.
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Update Status に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-17.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-17.4 Energy Bonus (Option)
- [ ] 実施操作: Energy Bonus (Option)。実施内容: スタンプ承認時、子供にボーナスエネルギー (`Parent Boost`) を付与するトランザクション追加。 / 親が承認すると、DBのステータスが変わり、スタンプ情報が保存される。 / 却下すると、却下理由が保存される。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Energy Bonus (Option) に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-17.4): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

## 失敗時の切り分け
- [ ] 権限エラー: Firebase/Auth/Storage ルールとログイン状態を確認
- [ ] 画面遷移不良: 直前ステップの入力値・Context・パラメータ受け渡しを確認
- [ ] データ不整合: Firestore実データとUI表示を同時に突合
- [ ] 再実行条件: 原因を1つ修正後、同一ケースを最初から再実行して再現有無を確認

## 完了判定（Go / No-Go）
- [ ] 全STEPの期待結果が満たされている
- [ ] 全STEPで証跡（EVID）が残っている
- [ ] 実機で主導線が完走し、重大障害がない
- 判定ルール: 上記のいずれか未達なら **No-Go**。未達項目を修正して再確認後に翌日へ進む。

## 参照仕様
- `Doc/specs/08_parent_dashboard.md`
- `Doc/specs/05_data_persistence.md`
