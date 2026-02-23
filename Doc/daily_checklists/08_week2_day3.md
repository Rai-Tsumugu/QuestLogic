# Week 2 Day 3: Cloud Functions Setup (Backend)（当日運用版）

## 作業時間目安
- 想定: 4時間
- 実行主体: 作業者

## 本日のゴール
1. Firebase Cloud Functions の環境がローカルに構築できている。
1. 簡単なテスト関数 (`helloWorld`) をデプロイ（またはエミュレータ実行）し、アプリから呼べる。
1. Gemini API Key を環境変数に設定できる。

## 本日の重点差分
- Functions初期化からhelloWorld callable応答まで証跡を残す。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-08.1 Firebase Init
- [ ] 実施操作: Firebase Init。実施内容: プロジェクトルートで `firebase init functions` を実行。 / 言語: `TypeScript` を選択。 / ESLint: `Yes`。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Firebase Init に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-08.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-08.2 Dependencies
- [ ] 実施操作: Dependencies。実施内容: `cd functions` / `npm install @google/generative-ai` (Gemini SDK)。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Dependencies に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-08.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-08.3 Implement Function
- [ ] 実施操作: Implement Function。実施内容: `functions/src/index.ts` に `onCall` (Callable Function) で簡単な関数を実装。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Implement Function に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-08.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-08.4 Emulator Test
- [ ] 実施操作: Emulator Test。実施内容: `npm run build` & `firebase emulators:start --only functions`。 / シェル等から呼べるか確認、またはFrontendから呼んでみる。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Emulator Test に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-08.4): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-08.5 Set Secret
- [ ] 実施操作: Set Secret。実施内容: `firebase functions:secrets:set GEMINI_API_KEY` を実行し、キーを入力。 / Functionコード内で `defineSecret` を使って読み込めるように修正。 / ローカルエミュレータでFunctionsが起動している。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Set Secret に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-08.5): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/04_ai_analysis.md`
- `Doc/specs/05_data_persistence.md`
