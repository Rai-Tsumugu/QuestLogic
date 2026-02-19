# Week 1 Day 2: Database Rules & Parent Authentication（当日運用版）

## 作業時間目安
- 想定: 4-5時間
- 実行主体: 作業者

## 本日のゴール
1. Firestoreセキュリティルールが `firestore.rules` に記述され、デプロイされている（またはエミュレータで動作する）。
1. アプリの「新規登録」画面から、親アカウントを作成できる。
1. 登録後、`users` コレクションと `families` コレクションにデータが作成される。

## 本日の重点差分
- Rulesは許可ケースだけでなく拒否されるべき操作も必ず検証する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-02.1 ルールファイルの作成
- [ ] 実施操作: ルールファイルの作成。実施内容: プロジェクトルートに `firestore.rules` を作成。 / 以下の初期ルールを記述（開発用）。 / (Option) ローカルエミュレータを使う場合は `firebase.json` でエミュレータ設定を行う。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: ルールファイルの作成 に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-02.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-02.2 SignUp Screen UI
- [ ] 実施操作: SignUp Screen UI。実施内容: `src/screens/auth/SignUpScreen.tsx` を作成。 / Email入力欄、Password入力欄、登録ボタンを配置。 / (Design) Tailwind (NativeWind) で最低限のスタイルを当てる。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: SignUp Screen UI に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-02.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-02.3 Auth Logic
- [ ] 実施操作: Auth Logic。実施内容: `firebase/auth` の `createUserWithEmailAndPassword` を使用。 / 登録ボタン押下時のハンドラを実装。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Auth Logic に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-02.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-02.4 User/Family Document Creation
- [ ] 実施操作: User/Family Document Creation。実施内容: Auth完了直後に、Firestoreへデータを書き込む処理を追加。 / `users/{uid}`: `{ role: 'parent', email: email, familyId: 'new_family_id' }` / `families/{new_family_id}`: `{ parentUid: uid, childUids: [] }`
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: User/Family Document Creation に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-02.4): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-02.5 Navigation
- [ ] 実施操作: Navigation。実施内容: 登録成功後、`ParentDashboardScreen`（仮）へ遷移することを確認。 / Firebase ConsoleのAuthenticationタブにユーザーが増えている。 / Firestoreに `users` と `families` ドキュメントが正しく作成されている。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Navigation に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-02.5): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
