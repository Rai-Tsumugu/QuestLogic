import { Router } from 'express';
import multer from 'multer';
import { submitQuest, addBonus, getQuests } from '../controllers/quest.controller';
import { authenticateJWT, requireParentRole, requireChildRole } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // メモリリーク対策としてディスク保存を使用

// 全てのエンドポイントでJWT認証を必須にする
router.use(authenticateJWT);

// 子供専用API (クエスト提出)
router.post(
    '/submit',
    requireChildRole,
    upload.fields([{ name: 'beforeImage', maxCount: 1 }, { name: 'afterImage', maxCount: 1 }]),
    submitQuest
);

// 親専用API (ボーナス付与)
router.post('/:id/bonus', requireParentRole, addBonus);

// 家族全員が実行可能なAPI (クエスト一覧取得)
router.get('/', getQuests);

export default router;