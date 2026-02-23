# Week 2 Day 2: Timer Logic & Concentration（当日運用版）

## 作業時間目安
- 想定: 4時間
- 実行主体: 作業者

## 本日のゴール
1. Before撮影後、タイマー画面に遷移しカウントアップが始まる。
1. 「終了」ボタンでタイマーが止まり、学習時間が記録される。
1. アプリをバックグラウンドにした時間を検知できる（簡易実装）。

## 本日の重点差分
- AppState遷移ログを採取し、サボり時間の検算結果を記録する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-07.1 UI Layout
- [ ] 実施操作: UI Layout。実施内容: `src/screens/child/TimerScreen.tsx` を作成。 / 中央に大きく経過時間を表示 (`MM:ss`)。 / 「学習終了」ボタンを配置。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: UI Layout に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-07.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-07.2 Timer Logic
- [ ] 実施操作: Timer Logic。実施内容: `useInterval` または `setInterval` で1秒ごとにカウントアップ。 / `startedAt` (開始時刻) をStateで保持。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Timer Logic に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-07.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-07.3 AppState Monitoring
- [ ] 実施操作: AppState Monitoring。実施内容: React Native の `AppState` APIを使用。 / `active` -> `background` になった時刻を記録。 / `background` -> `active` に戻った時刻との差分を「サボり時間」として累積する。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: AppState Monitoring に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-07.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-07.4 Warning UI
- [ ] 実施操作: Warning UI。実施内容: アプリに戻った際、サボり時間が閾値（例: 30秒）を超えていたら「集中力が切れてるよ！」とアラート表示。 / Before撮影 -> タイマー画面への遷移ができる。 / タイマーが正しく時間を刻む。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: Warning UI に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-07.4): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/09_screen_flow.md`
- `Doc/specs/05_data_persistence.md`
