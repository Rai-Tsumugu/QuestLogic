# Week 2 Day 5: Result View (Basic UI)（当日運用版）

## 作業時間目安
- 想定: 4時間
- 実行主体: 作業者

## 本日のゴール
1. AI分析中（Loading）の画面表示。
1. 分析完了後、リザルト画面へ遷移。
1. スコア、AIコメント、獲得エネルギー（仮計算）が表示される。
1. 結果データがFirestoreに保存される。

## 本日の重点差分
- 分析待機UIのタイムアウト条件を秒数で固定して確認する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-10.1 Save Result
- [ ] 実施操作: Save Result。実施内容: バックエンド（Functions）、またはフロントエンドでのレスポンス受信時に `quest_results` コレクションへ保存。 / Data: `{ childId, score, aiRawResponse, status: 'pending_approval' }`
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Save Result に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-10.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-10.2 Loading View
- [ ] 実施操作: Loading View。実施内容: 「解析中...」のアニメーション（またはテキスト）。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Loading View に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-10.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-10.3 Score Display
- [ ] 実施操作: Score Display。実施内容: スコアを大きく表示。 / AIコメント（`feedback_child`）を吹き出しで表示。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Score Display に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-10.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-10.4 Navigation
- [ ] 実施操作: Navigation。実施内容: 「ホームへ戻る」ボタンで、クエスト完了状態のホーム画面へ戻る。 / 撮影→分析待機→結果表示 のフローが途切れずに動く。 / Firestoreに結果データが保存されている。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Navigation に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-10.4): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/06_feedback_system.md`
- `Doc/specs/05_data_persistence.md`
