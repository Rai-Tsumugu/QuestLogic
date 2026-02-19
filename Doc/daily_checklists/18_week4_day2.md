# Week 4 Day 2: Notifications (通知)（当日運用版）

## 作業時間目安
- 想定: 3-4時間
- 実行主体: 作業者

## 本日のゴール
1. 親が承認した瞬間、子供端末に通知が届く。
1. アプリ内通知（バッジやダイアログ）を表示する。

## 本日の重点差分
- 通知遅延を計測し、許容値(<=5秒)を満たすか確認する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-18.1 Expo Notifications
- [ ] 実施操作: Expo Notifications。実施内容: `expo-notifications` をセットアップ。 / 権限リクエストの実装。
- [ ] コマンド/操作: cd frontend && npm run lint && npx tsc --noEmit
- [ ] 期待結果: Expo Notifications に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-18.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-18.2 Local Notification (簡易版)
- [ ] 実施操作: Local Notification (簡易版)。実施内容: アプリ起動中であれば、Firestoreの `onSnapshot` で変更を検知し、トーストを表示。 / 「お母さんが承認しました！ +10分ゲット！」
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Local Notification (簡易版) に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-18.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-18.3 Push Notification (FCM) - Option
- [ ] 実施操作: Push Notification (FCM) - Option。実施内容: 時間があれば、Cloud Functions Trigger (`onUpdate`) でFCMを送信する処理を実装。 / (Day 2時点ではオンアプリ通知のみでも可とする)。 / 親端末で承認ボタンを押すと、(数秒以内に) 子供端末の画面に「承認されました」と表示が出る。
- [ ] コマンド/操作: firebase emulators:start（必要に応じて） / firebase deploy --only 対象サービス
- [ ] 期待結果: Push Notification (FCM) - Option に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-18.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/09_screen_flow.md`
