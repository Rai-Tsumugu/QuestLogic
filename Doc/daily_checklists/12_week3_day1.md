# Week 3 Day 1: Gamification Logic (Energy Calculation)（当日運用版）

## 作業時間目安
- 想定: 3-4時間
- 実行主体: 作業者

## 本日のゴール
1. AIスコアと学習時間から、基本エネルギーを計算できる。
1. 「解き直し」「丁寧」などのタグに応じたボーナスを加算できる。
1. 計算結果を `energy_transactions` コレクションに保存できる。

## 本日の重点差分
- エネルギー計算は固定3ケースの入出力表で検証する。

## 開始前チェック
- [ ] ブランチ確認: `git branch --show-current` が対象ブランチを指している
- [ ] 依存関係確認: `cd frontend && npm install` が成功している
- [ ] Firebase接続先確認: 開発用プロジェクトIDを使用している
- [ ] 実機接続確認: 必要端末（親/子）でアプリ起動できる
- [ ] ログ取得手段確認: Metro, Firebase Console, Functionsログを閲覧できる

## 実行チェックリスト

### STEP-12.1 Algorithm Implementation
- [ ] 実施操作: Algorithm Implementation。実施内容: `src/lib/gamification.ts` を作成。 / `calculateEnergy(duration, score, tags)` 関数を実装。 / 仕様 `Doc/specs/07_gamification.md` に従う（係数: 0.2 ~ 1.0）。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Algorithm Implementation に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-12.1): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-12.2 Bonus Logic
- [ ] 実施操作: Bonus Logic。実施内容: タグ（`erasure`, `red_pen`）が含まれていたら +5分 などの処理を追加。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Bonus Logic に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-12.2): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

### STEP-12.3 Save Transaction
- [ ] 実施操作: Save Transaction。実施内容: クエスト完了処理（または承認時処理）に、エネルギー加算処理を追加。 / `energy_transactions` に `{ userId, amount: 45, type: 'quest_reward' }` を保存。 / リザルト画面で表示される獲得エネルギーが、計算ロジック通りになっている。
- [ ] コマンド/操作: 対象機能を実機で操作し、Metroログ/Consoleログを採取
- [ ] 期待結果: Save Transaction に関する主導線がエラーなく完走し、異常系は意図した挙動になる。
- [ ] 証跡 (EVID-12.3): スクリーンショット、ログ抜粋、DB/Storage確認パスを記録する

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
- `Doc/specs/07_gamification.md`
- `Doc/specs/05_data_persistence.md`
