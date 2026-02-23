# Week 4 Day 4: Error Handling (RPG UI)（当日運用版）

## 作業時間目安
- 想定: 3-4時間
- 実行主体: 作業者

## 本日のゴール
1. ネットワーク切断時、専用の「通信魔法エラー」画面が出る。
1. 未知のエラー発生時、ErrorBoundaryで「ギルド混雑」画面が出る。

## 本日の重点差分
- オフラインと例外の再現手順を明文化して復帰導線を確認する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-20.1 NetInfo
- [ ] 実施操作: NetInfo。実施内容: `@react-native-community/netinfo` を導入。 / オフライン検知フックを作成。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: NetInfo に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-20.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-20.2 Error Modal
- [ ] 実施操作: Error Modal。実施内容: `Doc/specs/10_error_ui.md` に基づくデザインの実装。 / ドット絵アイコンと「再試行」ボタン。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: Error Modal に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-20.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-20.3 Global Boundary
- [ ] 実施操作: Global Boundary。実施内容: アプリ全体を囲む `ErrorBoundary` コンポーネント。 / クラッシュ時に、白い画面ではなく「エラー画面」を出す。 / 機内モードにして操作すると、「通信魔法が届かない！」という画面が出る。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Global Boundary に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-20.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/10_error_ui.md`
- `Doc/specs/09_screen_flow.md`
