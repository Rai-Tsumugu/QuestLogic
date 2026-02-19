# 12_sound_design.md

## 概要
アプリ内のBGM、SE（効果音）、ハプティクス（振動）の仕様。
視覚だけでなく聴覚・触覚でも「達成感」や「世界観」を演出する。

## 1. BGM (Background Music)
ループ再生前提。

*   **Home (Tavern)**:
    *   **イメージ**: 穏やか、リュートや笛の音色、酒場風。
    *   **目的**: リラックスして次のクエストを選ばせる。
*   **Concentration (Focus)**:
    *   **イメージ**: 静かな環境音（焚き火、雨音、森の音）または無音に近いアンビエント。
    *   **目的**: 勉強の邪魔をしない。集中力を高める。
*   **Result (Victory)**:
    *   **イメージ**: アップテンポなファンファーレ。ドラムロールからの盛り上がり。
    *   **目的**: 達成感を最大化する。

## 2. SE (Sound Effects)
*   **Decide (決定)**: 「ピロッ」「カチッ」（高い音）
*   **Cancel (キャンセル)**: 「ブブッ」（低い音）
*   **Picture (撮影)**: 「カシャッ」（レトロなカメラ音）
*   **Level Up / Reward**: 「テレレレッ♪」（華やかな音）
*   **Error**: 「ビビッ！」（警告音）

## 3. Haptics (振動)
スマホのバイブレーション機能を活用。

*   **Success**:
    *   `notificationAsync(Success)`: 短く軽快な2回振動。
    *   リザルト画面でのスコア表示時。
*   **Error**:
    *   `notificationAsync(Error)`: 重く長い振動。
*   **Interaction**:
    *   `impactAsync(Light)`: ボタンを押した時の微細な振動（物理ボタンのような感触）。

## 4. 実装方針 (Expo AV / Haptics)
*   `expo-av`: 音声再生管理。サウンド設定（ON/OFF）をGlobal Stateで持つ。
*   `expo-haptics`: iOS/Androidのネイティブ振動APIを利用。
