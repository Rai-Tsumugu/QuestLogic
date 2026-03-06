import { Request, Response } from 'express';
import { prisma } from '../app';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini APIの初期化 (環境変数からAPIキーを取得)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 画像ファイルをGeminiが読み込める形式に変換するヘルパー関数
function fileToGenerativePart(filePath: string, mimeType: string) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };
}

// クエスト一覧取得 (家族全員が可能)
export const getQuests = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        if (!familyId) return res.status(400).json({ error: '家族連携が完了していません。' });

        const quests = await prisma.quest.findMany({
            where: { familyId },
            // 【修正】依頼2, 3の要件に合わせて取得フィールドを明示的に指定
            select: {
                id: true,
                familyId: true,
                status: true,
                earnedPoints: true,
                createdAt: true, // 依頼3: createdAt の追加
                beforeImageUrl: true, // 依頼2: 画像URLの追加
                afterImageUrl: true,  // 依頼2: 画像URLの追加
                subject: true,        // 依頼2: 教科の追加
                // topic は既存スキーマにない場合は subject で代用するか、スキーマ追加が必要です
                aiResult: true, // 依頼3: aiResult (feedback_to_parent含む) はJSONとして丸ごと返却
                child: {
                    select: { name: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({ success: true, data: quests });
    } catch (error) {
        console.error('クエスト一覧取得エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

// ボーナス付与 (親専用)
export const addBonus = async (req: Request, res: Response) => {
    try {
        const questId = req.params.id;
        const { bonusPoints } = req.body;
        const parentFamilyId = req.user.familyId;

        if (!bonusPoints || typeof bonusPoints !== 'number') {
            return res.status(400).json({ error: 'ボーナスポイントを正しく指定してください。' });
        }

        const quest = await prisma.quest.findUnique({ where: { id: questId } });
        if (!quest) return res.status(404).json({ error: 'クエストが見つかりません。' });
        if (quest.familyId !== parentFamilyId) {
            return res.status(403).json({ error: '他の家族のクエストにはアクセスできません。' });
        }

        const family = await prisma.family.findUnique({ where: { id: parentFamilyId } });
        const minutesPerPoint = family?.minutesPerPoint || 2;

        const updatedQuest = await prisma.quest.update({
            where: { id: questId },
            data: { earnedPoints: quest.earnedPoints + bonusPoints }
        });

        const updatedUser = await prisma.user.update({
            where: { id: quest.childId },
            data: { currentPoints: { increment: bonusPoints } }
        });

        return res.status(200).json({
            success: true,
            message: `子供に ${bonusPoints} ポイントの追加ボーナスを付与しました！`,
            earnedPoints: updatedQuest.earnedPoints,
            earnedMinutes: updatedQuest.earnedPoints * minutesPerPoint,
            currentPoints: updatedUser.currentPoints,
            currentMinutes: updatedUser.currentPoints * minutesPerPoint,
            minutesPerPoint
        });
    } catch (error) {
        console.error('ボーナス付与エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

// クエスト提出とGemini AI分析 (子供専用)
export const submitQuest = async (req: Request, res: Response) => {
    try {
        const childId = req.user.userId;
        const familyId = req.user.familyId;

        if (!familyId) return res.status(400).json({ error: '家族連携が完了していないため、提出できません。' });

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (!files || !files.beforeImage || !files.afterImage) {
            return res.status(400).json({ error: 'BeforeとAfterの両方の画像が必要です。' });
        }

        const beforeImageFile = files.beforeImage[0];
        const afterImageFile = files.afterImage[0];
        const subject = req.body.subject || '未設定';
        const topic = req.body.topic || '未設定';

        // 1. Gemini APIによる画像分析
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const prompt = `あなたはプロの家庭教師です。以下の「勉強前」と「勉強後」の画像を比較し、子供の学習成果を評価してください。
        教科は「${subject}」、トピックは「${topic}」です。
        必ず以下のJSONフォーマットのみを絶対に出力してください。マークダウン( \`\`\`json 等 )は一切含めないでください。
        {
          "summary": "全体の要約（簡潔に）",
          "score_breakdown": {
            "volume": 8,
            "process": 9,
            "carefulness": 7,
            "review": 6
          },
          "total_score": 81,
          "features": [
            { "type": "特徴種別", "location": "場所", "description": "詳細説明" }
          ],
          "suspicion_flag": false,
          "suspicion_reason": null,
          "feedback_to_child": "子供への優しいメッセージ",
          "feedback_to_parent": "親へのメッセージ"
        }`;

        const beforePart = fileToGenerativePart(beforeImageFile.path, beforeImageFile.mimetype);
        const afterPart = fileToGenerativePart(afterImageFile.path, afterImageFile.mimetype);

        // Geminiにリクエスト送信
        const result = await model.generateContent([prompt, beforePart, afterPart]);
        let responseText = result.response.text();
        
        // Geminiがマークダウン付きで返してきた場合の除去処理
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // JSONパース
        let aiResultData;
        try {
            aiResultData = JSON.parse(responseText);
        } catch (e) {
            console.error('Geminiレスポンスのパースエラー:', responseText);
            return res.status(500).json({ error: 'AIの分析結果を読み取れませんでした。もう一度お試しください。' });
        }

        // 2. 報酬とレベルの計算
        const user = await prisma.user.findUnique({ where: { id: childId } });
        if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません。' });

        const family = await prisma.family.findUnique({ where: { id: familyId } });
        const minutesPerPoint = family?.minutesPerPoint || 2;

        // ルール: 合計スコア(100点満点)を5で割った数値をポイントとする (例: 80点 -> 16ポイント)
        const earnedPoints = Math.floor((aiResultData.total_score || 0) / 5);
        const earnedMinutes = earnedPoints * minutesPerPoint;
        
        // ルール: 100 EXPごとに1レベルアップ
        const currentExp = user.exp || 0;
        const earnedExp = aiResultData.total_score || 0;
        const newExp = currentExp + earnedExp;
        const currentLevel = user.level || 1;
        const newLevel = Math.floor(newExp / 100) + 1;
        const isLevelUp = newLevel > currentLevel;

        // 3. データベースの更新
        const newQuest = await prisma.quest.create({
            data: {
                childId,
                familyId,
                status: 'COMPLETED',
                earnedPoints,
                subject,
                beforeImageUrl: beforeImageFile.path,
                afterImageUrl: afterImageFile.path,
                aiResult: aiResultData as any
            }
        });

        const updatedUser = await prisma.user.update({
            where: { id: childId },
            data: {
                currentPoints: { increment: earnedPoints },
                exp: newExp,
                level: newLevel 
            }
        });

        // 4. APIレスポンスの返却
        return res.status(200).json({
            success: true,
            message: isLevelUp ? `レベルアップしました！ Lv.${newLevel}` : 'AI分析が完了し、ポイントを獲得しました！',
            isLevelUp,
            newLevel,
            data: {
                id: newQuest.id,
                childId: newQuest.childId,
                familyId: newQuest.familyId,
                status: newQuest.status,
                aiResult: newQuest.aiResult
            },
            earnedPoints,
            earnedMinutes,
            currentPoints: updatedUser.currentPoints,
            currentMinutes: updatedUser.currentPoints * minutesPerPoint,
            minutesPerPoint
        });
    } catch (error) {
        console.error('クエスト提出＆AI分析エラー:', error);
        return res.status(500).json({ error: 'サーバー処理中にエラーが発生しました。' });
    }
};