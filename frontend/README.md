# QuestLogic Frontend (Expo Bare)

このディレクトリは Expo Bare Workflow で iOS / Android ネイティブ実行を行います。

## セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. `.env` を作成し、API URLを設定

```bash
EXPO_PUBLIC_API_BASE_URL=http://<LAN_IP>:3000
```

3. ネイティブプロジェクトを生成（初回または app.json 更新時）

```bash
npx expo prebuild --clean
```

## 起動コマンド

### iOS Simulator

```bash
npx expo run:ios
```

### Android Emulator

```bash
npx expo run:android
```

## API疎通確認

1. `backend` を起動する
2. `frontend` を `run:ios` または `run:android` で起動する
3. アプリで「AI分析を開始する」を実行し、レスポンスが返ることを確認する

## 注意点

- Expo Go 前提ではなく、ネイティブビルド（Development Build）前提です。
- 画像アセット（`assets/icon.png` など）が壊れていると `expo prebuild` が失敗します。
- 実機利用時は `EXPO_PUBLIC_API_BASE_URL` にPCのLAN IPを設定してください。
