import { Request, Response } from 'express';
import { prisma } from '../app';

// 1. 子供のゲーム状態取得 (GET /api/family/game-status)
export const getGameStatus = async (req: Request, res: Response) => {
    try {
        // 【Security】 URLパラメータではなくJWTからfamilyIdを取得
        const familyId = req.user.familyId;
        if (!familyId) return res.status(400).json({ error: '家族情報が設定されていません。' });

        const family = await prisma.family.findUnique({ 
            where: { id: familyId },
            include: { users: { where: { role: 'CHILD' } } }
        });

        if (!family) return res.status(404).json({ error: '家族情報が見つかりません。' });

        // ポイント → 時間(分) 換算ロジック
        // 子供全員のポイントを合算して表示（個別管理が必要な場合は要件定義変更が必要）
        const totalChildPoints = family.users.reduce((sum, child) => sum + child.currentPoints, 0);
        const gameRemainingMinutes = totalChildPoints * family.minutesPerPoint;

        return res.status(200).json({
            success: true,
            gameRemainingMinutes: gameRemainingMinutes,
            smartphoneRemainingMinutes: gameRemainingMinutes, // 現在はゲームとスマホ時間を同一として扱う
            isForceLocked: family.isForceLocked
        });
    } catch (error) {
        console.error('ゲーム状態取得エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

// 2. 強制ロック・解除 (POST /api/family/lock)
export const toggleForceLock = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        const { locked } = req.body;
        
        if (typeof locked !== 'boolean') {
            return res.status(400).json({ error: 'lockedパラメータは真偽値(true/false)で指定してください。' });
        }

        await prisma.family.update({
            where: { id: familyId },
            data: { isForceLocked: locked }
        });

        return res.status(200).json({ 
            success: true, 
            locked 
        });
    } catch (error) {
        console.error('ロック設定エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

// 3. ゲーム・スマホ時間の延長 (POST /api/family/extend-time)
export const extendTime = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        const { minutes } = req.body;

        // バリデーション
        if (!minutes || typeof minutes !== 'number' || minutes <= 0) {
            return res.status(400).json({ error: '延長する時間(分)を正の整数で指定してください。' });
        }

        const family = await prisma.family.findUnique({ 
            where: { id: familyId },
            include: { users: { where: { role: 'CHILD' } } } // 子供を特定
        });

        if (!family) return res.status(404).json({ error: '家族情報が見つかりません。' });

        // 時間(分) → ポイント 換算ロジック
        // 例: 30分延長、レート5分/ptの場合 → 6pt追加
        // 割り切れない場合は「切り上げ(Math.ceil)」して、子供に有利な計算を行う
        const pointsToAdd = Math.ceil(minutes / family.minutesPerPoint);

        // 家族内の全ての子供(CHILD)にポイントを付与する
        // (PrismaのupdateManyは使えないケースがあるため、トランザクションで処理推奨だが今回は簡易実装)
        await prisma.user.updateMany({
            where: { 
                familyId: familyId,
                role: 'CHILD'
            },
            data: {
                currentPoints: { increment: pointsToAdd }
            }
        });

        // 最新の状態を再計算して返却
        // (updateManyは更新後の値を返さないため、メモリ上で計算)
        const currentTotalPoints = family.users.reduce((sum, child) => sum + child.currentPoints, 0);
        const newTotalPoints = currentTotalPoints + (pointsToAdd * family.users.length); // 全員分増えるため
        const newRemainingMinutes = newTotalPoints * family.minutesPerPoint;

        return res.status(200).json({
            success: true,
            newGameRemainingMinutes: newRemainingMinutes,
            newSmartphoneRemainingMinutes: newRemainingMinutes
        });

    } catch (error) {
        console.error('時間延長エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

// 4. 設定取得などその他の既存関数...
export const getFamilySettings = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
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
        return res.status(500).json({ error: 'サーバーエラー' });
    }
};

export const updateFamilySettings = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        const { minutesPerPoint } = req.body;
        if (!Number.isInteger(minutesPerPoint) || minutesPerPoint < 1 || minutesPerPoint > 60) {
            return res.status(400).json({ error: '1ポイントあたりの分数は1〜60の整数で指定してください。' });
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
        return res.status(500).json({ error: 'サーバーエラー' });
    }
};

export const getAISettings = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        const family = await prisma.family.findUnique({ where: { id: familyId } });
        const defaultSettings = { strictness: 3, focus: 2, ng: { missingProcess: true, workTimeMismatch: false, imageReuse: false }};
        const settings = family?.aiSettings || defaultSettings;
        return res.status(200).json({ success: true, data: settings });
    } catch (error) {
        return res.status(500).json({ error: 'サーバーエラー' });
    }
};

export const updateAISettings = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        const updates = req.body;
        const family = await prisma.family.findUnique({ where: { id: familyId } });
        const currentSettings = (family?.aiSettings as any) || { strictness: 3, focus: 2, ng: {} };
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