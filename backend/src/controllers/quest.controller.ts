/**
 * ------------------------------------------------------------------
 * Quest Controller
 * @description
 * クエスト（宿題）の提出、画像アップロード処理、AI分析の実行、
 * および結果と報酬(ポイント)のデータベース保存を行います。
 * ------------------------------------------------------------------
 */

import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../app';
import { analyzeHomeworkImages } from '../services/gemini.service';

// ------------------------------------------------------------------
// 画像アップロードの設定 (Multer)
// ------------------------------------------------------------------
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const uploadImages = multer({ storage }).fields([
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage', maxCount: 1 }
]);

/**
 * ------------------------------------------------------------------
 * クエスト提出 API (POST /api/quests/submit)
 * ------------------------------------------------------------------
 */
export const submitQuest = async (req: Request, res: Response) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const beforeImage = files['beforeImage']?.[0];
        const afterImage = files['afterImage']?.[0];

        if (!beforeImage || !afterImage) {
            return res.status(400).json({ error: 'BeforeとAfterの両方の画像が必要です。' });
        }

        const { childId, familyId, subject, topic, parentFocus } = req.body;

        if (!childId || !familyId) {
            return res.status(400).json({ error: 'childIdとfamilyIdが必要です。' });
        }

        const beforeImageUrl = `/uploads/${beforeImage.filename}`;
        const afterImageUrl = `/uploads/${afterImage.filename}`;

        // 1. 分析中のクエストレコードを作成
        let quest = await prisma.quest.create({
            data: {
                childId,
                familyId,
                subject: subject || '未指定',
                topic: topic || '未指定',
                parentFocus: parentFocus || '特になし',
                beforeImageUrl,
                afterImageUrl,
                status: 'ANALYZING',
            }
        });

        // 2. AI分析を実行
        const aiResult = await analyzeHomeworkImages(
            beforeImage.path,
            afterImage.path,
            { subject, topic, parentFocus }
        );

        // 3. AIによる基本報酬の計算 (最大40分)
        const aiBaseMinutes = Math.floor((aiResult.total_score / 100) * 40);

        // 4. トランザクションでクエストの更新とユーザーウォレットの加算を同時に行う
        await prisma.$transaction([
            prisma.quest.update({
                where: { id: quest.id },
                data: {
                    status: 'COMPLETED',
                    aiResult: aiResult,
                    earnedPoints: aiBaseMinutes,
                    finishedAt: new Date()
                }
            }),
            prisma.user.update({
                where: { id: childId },
                data: {
                    currentPoints: { increment: aiBaseMinutes }
                }
            })
        ]);

        // 更新後のクエスト情報を再取得して返す
        quest = await prisma.quest.findUnique({ where: { id: quest.id } }) as any;

        return res.status(200).json({
            success: true,
            message: 'クエストが完了しました。',
            data: quest
        });

    } catch (error) {
        console.error('クエスト提出エラー:', error);
        return res.status(500).json({ error: 'サーバー内部エラーが発生しました。' });
    }
};

/**
 * ------------------------------------------------------------------
 * 家族のクエスト一覧取得 API (GET /api/quests)
 * ------------------------------------------------------------------
 */
export const getFamilyQuests = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;

        const quests = await prisma.quest.findMany({
            where: { familyId: familyId },
            orderBy: { startedAt: 'desc' },
            include: {
                child: { select: { name: true, avatarUrl: true } }
            }
        });

        return res.status(200).json({ success: true, data: quests });
    } catch (error) {
        console.error('クエスト取得エラー:', error);
        return res.status(500).json({ error: 'データの取得に失敗しました。' });
    }
};

/**
 * ------------------------------------------------------------------
 * 親のサポート（追加報酬付与） API (POST /api/quests/:id/bonus)
 * ------------------------------------------------------------------
 */
export const addParentBonus = async (req: Request, res: Response) => {
    try {
        const questId = req.params.id;
        const { bonusPoints } = req.body;

        if (!bonusPoints || isNaN(bonusPoints)) {
            return res.status(400).json({ error: 'ボーナスポイントを正しく指定してください。' });
        }

        const quest = await prisma.quest.findUnique({ where: { id: questId } });
        if (!quest) {
            return res.status(404).json({ error: 'クエストが見つかりません。' });
        }

        // トランザクションでクエストの累計ポイント更新と、ユーザーのウォレット加算を行う
        const [updatedQuest] = await prisma.$transaction([
            prisma.quest.update({
                where: { id: questId },
                data: { earnedPoints: { increment: Number(bonusPoints) } }
            }),
            prisma.user.update({
                where: { id: quest.childId },
                data: { currentPoints: { increment: Number(bonusPoints) } }
            })
        ]);

        return res.status(200).json({
            success: true,
            message: `子供に ${bonusPoints} 分の追加ボーナスを付与しました！`,
            data: updatedQuest
        });
    } catch (error) {
        console.error('ボーナス付与エラー:', error);
        return res.status(500).json({ error: 'ボーナスの付与に失敗しました。' });
    }
};

/**
 * ------------------------------------------------------------------
 * クエスト詳細取得 API (GET /api/quests/:id)
 * ------------------------------------------------------------------
 */
export const getQuestById = async (req: Request, res: Response) => {
    try {
        const questId = req.params.id;
        const familyId = req.user.familyId;

        const quest = await prisma.quest.findFirst({
            where: { 
                id: questId,
                familyId: familyId
            },
            include: { child: { select: { name: true } } }
        });

        if (!quest) {
            return res.status(404).json({ error: 'クエストが見つかりません。' });
        }

        return res.status(200).json({ success: true, data: quest });
    } catch (error) {
        return res.status(500).json({ error: 'データの取得に失敗しました。' });
    }
};