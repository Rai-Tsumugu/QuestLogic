1. npm install の実行

2. .envの必要な設定
.envファイルはbackendフォルダーの中となる。
# ------------------------------------------------------------------
# QuestLogic Backend Environment Variables
# ------------------------------------------------------------------

# サーバー設定 (Server Config)
PORT=3000

# データベース接続 (PostgreSQL)
# 形式: postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]?schema=public
DATABASE_URL=""

# Google OAuth 2.0 (認証用)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# JWT セキュリティキー (トークン暗号化用・任意の複雑な文字列)
JWT_SECRET=""

# Gemini AI (宿題分析用)
GEMINI_API_KEY=""
上の形式に従って中身を埋めること
中に入るものはDiscordのバックエンドチャンネルの"Google Auth2.0"スレッドを開き、固定メッセージを参考

3. schema.prismaの設定
backend/src/ の中にprisma フォルダー生成後、schema.prismaファイルを生成
開発Discordのバックエンドチャンネルの"DB関連&API"スレッドを開き、固定メッセージを入力