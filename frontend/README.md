# QuestLogic Frontend (Expo Managed)

このディレクトリは Expo Managed (Expo Go) 版のモバイルアプリです。

## セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. `.env` を作成し、API URLを設定

```bash
EXPO_PUBLIC_API_BASE_URL=http://<LAN_IP>:3000
```

3. 開発サーバ起動

```bash
npm run start
```

4. Expo Go でQRコードを読み込み

## 補足

- 実機端末から `localhost` は使えません。PCのLAN IPを指定してください。
- Firebase Analytics は Expo Go優先のため初期フェーズでは無効化しています。
