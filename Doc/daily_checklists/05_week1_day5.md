# Week 1 Day 5: Camera UI & Grid Overlay（当日運用版）

## 作業時間目安
- 想定: 4時間
- 実行主体: 作業者

## 本日のゴール
1. カメラの使用許可をリクエストし、許可を得られる。
1. カメラ画面が起動し、プレビューが表示される。
1. グリッド（補助線）がオーバーレイ表示される。
1. 撮影ボタンを押し、撮った写真を確認できる。

## 本日の重点差分
- カメラ権限の拒否導線と再許可導線を実機で確認する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-05.1 Expo Camera Setup
- [ ] 実施操作: Expo Camera Setup。実施内容: `expo-camera` をインストール。 / `app.json` (または `app.config.js`) に `plugins` 設定を追加（iOS/Androidの権限説明文）。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: Expo Camera Setup に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-05.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-05.2 Permission Request
- [ ] 実施操作: Permission Request。実施内容: `src/screens/child/CameraScreen.tsx` を作成。 / `useCameraPermissions` フックを使用して許可ダイアログを表示。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: Permission Request に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-05.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-05.3 Camera Preview
- [ ] 実施操作: Camera Preview。実施内容: `<CameraView>` コンポーネントを全画面配置。 / `facing` は `back` に固定。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Camera Preview に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-05.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-05.4 Grid Overlay
- [ ] 実施操作: Grid Overlay。実施内容: カメラの上に絶対配置 (`position: 'absolute'`) でViewを重ねる。 / 半透明の白い線で 3x3 のグリッド、またはノート用の枠線を描画。 / (Design) ドット絵風の装飾枠だと尚良し。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Grid Overlay に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-05.4): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-05.5 Shutter Button
- [ ] 実施操作: Shutter Button。実施内容: 画面下部に大きな円形ボタンを配置。 / `cameraRef.current.takePictureAsync()` を実行。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: Shutter Button に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-05.5): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-05.6 Preview Modal
- [ ] 実施操作: Preview Modal。実施内容: 撮影後、撮った画像を `<Image>` で表示するモーダルを出す。 / 「これでOK？」「撮り直す」ボタンを配置。 / 実機（またはシミュレータ）でカメラが起動する。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: Preview Modal に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-05.6): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
