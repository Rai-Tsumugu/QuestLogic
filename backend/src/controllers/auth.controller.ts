import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

// Google OAuthクライアントの初期化
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * ------------------------------------------------------------------
 * Googleログイン処理 (Google Login & Registration)
 * @route POST /api/auth/google
 * @description
 * フロントエンドから受け取ったGoogleのidTokenを検証し、
 * DBにユーザーが存在しなければ新規作成、存在すれば取得します。
 * その後、QuestLogic専用のJWTアクセストークンを発行します。
 * ------------------------------------------------------------------
 */
export const googleLogin = async (req: Request, res: Response) => {
    try {
        // フロントエンド(またはPostman)から送信されるidTokenと役割(role)を取得
        const { idToken, role } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'idTokenが必須です。' });
        }

        // 1. Googleサーバーでトークンを検証
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(401).json({ error: '無効なGoogleトークンです。' });
        }

        const { email, sub: googleId, name, picture } = payload;

        // 2. データベースでユーザーを検索
        let user = await prisma.user.findUnique({
            where: { email: email },
        });

        // 3. ユーザーが存在しない場合（新規登録）
        if (!user) {
            // ※ デモ用として、自動的にダミーの「家族(Family)」を作成して紐付けます。
            // 実際の運用では「家族招待コード」などのロジックが必要です。
            const family = await prisma.family.create({
                data: { name: `${name}家のQuest` }
            });

            user = await prisma.user.create({
                data: {
                    email: email,
                    googleId: googleId,
                    name: name || '名無し',
                    role: role || 'CHILD', // リクエストにroleがない場合は子供として登録
                    avatarUrl: picture,
                    familyId: family.id
                },
            });
        }

        // 4. QuestLogic用のJWTを生成 (有効期限: 24時間)
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
        const accessToken = jwt.sign(
            { 
                userId: user.id, 
                role: user.role, 
                familyId: user.familyId 
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        // 5. 結果をレスポンスとして返す
        return res.status(200).json({
            success: true,
            message: 'ログインに成功しました。',
            token: accessToken,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
                familyId: user.familyId
            }
        });

    } catch (error) {
        console.error('認証エラー:', error);
        return res.status(500).json({ error: 'サーバー内部エラーが発生しました。' });
    }
};