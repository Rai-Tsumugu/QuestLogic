// src/routes/family.routes.ts

import { Router } from 'express';
import { 
    getFamilySettings, updateFamilySettings,
    getGameStatus, toggleForceLock,
    getAISettings, updateAISettings, getDevices
} from '../controllers/family.controller';
import { authenticateJWT, requireParentRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateJWT);

// API
router.get('/settings', requireParentRole, getFamilySettings);
router.put('/settings', requireParentRole, updateFamilySettings);

// 依頼1: ゲーム管理
router.get('/game-status', requireParentRole, getGameStatus);
router.post('/lock', requireParentRole, toggleForceLock);

// 依頼4: AI設定
router.get('/settings/ai', requireParentRole, getAISettings);
router.patch('/settings/ai', requireParentRole, updateAISettings);

// 依頼5: デバイス管理
router.get('/devices', requireParentRole, getDevices);

export default router;