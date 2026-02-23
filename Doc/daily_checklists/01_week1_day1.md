# Week 1 Day 1: Project & Firebase Setup（当日運用版）

## 作業時間目安
- 想定: 4-5時間
- 実行主体: 作業者

## 本日のゴール
1. Firebaseコンソールでプロジェクトが作成されている。
1. Authentication, Firestore, Storage が有効化されている。
1. ローカルの `frontend` アプリから Firebase に接続できる状態になる。

## 本日の重点差分
- Firebase初期設定を「コンソール操作順 + 値記録表 + 接続試験ログ」で残す。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-01.1 プロジェクト作成
- [ ] 実施操作: プロジェクト作成。実施内容: `Add project` をクリック。 / Name: `smartstudy-gate-dev` (または任意の名前) / Analytics: 開発用なので `OFF` でOK（ONでも可）。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: プロジェクト作成 に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-01.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-01.2 アプリ登録 (Web App)
- [ ] 実施操作: アプリ登録 (Web App)。実施内容: プロジェクト概要ページの `</>` (Web) アイコンをクリック。 / App Nickname: `SmartStudy Gate Frontend` / `Firebase Hosting` はチェック不要。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: アプリ登録 (Web App) に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-01.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-01.3 Authentication 有効化
- [ ] 実施操作: Authentication 有効化。実施内容: 左メニュー Build > Authentication > **Get started**。 / **Sign-in method** タブで `Email/Password` を選択し **Enable**。 / (Option) `Google` も使う予定なら Enable にしておく。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: Authentication 有効化 に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-01.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-01.4 Firestore 有効化
- [ ] 実施操作: Firestore 有効化。実施内容: Left Menu: Build > Firestore Database > **Create database**。 / Location: `asia-northeast1` (Tokyo) 推奨。 / Rules: **Start in test mode**（開発初期はこれでOK）。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Firestore 有効化 に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-01.4): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-01.5 Storage 有効化
- [ ] 実施操作: Storage 有効化。実施内容: Left Menu: Build > Storage > **Get started**。 / Rules: **Start in test mode**。 / Location: `asia-northeast1` (Tokyo) 推奨。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Storage 有効化 に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-01.5): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-01.6 環境変数の設定
- [ ] 実施操作: 環境変数の設定。実施内容: `frontend/.env` を開く（無ければ作成）。 / 控えておいた `firebaseConfig` の値を以下のように記述する。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: 環境変数の設定 に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-01.6): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-01.7 Firebase SDK インストール
- [ ] 実施操作: Firebase SDK インストール。実施内容: ターミナルで `frontend` ディレクトリに移動。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Firebase SDK インストール に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-01.7): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-01.8 初期化コードの確認/作成
- [ ] 実施操作: 初期化コードの確認/作成。実施内容: `frontend/src/lib/firebase.ts` (または `config/firebase.ts`) を作成/確認。 / 以下のコードが含まれているか確認。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: 初期化コードの確認/作成 に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-01.8): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-01.9 疎通テスト
- [ ] 実施操作: 疎通テスト。実施内容: アプリを起動: `npx expo start` / エラー（"Firebase: Error (auth/invalid-api-key)" 等）が出ないことを確認。 / (Option) `App.tsx` 等で `console.log(auth)` を仕込み、Authオブジェクトが出力されるか確認。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: 疎通テスト に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-01.9): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
