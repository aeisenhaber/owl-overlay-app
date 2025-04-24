import { db } from '@/lib/db';

export async function getValidAccessToken(userId: string): Promise<string> {
    const token = await db.twitchToken.findUnique({ where: { userId } });

    if (!token) throw new Error('Token not found');

    if (new Date() < token.expiresAt) {
        return token.accessToken;
    }

    // Refresh token
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            client_id: process.env.TWITCH_CLIENT_ID!,
            client_secret: process.env.TWITCH_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const refreshed = await response.json();

    if (refreshed.status >= 400) {
        console.error('Failed to refresh Twitch token:', refreshed);
        throw new Error('Refresh token failed');
    }

    await db.twitchToken.update({
        where: { userId },
        data: {
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
            expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
        },
    });

    return refreshed.access_token;
}
