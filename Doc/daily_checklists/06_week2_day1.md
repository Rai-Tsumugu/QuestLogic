# Week 2 Day 1: Image Storage (アップロード実装)（当日運用版）

## 作業時間目安
- 想定: 4時間
- 実行主体: 作業者

## 本日のゴール
1. 撮影した画像を `Blob` 形式で読み込める。
1. `firebase/storage` SDKを使ってアップロードできる。
1. 保存パスが `images/{familyId}/{childId}/{questId}/{type}.jpg` のルール通りになっている。

## 本日の重点差分
- Storageパス命名規則とアップロード後の実体存在を確認する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-06.1 Blob Utility
- [ ] 実施操作: Blob Utility。実施内容: `uri` (ローカルパス) を `Blob` に変換するユーティリティ関数を作成。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Blob Utility に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-06.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-06.2 Upload Function
- [ ] 実施操作: Upload Function。実施内容: `src/lib/storage.ts` を作成。 / `uploadImage(uri, path)` 関数を実装。 / `ref(storage, path)` と `uploadBytes` を使用。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Upload Function に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-06.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-06.3 Upload Action
- [ ] 実施操作: Upload Action。実施内容: カメラ画面の「プレビュー」モーダルに「提出する」ボタンを追加。 / ボタン押下でアップロード処理を実行。 / パス生成ロジック:
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Upload Action に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-06.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-06.4 Progress Indicator
- [ ] 実施操作: Progress Indicator。実施内容: アップロード中に「送信中...」のローディング表示（`ActivityIndicator`）を出す。 / 撮影→提出ボタン押下で、エラーなくアップロードが完了する。 / Firebase Console (Storage) を開き、指定したパスに画像ファイルが保存されている。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Progress Indicator に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-06.4): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/03_image_storage.md`
- `Doc/specs/02_camera_capture.md`
