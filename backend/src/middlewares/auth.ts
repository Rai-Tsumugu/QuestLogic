import { Request, Response, NextFunction } from 'express';
// TODO: JWT検証ライブラリの実装

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: '認証トークンが必要です (No token provided)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ここでJWTを検証し、ユーザー情報をreq.userにセットする
    // const user = verifyToken(token);
    // req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'トークンが無効です (Invalid token)' });
  }
};