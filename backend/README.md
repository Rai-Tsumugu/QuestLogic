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

## 動作確認

1. ヘルスチェック（AI設定状態を確認）

```bash
curl -sS http://localhost:3000/api/health
```

`ai.configured` が `true` なら `GEMINI_API_KEY` 設定済みです。

2. AI分析エンドポイント確認

```bash
curl -X POST http://localhost:3000/api/analyze \
	-F "beforeImage=@./sample-before.jpg" \
	-F "afterImage=@./sample-after.jpg" \
	-F 'metadata={"subject":"算数","topic":"分数","parentFocus":"途中式"}'
```