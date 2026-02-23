# 09_screen_flow.md

## 概要
アプリ全体の画面遷移図と状態遷移を定義する。
親（Parent）と子（Child）でルートが完全に分岐する「Dual App Strategy」を採用。

## 全体フロー
```mermaid
graph TD
    Splash[Splash Screen] --> CheckAuth{Auth Status?}
    CheckAuth -- No --> Login[Login / SignUp]
    CheckAuth -- Yes --> CheckRole{Role?}
    
    CheckRole -- Parent --> P_Dashboard[Parent Dashboard]
    CheckRole -- Child --> C_Home[Child Home (Quest Board)]
    
    Login --> |SignUp| Onboarding[Onboarding Flow]
    Login --> |Login| CheckRole
```

## 1. 子供用フロー (Child Flow)
### メインループ
`[C_Home]` -> `[Quest Detail]` -> `[Camera (Before)]` -> `[Timer (Concentration)]` -> `[Camera (After)]` -> `[Result]` -> `[C_Home]`

### 詳細遷移
1.  **C_Home (Quest Board)**
    *   Tap "Start Quest" -> `Quest Detail`
    *   Tap "Unlock/Play" -> `Unlock Animation` (Energy消費)
2.  **Camera Context**
    *   `Before Camera` -> (Shutter) -> `Timer Mode`
    *   `Timer Mode` -> (Finish) -> `After Camera (Ghost)`
    *   `After Camera` -> (Upload) -> `Analysis Loading` -> `Result`
3.  **Authentication (Child)**
    *   親端末からの切り替え: `Parent Settings` -> `Switch User` -> `PIN Input` -> `C_Home`
    *   専用端末: `Login` -> `Scan QR (from Parent)` -> `C_Home`

## 2. 親用フロー (Parent Flow)
### メインループ
`[P_Dashboard]` -> `[Report Detail]` -> `[Action (Approve/Reject)]` -> `[P_Dashboard]`

### 詳細遷移
1.  **P_Dashboard**
    *   Tap "Child Card" -> `Report History`
    *   Tap "Notification" -> `Report Detail`
2.  **Report Detail**
    *   Slider操作 -> 画像比較
    *   Tap "Approve" -> `Stamp Select` -> `Sent Animation` -> `P_Dashboard`
    *   Tap "Reject" -> `Reason Input` -> `Sent Animation` -> `P_Dashboard`
3.  **Settings**
    *   `Member Mgmt` -> `Add Child` -> `QR Display`

## 3. 例外フロー
*   **Network Error**:
    *   子供: クエストデータはローカル保存し、次回オンライン時に送信（オフラインでも勉強は続けさせる）。
    *   親: リトライボタン表示。
*   **Maintenance**:
    *   メンテナンス画面へ強制遷移。
