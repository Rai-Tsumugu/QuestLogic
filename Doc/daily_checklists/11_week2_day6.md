# Week 2 Day 6: Parent Dashboard (Basic)（当日運用版）

## 作業時間目安
- 想定: 4時間
- 実行主体: 作業者

## 本日のゴール
1. 親ダッシュボードで、子供ごとのクエスト履歴が見られる。
1. 履歴をタップすると詳細画面が開き、Before/After画像とAI評価が見られる。

## 本日の重点差分
- 親一覧と詳細、Firestore実データの一致を3件以上突合する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-11.1 Fetch Data
- [ ] 実施操作: Fetch Data。実施内容: Firestore `quest_results` から、自分の子供のデータをクエリ (`orderBy('finishedAt', 'desc')`)。 / `FlatList` で一覧表示（日付、教科、スコア）。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Fetch Data に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-11.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-11.2 Image Viewer
- [ ] 実施操作: Image Viewer。実施内容: Before画像とAfter画像を並べて表示（スライダー比較はWeek 4で実装、今回は並列でOK）。 / `Image` コンポーネントを使用。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Image Viewer に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-11.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-11.3 Info Display
- [ ] 実施操作: Info Display。実施内容: AIスコア、親向けコメント（`feedback_parent`）を表示。 / 「承認待ち」ステータスの表示。 / 親端末でアプリを開くと、子供がさっき完了したクエストが表示されている。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Info Display に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-11.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
