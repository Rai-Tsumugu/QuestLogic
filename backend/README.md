# QuestLogic Backend

## セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. `.env` を作成（`.env.example` をコピー）

```bash
cp .env.example .env
```

必須項目:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `GEMINI_API_KEY`

3. Prisma Client を生成

```bash
npx prisma generate
```

4. DB スキーマを反映（初回）

```bash
npx prisma db push
```

5. 開発サーバ起動

```bash
npm run dev
```

## 開発用エンドポイント

- `GET /api/health` ヘルスチェック
- `POST /api/analyze` Before/After画像のAI分析（frontend互換）
- `GET /dev/test.html` 開発者テストページ