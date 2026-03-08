import { Router } from 'express';
import { 
    getFamilySettings, updateFamilySettings,
    getGameStatus, toggleForceLock, extendTime, 
    getAISettings, updateAISettings, getDevices,
    addDevice, deleteDevice
} from '../controllers/family.controller';
import { authenticateJWT, requireParentRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateJWT);

// 1. 基本設定
router.get('/settings', requireParentRole, getFamilySettings);
router.put('/settings', requireParentRole, updateFamilySettings);

// 2. ゲーム管理 (依頼内容 TASK-07)
// 注意: フロントエンド要望の /:familyId/game-status はセキュリティのため /game-status に変更
router.get('/game-status', requireParentRole, getGameStatus);
router.post('/lock', requireParentRole, toggleForceLock);
router.post('/extend-time', requireParentRole, extendTime); // 新規追加

// 3. AI設定
router.get('/settings/ai', requireParentRole, getAISettings);
router.patch('/settings/ai', requireParentRole, updateAISettings);

// 4. デバイス管理
router.get('/devices', requireParentRole, getDevices);
router.post('/devices', requireParentRole, addDevice); 
router.delete('/devices/:id', requireParentRole, deleteDevice); 

export default router;