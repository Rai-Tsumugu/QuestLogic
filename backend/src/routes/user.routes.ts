import { Router } from 'express';
// getInviteCode を追加でインポート
import { joinFamily, consumePoints, updateProfile, getInviteCode } from '../controllers/user.controller';
import { authenticateJWT, requireParentRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

// 招待コードの取得 (親のみ)
router.get('/invite-code', requireParentRole, getInviteCode);

router.post('/join-family', joinFamily);
router.post('/consume-points', consumePoints);
router.put('/profile', updateProfile);

export default router;