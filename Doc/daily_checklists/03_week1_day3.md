# Week 1 Day 3: Child Management & Family Linkage（当日運用版）

## 作業時間目安
- 想定: 4時間
- 実行主体: 作業者

## 本日のゴール
1. 親ダッシュボードから「子供を追加」できる。
1. 子供用の仮想アカウント（Authには紐づかない、あるいはSub-account）がDBに作られる。
1. 家族ドキュメントに子供のIDが配列として追加される。

## 本日の重点差分
- users と families.childUids の整合を件数・IDで必ず突合する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-03.1 Settings Screen
- [ ] 実施操作: Settings Screen。実施内容: 親ダッシュボードに「設定（歯車）」アイコンを配置。 / `src/screens/parent/SettingsScreen.tsx` を作成。 / 「子供を追加する」ボタンを配置。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: Settings Screen に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-03.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-03.2 Add Child Modal/Screen
- [ ] 実施操作: Add Child Modal/Screen。実施内容: 名前入力フォーム、PINコード（4桁数字）入力フォームを作成。 / 保存ボタンを作成。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Add Child Modal/Screen に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-03.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-03.3 Child Document
- [ ] 実施操作: Child Document。実施内容: 保存時、`users` コレクションに新しいドキュメントを作成。 / IDは自動生成 (`doc(collection(db, "users"))`). / Data: `{ role: 'child', name: 'Kenta', pin: '1234', familyId: currentFamilyId }`
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Child Document に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-03.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-03.4 Family Update
- [ ] 実施操作: Family Update。実施内容: `families/{currentFamilyId}` ドキュメントの `childUids` 配列に、作成した子供のIDを追加 (`arrayUnion`)。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Family Update に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-03.4): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-03.5 Child List
- [ ] 実施操作: Child List。実施内容: 設定画面またはダッシュボードに、登録済みの子供一覧を表示する。 / 正しく名前が表示されるか確認。 / 親アカウントでログインし、子供を3人追加できる。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Child List に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-03.5): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/01_user_management.md`
- `Doc/specs/05_data_persistence.md`
