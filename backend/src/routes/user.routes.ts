import { Router } from 'express';
import { joinFamily, consumePoints, updateProfile } from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// すべてのユーザー関連APIはログイン(JWT)が必須
router.use(authenticateJWT);

// 家族連携 (招待コード入力)
router.post('/join-family', joinFamily);

// ポイント消費 (ゲーム時間使用)
router.post('/consume-points', consumePoints);

//プロフィール修正
router.put('/profile', updateProfile);
export default router;