import { Request, Response } from 'express';
import { prisma } from '../app';

// 家族設定の取得 (GET /api/family/settings)
export const getFamilySettings = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        if (!familyId) return res.status(400).json({ error: '家族情報が設定されていません。' });

        const family = await prisma.family.findUnique({
            where: { id: familyId },
            select: { id: true, minutesPerPoint: true, updatedAt: true }
        });

        if (!family) return res.status(404).json({ error: '家族情報が見つかりません。' });

        return res.status(200).json({
            success: true,
            familyId: family.id,
            minutesPerPoint: family.minutesPerPoint,
            updatedAt: family.updatedAt
        });
    } catch (error) {
        console.error('設定取得エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

// 家族設定の更新 (PUT /api/family/settings)
export const updateFamilySettings = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        const { minutesPerPoint } = req.body;

        // バリデーション: 整数かつ1〜60の範囲内
        if (!Number.isInteger(minutesPerPoint) || minutesPerPoint < 1 || minutesPerPoint > 60) {
            return res.status(400).json({ error: '1ポイントあたりの分数は、1から60の間の整数で指定してください。' });
        }

        const updatedFamily = await prisma.family.update({
            where: { id: familyId },
            data: { minutesPerPoint }
        });

        return res.status(200).json({
            success: true,
            minutesPerPoint: updatedFamily.minutesPerPoint,
            updatedAt: updatedFamily.updatedAt
        });
    } catch (error) {
        console.error('設定更新エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

// 1-A. 子供のゲーム状態取得 (GET /api/family/game-status)
export const getGameStatus = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        const family = await prisma.family.findUnique({ 
            where: { id: familyId },
            include: { users: { where: { role: 'CHILD' } } }
        });
        if (!family) return res.status(404).json({ error: '家族情報が見つかりません。' });

        // 子供全員の合計ポイントからゲーム時間を算出 (要件に応じて特定の子供のIDを指定するよう改修可能)
        const totalChildPoints = family.users.reduce((sum, child) => sum + child.currentPoints, 0);
        const gameRemainingMinutes = totalChildPoints * family.minutesPerPoint;

        return res.status(200).json({
            success: true,
            gameRemainingMinutes,
            smartphoneRemainingMinutes: gameRemainingMinutes, // 現在は同等として扱う
            isForceLocked: family.isForceLocked
        });
    } catch (error) {
        return res.status(500).json({ error: 'サーバーエラー' });
    }
};

// 1-B. 強制ロック・解除 (POST /api/family/lock)
export const toggleForceLock = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        const { locked } = req.body;
        
        if (typeof locked !== 'boolean') return res.status(400).json({ error: 'lockedパラメータは真偽値で指定してください。' });

        await prisma.family.update({
            where: { id: familyId },
            data: { isForceLocked: locked }
        });

        return res.status(200).json({ success: true, locked });
    } catch (error) {
        return res.status(500).json({ error: 'サーバーエラー' });
    }
};

// --- 依頼4: AI設定の取得・更新API ---

// 4-A. AI設定取得 (GET /api/family/settings/ai)
export const getAISettings = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        const family = await prisma.family.findUnique({ where: { id: familyId } });
        
        // デフォルト設定
        const defaultSettings = { strictness: 3, focus: 2, ng: { missingProcess: true, workTimeMismatch: false, imageReuse: false }};
        const settings = family?.aiSettings || defaultSettings;

        return res.status(200).json({ success: true, data: settings });
    } catch (error) {
        return res.status(500).json({ error: 'サーバーエラー' });
    }
};

// 4-B. AI設定更新 (PATCH /api/family/settings/ai)
export const updateAISettings = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        const updates = req.body; // 部分更新を許容
        
        const family = await prisma.family.findUnique({ where: { id: familyId } });
        const currentSettings = (family?.aiSettings as any) || { strictness: 3, focus: 2, ng: {} };
        
        // JSONのマージ
        const newSettings = {
            ...currentSettings,
            ...updates,
            ng: { ...(currentSettings.ng || {}), ...(updates.ng || {}) }
        };

        await prisma.family.update({
            where: { id: familyId },
            data: { aiSettings: newSettings }
        });

        return res.status(200).json({ success: true, data: newSettings });
    } catch (error) {
        return res.status(500).json({ error: 'サーバーエラー' });
    }
};

// --- 依頼5: デバイス管理API ---

// 5-A. デバイス一覧取得 (GET /api/family/devices)
export const getDevices = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        const devices = await prisma.device.findMany({
            where: { familyId },
            select: { id: true, name: true }
        });

        return res.status(200).json({ success: true, data: devices });
    } catch (error) {
        return res.status(500).json({ error: 'サーバーエラー' });
    }
};