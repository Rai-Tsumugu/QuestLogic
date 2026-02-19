# Week 3 Day 4: Ghost Overlay (カメラUX)（当日運用版）

## 作業時間目安
- 想定: 3-4時間
- 実行主体: 作業者

## 本日のゴール
1. After撮影時のみ、Before画像を半透明でカメラプレビューに重ねる。
1. 重ね合わせの透明度（Alpha）を調整できる（Optional）。

## 本日の重点差分
- Ghost Overlayの視認性と誤操作有無を環境差で確認する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-15.1 Retrieve Before Image
- [ ] 実施操作: Retrieve Before Image。実施内容: After撮影画面遷移時に、Before画像のローカルURI（またはキャッシュ済パス）を渡す。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: Retrieve Before Image に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-15.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-15.2 Image Overlay
- [ ] 実施操作: Image Overlay。実施内容: `CameraView` の上に、絶対配置で `Image` を置く。 / `opacity: 0.3` ～ `0.5` に設定。 / `pointerEvents="none"` を設定し、タップ操作をカメラに透過させる。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Image Overlay に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-15.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-15.3 Guide Message
- [ ] 実施操作: Guide Message。実施内容: 「うすく見える写真に合わせて撮ってね」というガイドテキストを表示。 / After撮影時、うっすらと前の画像が見え、位置合わせが簡単にできる。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: Guide Message に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-15.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/02_camera_capture.md`
- `Doc/specs/09_screen_flow.md`
