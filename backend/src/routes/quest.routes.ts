import { Router } from 'express';
import { submitQuest, uploadImages, getFamilyQuests, addParentBonus } from '../controllers/quest.controller';
import { authenticateJWT, requireParentRole } from '../middlewares/auth.middleware';

const router = Router();

// すべてのクエスト関連APIはログイン(JWT)が必須
router.use(authenticateJWT);

// クエスト一覧取得 (親・子供どちらもアクセス可能)
router.get('/', getFamilyQuests);

// クエスト提出 (画像アップロードを含む)
router.post('/submit', uploadImages, submitQuest);

// 親のサポート(ボーナス付与) (親のみアクセス可能)
router.post('/:id/bonus', requireParentRole, addParentBonus);

export default router;