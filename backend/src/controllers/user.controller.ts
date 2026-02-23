/**
 * ------------------------------------------------------------------
 * User & Family Controller
 * @description
 * 家族連携（招待コード入力）や、ポイント（ゲーム時間）の消費を処理します。
 * ------------------------------------------------------------------
 */
import { Request, Response } from 'express';
import { prisma } from '../app';

/**
 * 家族に参加する (子供が親の招待コードを入力)
 * @route POST /api/users/join-family
 */
export const joinFamily = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        const { inviteCode } = req.body;

        if (!inviteCode) {
            return res.status(400).json({ error: '招待コードが必要です。' });
        }

        // 招待コードから家族を検索
        const family = await prisma.family.findUnique({
            where: { inviteCode }
        });

        if (!family) {
            return res.status(404).json({ error: '無効な招待コードです。' });
        }

        // ユーザーの familyId を更新
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { familyId: family.id }
        });

        return res.status(200).json({
            success: true,
            message: `${family.name} に参加しました！`,
            data: updatedUser
        });
    } catch (error) {
        console.error('家族参加エラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};

/**
 * ゲーム時間を消費する (物理ロック解除時などに呼び出し)
 * @route POST /api/users/consume-points
 */
export const consumePoints = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        const { minutes } = req.body; // 消費したい時間(分)

        if (!minutes || isNaN(minutes) || minutes <= 0) {
            return res.status(400).json({ error: '消費する時間を正しく入力してください。' });
        }

        // 現在のポイントを確認
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        if (!user || user.currentPoints < minutes) {
            return res.status(400).json({ error: 'ポイント（ゲーム時間）が足りません。宿題を頑張ろう！' });
        }

        // ポイントをマイナスする
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                currentPoints: {
                    decrement: Number(minutes)
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: `${minutes}分 のロックを解除しました。`,
            currentPoints: updatedUser.currentPoints
        });
    } catch (error) {
        console.error('ポイント消費エラー:', error);
        return res.status(500).json({ error: '処理に失敗しました。' });
    }
};