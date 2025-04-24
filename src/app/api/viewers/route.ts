import { getValidAccessToken } from '@/lib/getValidAccessToken';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    const user = await db.twitchToken.findFirst(); // grab your bot's row

    if (!user) return NextResponse.json({ viewer_count: 0 });

    const accessToken = await getValidAccessToken(user.userId);

    const res = await fetch(`https://api.twitch.tv/helix/streams?user_id=${user.userId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Client-ID': process.env.TWITCH_CLIENT_ID!,
        },
    });

    const data = await res.json();
    const viewerCount = data.data?.[0]?.viewer_count ?? 0;

    return NextResponse.json({ viewer_count: viewerCount });
}