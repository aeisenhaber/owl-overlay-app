import { db } from '@/lib/db';
import {NextRequest, NextResponse} from 'next/server';

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code');

    // 1. Exchange code for token
    const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: process.env.TWITCH_CLIENT_ID!,
            client_secret: process.env.TWITCH_CLIENT_SECRET!,
            code: code!,
            grant_type: 'authorization_code',
            redirect_uri: process.env.TWITCH_REDIRECT_URI!,
        }),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });

    const {access_token, refresh_token, expires_in} = await tokenRes.json();

    // 2. Fetch Twitch user info
    const userRes = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
            Authorization: `Bearer ${access_token}`,
            'Client-ID': process.env.TWITCH_CLIENT_ID!
        }
    });

    const userData = await userRes.json();
    const user = userData.data[0]; // Twitch returns array of users

    // 3. Save or update in Prisma
    await db.twitchToken.upsert({
        where: {userId: user.id},
        update: {
            username: user.display_name,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: new Date(Date.now() + expires_in * 1000)
        },
        create: {
            userId: user.id,
            username: user.display_name,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: new Date(Date.now() + expires_in * 1000)
        }
    });
}