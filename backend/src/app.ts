/**
 * ------------------------------------------------------------------
 * QuestLogic: Express Main Server
 * @description
 * メインサーバーの設定、ミドルウェアの登録、APIルーティングを行います。
 * 開発環境ではテスト用の静的ページを提供します。
 * ------------------------------------------------------------------
 */
import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// ルーターのインポート
import authRoutes from './routes/auth.routes';
import questRoutes from './routes/quest.routes';
import userRoutes from './routes/user.routes';

// DBクライアントの初期化
export const prisma = new PrismaClient();
const app = express();

// ミドルウェアの設定
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// ------------------------------------------------------------------
// 2. APIルーティングの登録 
// ------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/users', userRoutes);

// ------------------------------------------------------------------
// 3. 開発・テスト用API (Dev Tools)
// ------------------------------------------------------------------

// ヘルスチェック用
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'QuestLogic API稼働中' });
});

// 開発用ダミーAPI: ロール(役割)を指定してテストログイン
app.get('/api/test/login/:role', async (req: Request, res: Response) => {
    try {
        const reqRole = req.params.role === 'parent' ? 'PARENT' : 'CHILD';
        
        let family = await prisma.family.findFirst();
        if (!family) {
            family = await prisma.family.create({ data: { name: 'テスト用ファミリー' } });
        }

        let user = await prisma.user.findFirst({
            where: { role: reqRole, familyId: family.id }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: `test_${reqRole.toLowerCase()}@example.com`,
                    name: reqRole === 'PARENT' ? 'テスト親' : 'テスト生徒',
                    role: reqRole,
                    familyId: family.id
                }
            });
        }

        // ダミーのJWTトークンを発行
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            { userId: user.id, role: user.role, familyId: user.familyId },
            secret,
            { expiresIn: '24h' }
        );

        res.json({ success: true, token, user });
    } catch (error) {
        console.error('ログインエラー:', error);
        res.status(500).json({ error: 'トークン発行エラー' });
    }
});

// ------------------------------------------------------------------
// 開発者用テストサイトの設定 (Dev Portal)
// ------------------------------------------------------------------
app.use('/dev', express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
    console.log(`🛠️  開発者テスト用ツール: http://localhost:${PORT}/dev/test.html`);
});