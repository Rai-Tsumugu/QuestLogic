import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

// Google OAuthクライアントの初期化
const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

/**
 * ------------------------------------------------------------------
 * Googleログイン処理 (Google Login & Registration)
 * @route POST /api/auth/google
 * ------------------------------------------------------------------
 */
export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { idToken, role } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'idTokenが必須です。' });
        }

        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: [
                process.env.GOOGLE_WEB_CLIENT_ID,
                process.env.GOOGLE_PARENT_IOS_CLIENT_ID,
                process.env.GOOGLE_PARENT_ANDROID_CLIENT_ID,
                process.env.GOOGLE_CHILD_IOS_CLIENT_ID,
                process.env.GOOGLE_CHILD_ANDROID_CLIENT_ID
            ].filter(Boolean) as string[],
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(401).json({ error: '無効なGoogleトークンです。' });
        }

        const { email, sub: googleId, name, picture } = payload;

        let user = await prisma.user.findUnique({
            where: { email: email },
        });

        // 3. ユーザーが存在しない場合（新規登録）
        if (!user) {
            let newFamilyId = null;

            // 【修正】親(PARENT)として登録する場合は、自身の家族(Family)グループを自動作成する
            if (role === 'PARENT') {
                const familyName = name ? `${name}家のQuest` : '新しい家族のQuest';
                const family = await prisma.family.create({
                    data: { name: familyName }
                });
                newFamilyId = family.id; // 作成した家族のIDを取得
            }
            // ※ 子供(CHILD)の場合は familyId は null のまま（後で招待コードを使って参加する）

            user = await prisma.user.create({
                data: {
                    email: email,
                    googleId: googleId,
                    name: name || '名無し',
                    role: role || 'CHILD',
                    avatarUrl: picture,
                    familyId: newFamilyId // PARENTならIDが入り、CHILDならnullになる
                },
            });
        }

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

/**
 * ------------------------------------------------------------------
 * 開発用テストログイン機能 (Test Login)
 * @route GET /api/test/login/:role
 * ------------------------------------------------------------------
 */
// 【新規】BE-7対応: URLパラメーターからロールを判別し、適切なユーザーを返す
export const testLogin = async (req: Request, res: Response) => {
    try {
        const requestedRole = req.params.role?.toUpperCase();
        
        if (requestedRole !== 'PARENT' && requestedRole !== 'CHILD') {
            return res.status(400).json({ error: '無効なロールです。PARENTまたはCHILDを指定してください。' });
        }

        // 該当ロールのテストユーザーを検索
        let testUser = await prisma.user.findFirst({
            where: { role: requestedRole as 'PARENT' | 'CHILD', email: { contains: 'test' } }
        });

        // 存在しない場合は新規作成
        if (!testUser) {
            testUser = await prisma.user.create({
                data: {
                    email: `test_${requestedRole.toLowerCase()}@example.com`,
                    name: `テスト${requestedRole}`,
                    role: requestedRole as 'PARENT' | 'CHILD',
                }
            });
        }

        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            { userId: testUser.id, role: testUser.role, familyId: testUser.familyId },
            jwtSecret,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            message: `${requestedRole}テストユーザーでログインしました。`,
            token,
            user: testUser
        });
    } catch (error) {
        console.error('テストログインエラー:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};