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
import multer from 'multer';

// ルーターのインポート
import authRoutes from './routes/auth.routes';
import questRoutes from './routes/quest.routes';
import userRoutes from './routes/user.routes';
import familyRoutes from './routes/family.routes';
import { authenticateJWT } from './middlewares/auth.middleware';

// DBクライアントの初期化
export const prisma = new PrismaClient();
const app = express();
const upload = multer({ dest: 'uploads/' });

// ミドルウェアの設定
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// ------------------------------------------------------------------
// Dev Tools用 Basic認証ミドルウェア (外部からの不正アクセス防止)
// ------------------------------------------------------------------
const devAuth = (req: any, res: any, next: any) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (login === 'admin' && password === 'Quest2404') {
        return next();
    }

    res.set('WWW-Authenticate', 'Basic realm="QuestLogic Dev Portal"');
    res.status(401).send('アクセスが拒否されました。正しいパスワードを入力してください。');
};

// ------------------------------------------------------------------
// APIルーティングの登録 
// ------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/users', userRoutes);
app.use('/api/family', familyRoutes);

// 【セキュリティ強化】Gemini直叩きAPIを無認証から JWT認証必須(authenticateJWT) にガード
app.post(
    '/api/analyze', 
    authenticateJWT, 
    upload.fields([{ name: 'beforeImage', maxCount: 1 }, { name: 'afterImage', maxCount: 1 }]), 
    async (req: Request, res: Response) => {
        try {
            // ==============================================================
            // 💡 ここに既存の /api/analyze 用の Gemini 呼び出しロジックを配置してください。
            // const metadata = JSON.parse(req.body.metadata || '{}');
            // const result = await ...
            // res.json(result); // ※ successラッパーを持たせずJSONをそのまま返す仕様
            // ==============================================================
            
            // 以下はエラーを防ぐためのダミーレスポンスです。実際のロジックに置き換えてください。
            res.json({
                summary: "全体の要約",
                score_breakdown: { volume: 8, process: 9, carefulness: 7, review: 6 },
                total_score: 81,
                features: [],
                suspicion_flag: false,
                suspicion_reason: null,
                feedback_to_child: "子供向けメッセージ",
                feedback_to_parent: "親向けメッセージ"
            });
        } catch (error) {
            console.error('Analyze API Error:', error);
            res.status(500).json({ error: 'AI分析中にエラーが発生しました。' });
        }
    }
);

// ------------------------------------------------------------------
// 開発・テスト用API (Dev Tools)
// ------------------------------------------------------------------

// ヘルスチェック用 (無認証でOK)
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        success: true, 
        message: 'QuestLogic API稼働中',
        ai: { configured: true, provider: "gemini" }
    });
});

// 開発用ダミーAPI: ロール(役割)を指定してテストログイン (【修正】Basic認証で外部からの取得をブロック)
app.get('/api/test/login/:role', devAuth, async (req: Request, res: Response) => {
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

// 開発者用テストサイトの設定
app.use('/dev', devAuth, express.static(path.join(process.cwd(), 'src/public')));

// ------------------------------------------------------------------
// サーバー起動
// ------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`QuestLogic API Server is running on port ${PORT}`);
});

export default app;