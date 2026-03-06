import { Router } from 'express';
import { joinFamily, consumePoints, updateProfile, getInviteCode } from '../controllers/user.controller';
import { authenticateJWT, requireParentRole, requireChildRole } from '../middlewares/auth.middleware';

const router = Router();

// 全てのエンドポイントでJWT認証を必須にする
router.use(authenticateJWT);

// 親専用API (招待コードの確認)
router.get('/invite-code', requireParentRole, getInviteCode);

// 子供専用API (家族への参加、ゲーム時間の消費)
router.post('/join-family', requireChildRole, joinFamily);
router.post('/consume-points', requireChildRole, consumePoints);

// 家族全員が実行可能なAPI (プロフィール更新)
router.put('/profile', updateProfile);

export default router;