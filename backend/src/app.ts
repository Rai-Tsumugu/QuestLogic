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
import fs from 'fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { analyzeHomeworkImages } from './services/gemini.service';

// ルーターのインポート
import authRoutes from './routes/auth.routes';
import questRoutes from './routes/quest.routes';
import userRoutes from './routes/user.routes';

// DBクライアントの初期化
export const prisma = new PrismaClient();
const app = express();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    })
});

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
    res.status(200).json({
        success: true,
        message: 'QuestLogic API稼働中',
        ai: {
            configured: Boolean(process.env.GEMINI_API_KEY),
            provider: 'gemini'
        }
    });
});

app.post('/api/analyze', upload.fields([{ name: 'beforeImage', maxCount: 1 }, { name: 'afterImage', maxCount: 1 }]), async (req: Request, res: Response) => {
    let beforeImagePath: string | null = null;
    let afterImagePath: string | null = null;

    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const beforeImage = files?.beforeImage?.[0];
        const afterImage = files?.afterImage?.[0];

        if (!beforeImage || !afterImage) {
            return res.status(400).json({ error: 'BeforeとAfterの両方の画像が必要です。' });
        }

        beforeImagePath = beforeImage.path;
        afterImagePath = afterImage.path;

        const metadataRaw = req.body.metadata ? JSON.parse(req.body.metadata) : {};
        const metadata = {
            subject: metadataRaw.subject || '未指定',
            topic: metadataRaw.topic || '未指定',
            parentFocus: metadataRaw.parentFocus || metadataRaw.parent_focus || '特になし'
        };

        const result = await analyzeHomeworkImages(beforeImagePath, afterImagePath, metadata);
        return res.status(200).json(result);
    } catch (error) {
        console.error('AI分析エラー:', error);
        return res.status(500).json({ error: 'AI分析に失敗しました。' });
    } finally {
        if (beforeImagePath && fs.existsSync(beforeImagePath)) {
            fs.unlinkSync(beforeImagePath);
        }
        if (afterImagePath && fs.existsSync(afterImagePath)) {
            fs.unlinkSync(afterImagePath);
        }
    }
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
app.use('/dev', express.static(path.join(process.cwd(), 'src/public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
    console.log(`🛠️  開発者テスト用ツール: http://localhost:${PORT}/dev/test.html`);
});