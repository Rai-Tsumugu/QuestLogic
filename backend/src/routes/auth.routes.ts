import { Router } from 'express';
import { googleLogin } from '../controllers/auth.controller';
import { testLogin } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/google
router.post('/google', googleLogin);
router.post('/test/login/:role', testLogin);

export default router;