/**
 * ------------------------------------------------------------------
 * JWT認証ミドルウェア
 * @description
 * リクエストヘッダーの Authorization: Bearer <token> を検証し、
 * 有効な場合は req.user にデコードした情報を付与します。
 * ------------------------------------------------------------------
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// req.user の型定義を拡張
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '認証トークンが提供されていません。' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallback_secret';

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // { userId, role, familyId } などが含まれる
        next();
    } catch (error) {
        return res.status(403).json({ error: 'トークンが無効または期限切れです。' });
    }
};

// 親(PARENT)のみアクセスを許可するミドルウェア
export const requireParentRole = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'PARENT') {
        return res.status(403).json({ error: '保護者の権限が必要です。' });
    }
    next();
};