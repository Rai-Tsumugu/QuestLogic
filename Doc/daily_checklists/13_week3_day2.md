# Week 3 Day 2: Result Animation (演出)（当日運用版）

## 作業時間目安
- 想定: 3-4時間
- 実行主体: 作業者

## 本日のゴール
1. リザルト画面表示時、ドラムロール的な演出が入る。
1. スコアがカウントアップ表示される。
1. 高スコア時には紙吹雪（Confetti）などのエフェクトが出る。

## 本日の重点差分
- 演出は閾値分岐と低性能端末フォールバックを確認する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-13.1 Libraries
- [ ] 実施操作: Libraries。実施内容: `react-native-reanimated` (導入済確認)。 / `lottie-react-native` をインストール（必要なら）。 / `react-native-confetti-cannon` 等のパーティクルライブラリ導入。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Libraries に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-13.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-13.2 Score Count Up
- [ ] 実施操作: Score Count Up。実施内容: `Reanimated` を使い、数字を `0` から `TargetScore` まで変化させるコンポーネント作成。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Score Count Up に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-13.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-13.3 Visual Effects
- [ ] 実施操作: Visual Effects。実施内容: 背景色をスコアによって変える（Gold, Silver, Bronze）。 / 80点以上なら `Confetti` を発火させる。 / リザルト画面を開くと、動きがあって楽しい。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Visual Effects に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-13.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/13_micro_interactions.md`
- `Doc/specs/06_feedback_system.md`
