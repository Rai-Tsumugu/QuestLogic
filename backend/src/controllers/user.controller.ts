import { Request, Response } from 'express';
import { prisma } from '../app';

// 家族連携 (子供専用)
export const joinFamily = async (req: Request, res: Response) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.user.userId; // JWTから安全に取得

        if (!inviteCode) return res.status(400).json({ error: '招待コードが必要です。' });

        const family = await prisma.family.findFirst({ where: { inviteCode } });
        if (!family) return res.status(404).json({ error: '無効な招待コードです。' });

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { familyId: family.id }
        });

        return res.status(200).json({
            success: true,
            message: `${family.name} に参加しました！`,
            data: { id: updatedUser.id, familyId: updatedUser.familyId }
        });
    } catch (error) {
        console.error('家族連携エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

// ポイント消費 (子供専用)
export const consumePoints = async (req: Request, res: Response) => {
    try {
        const { consumePoints } = req.body; // 'minutes' ではなく 'consumePoints' を受け取る
        const userId = req.user.userId;
        const familyId = req.user.familyId;

        if (!consumePoints || typeof consumePoints !== 'number' || consumePoints <= 0) {
            return res.status(400).json({ error: '消費するポイントを正しく指定してください。' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.currentPoints < consumePoints) {
            return res.status(400).json({ error: 'ポイント残高が不足しています。' });
        }

        const family = await prisma.family.findUnique({ where: { id: familyId } });
        if (!family) {
            return res.status(400).json({ error: '家族情報が見つかりません。' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { currentPoints: user.currentPoints - consumePoints }
        });

        const remainingMinutes = updatedUser.currentPoints * family.minutesPerPoint;

        return res.status(200).json({
            success: true,
            remainingPoints: updatedUser.currentPoints,
            remainingMinutes: remainingMinutes,
            minutesPerPoint: family.minutesPerPoint
        });
    } catch (error) {
        console.error('ポイント消費エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

// プロフィール更新 (全員可能)
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { grade, specialty, name, avatarUrl } = req.body;
        const userId = req.user.userId;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(grade !== undefined && { grade }),
                ...(specialty !== undefined && { specialty }),
                ...(name !== undefined && { name }),
                ...(avatarUrl !== undefined && { avatarUrl }),
            }
        });

        return res.status(200).json({
            success: true,
            message: 'プロフィールを更新しました。',
            data: {
                id: updatedUser.id,
                grade: updatedUser.grade,
                specialty: updatedUser.specialty,
                name: updatedUser.name,
                avatarUrl: updatedUser.avatarUrl
            }
        });
    } catch (error) {
        console.error('プロフィール更新エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

// 招待コード取得 (親専用)
export const getInviteCode = async (req: Request, res: Response) => {
    try {
        const familyId = req.user.familyId;
        if (!familyId) {
            return res.status(400).json({ error: '家族情報が設定されていません。' });
        }

        const family = await prisma.family.findUnique({ where: { id: familyId } });
        if (!family) {
            return res.status(404).json({ error: '家族情報が見つかりません。' });
        }

        return res.status(200).json({
            success: true,
            inviteCode: family.inviteCode
        });
    } catch (error) {
        console.error('招待コード取得エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { family: true } // 【修正】家族情報を一緒に取得
        });

        if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません。' });
        
        // 【修正】BE-1対応: currentMinutes を計算して返却
        const minutesPerPoint = user.family?.minutesPerPoint || 2;
        const currentMinutes = user.currentPoints * minutesPerPoint;

        return res.status(200).json({ 
            success: true, 
            data: {
                id: user.id,
                name: user.name,
                role: user.role,
                level: user.level,
                exp: user.exp,
                currentPoints: user.currentPoints,
                currentMinutes, // 追加: これでフロントエンドは計算不要
                minutesPerPoint, // 追加: 念のためレートも返す
                grade: user.grade,
                specialty: user.specialty,
                avatarUrl: user.avatarUrl,
                familyId: user.familyId
            } 
        });
    } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};