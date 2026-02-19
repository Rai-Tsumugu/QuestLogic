# 07_gamification.md

## 概要
学習成果を「遊びの時間（Energy）」に変換するメカニズム。
ユーザーシナリオに基づき、「やった分だけ遊べる」公平感と、「工夫すればもっと遊べる」動機づけを提供する。

## エネルギー計算ロジック
`CalculatedEnergy (min) = [BaseTime (min)] + [BonusTime (min)]`

### 1. Base Time (基本報酬)
学習した時間そのものを評価のベースとするが、AIスコアによる係数を掛ける。
`BaseTime = DurationMin * QualityMultiplier`

*   **DurationMin**: 実学習時間（タイマー計測値）。ただし、親が設定した「1クエストの上限（例: 60分）」でキャップする。
*   **QualityMultiplier**: AIスコア(0-100)に基づく係数。
    *   Score 80-100: **1.0** (学習時間をそのまま遊び時間に変換)
    *   Score 60-79: **0.8**
    *   Score 40-59: **0.5**
    *   Score 0-39: **0.2** (不正や書き殴りの場合、時間はほとんど付与されない)

### 2. Bonus Time (追加報酬)
特定の「良い行動」に対して固定時間を加算する。
`BonusTime = Σ (DetectedFeatureBonus)`

*   **Correction Bonus (解き直し)**: +5分
    *   AIが「赤ペン修正」「消しゴム修正」を検知した場合。
*   **Streak Bonus (継続)**: +3分 / 日
    *   3日以上連続でクエスト達成時。
*   **Parent Boost (親からのボーナス)**: +10分 (任意)
    *   親が承認時に「花丸スタンプ」などを送った場合。

### 計算例
**シナリオ1の健太くんの場合**:
*   学習時間: 30分
*   AIスコア: 85点 (QualityMultiplier = 1.0)
*   検知: 消しゴム修正あり (+5分), 丁寧な図解 (+10分相当の評価)

`Total = (30分 * 1.0) + 15分(Bonus) = 45分`

**シナリオ3 (不正) の場合**:
*   学習時間: 5分 (書き写し)
*   AIスコア: 15点 (QualityMultiplier = 0.2)

`Total = (5分 * 0.2) + 0分 = 1分` -> **「割に合わない」と感じさせる**

## IoT連携 (Smart-Gate Box)
### ユーザー体験 (UX)
1.  **Unlock**: アプリで「遊ぶ」ボタン押下。
2.  **Sound**: スマホから「ピロッ♪」と解錠音が鳴る（Box側の解錠音と同期）。
3.  **Physical**: Boxのソレノイドロックが外れ、物理的に蓋が開く。
4.  **Play**: ゲーム機を取り出して遊ぶ。アプリ画面はカウントダウン表示。
5.  **Finish**: 時間切れ警告（アラーム）、または自主終了。
6.  **Lock**: ゲーム機を戻し、蓋を閉める。スマホを再度かざして施錠確認。

## データ管理
*   `energy_transactions` collection in Firestore:
    *   `userId`
    *   `amount`: +45, -30, etc.
    *   `reason`: "quest_reward", "play_session"
    *   `relatedQuestId`: string

## 受け入れ条件 (Acceptance Criteria)
1.  高スコア時には学習時間と同等以上のエネルギーが付与されること。
2.  低スコア時にはエネルギーが大幅に減額されること。
3.  ボーナス加算が正しく機能すること。
