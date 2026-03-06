import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ExpressのRequestインターフェースを拡張してuserプロパティを追加
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

// JWTトークンの有効性を検証する基本ミドルウェア
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
            if (err) return res.status(403).json({ error: 'トークンが無効または期限切れです。' });
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: '認証トークンが必要です。' });
    }
};

// 親アカウント(PARENT)のみアクセスを許可するガード
export const requireParentRole = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'PARENT') {
        return res.status(403).json({ error: '親アカウントのみ実行可能な操作です。' });
    }
    next();
};

// 子供アカウント(CHILD)のみアクセスを許可するガード
export const requireChildRole = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'CHILD') {
        return res.status(403).json({ error: '子供アカウントのみ実行可能な操作です。' });
    }
    next();
};