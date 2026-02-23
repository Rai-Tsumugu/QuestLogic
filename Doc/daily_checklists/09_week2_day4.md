# Week 2 Day 4: AI Logic Implementation（当日運用版）

## 作業時間目安
- 想定: 4時間
- 実行主体: 作業者

## 本日のゴール
1. Frontendから送られた画像パス（Storage URL）をバックエンドで受け取る。
1. Gemini 1.5 Pro/Flash に画像とプロンプトを投げる。
1. JSON形式で評価結果（スコア、コメント）を受け取る。

## 本日の重点差分
- Gemini応答JSONの必須キー検証と不正JSON時の処理を確認する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-09.1 Construct Request
- [ ] 実施操作: Construct Request。実施内容: StorageのパスからダウンロードURL、またはBufferを取得する処理。 / `GoogleGenerativeAI` インスタンスの作成。 / モデル: `gemini-1.5-flash` (速度重視) または `pro`。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Construct Request に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-09.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-09.2 Prompt Engineering
- [ ] 実施操作: Prompt Engineering。実施内容: System Prompt: `Doc/specs/04_ai_analysis.md` の内容を記述。 / JSON Mode を有効化 (`responseMimeType: "application/json"` or Prompt instruction)。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Prompt Engineering に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-09.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-09.3 Call Function
- [ ] 実施操作: Call Function。実施内容: After撮影後のアップロード完了直後に、Functions (`analyzeQuest`) を呼び出す。 / 引数: `{ beforeImagePath, afterImagePath, duration }`。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Call Function に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-09.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-09.4 Response Handling
- [ ] 実施操作: Response Handling。実施内容: 戻り値 `{ score, comments, ... }` を受け取り、コンソールに出力して確認。 / ノートの画像を送信すると、数秒後にログに分析結果（JSON）が表示される。 / スコアやコメントが、送った画像の内容にある程度即している（デタラメではない）。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Response Handling に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-09.4): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/06_feedback_system.md`
