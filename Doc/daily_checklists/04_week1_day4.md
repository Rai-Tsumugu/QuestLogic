# Week 1 Day 4: Switch User & Auth Context（当日運用版）

## 作業時間目安
- 想定: 4時間
- 実行主体: 作業者

## 本日のゴール
1. グローバルな状態管理（Context）で `currentUser` (Parent) と `activeChild` (Child) を管理できる。
1. ユーザー切り替え画面でPINを入力し、子供モード（Home）へ遷移できる。
1. 子供モードから親モードへ戻る際もPIN（または生体認証）を要求する。

## 本日の重点差分
- role切替は正常系、誤PIN系、親復帰系を分離して検証する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-04.1 Context Design
- [ ] 実施操作: Context Design。実施内容: `src/contexts/AuthContext.tsx` を整備。 / State: `user` (Firebase User), `profile` (Firestore Data), `activeRole` ('parent' | 'child'). / Actions: `switchRole(role, childId?)`.
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Context Design に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-04.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-04.2 Profile Fetching
- [ ] 実施操作: Profile Fetching。実施内容: ログイン時、Firestoreから `users/{uid}` を取得し、`profile` にセットする処理を実装。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Profile Fetching に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-04.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-04.3 Switch User Screen
- [ ] 実施操作: Switch User Screen。実施内容: 親ダッシュボードからアクセス可能にする。 / 登録されている子供のアイコン一覧を表示。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Switch User Screen に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-04.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-04.4 PIN Input
- [ ] 実施操作: PIN Input。実施内容: 子供を選択すると、PIN入力モーダルを表示。 / 入力されたPINと、Firestoreの `pin` フィールドを照合。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: PIN Input に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-04.4): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-04.5 Navigation Structure
- [ ] 実施操作: Navigation Structure。実施内容: `RootNavigator` で、`activeRole` に応じてスタックを切り替える。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Navigation Structure に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-04.5): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-04.6 Child Home
- [ ] 実施操作: Child Home。実施内容: 子供モードに切り替わったら、`ChildHomeScreen` (仮) が表示されること。 / 「ここは子供の画面です」等のテキスト表示でOK。 / 親でログイン後、子供Aを選択してPIN入力すると、子供Aのホーム画面になる。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Child Home に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-04.6): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/09_screen_flow.md`
