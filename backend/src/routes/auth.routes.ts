import { Router } from 'express';
import { googleLogin } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/google
router.post('/google', googleLogin);

export default router;