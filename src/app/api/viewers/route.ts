// src/app/api/viewers/route.ts
import { NextResponse } from 'next/server';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

export async function GET() {
    try {
        if (!accessToken || Date.now() > tokenExpiry) {
            const res = await fetch('https://id.twitch.tv/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: process.env.TWITCH_CLIENT_ID!,
                    client_secret: process.env.TWITCH_CLIENT_SECRET!,
                    grant_type: 'client_credentials'
                })
            });

            const data = await res.json();
            accessToken = data.access_token;
            tokenExpiry = Date.now() + data.expires_in * 1000;
        }

        const twitchRes = await fetch(`https://api.twitch.tv/helix/streams?user_login=${process.env.TWITCH_CHANNEL}`, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID!,
                Authorization: `Bearer ${accessToken}`
            }
        });

        const json = await twitchRes.json();
        const count = json?.data?.[0]?.viewer_count ?? 0;

        return NextResponse.json({ viewer_count: count });
    } catch (error) {
        console.error('Twitch API error:', error);
        return NextResponse.json({ viewer_count: 0 });
    }
}
