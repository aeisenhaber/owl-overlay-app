import { NextResponse } from 'next/server';
import {db} from "@/lib/db";
import {getValidAccessToken} from "@/lib/getValidAccessToken";

export async function GET() {
    const user = await db.twitchToken.findFirst(); // grab your bot's row

    if (!user) return NextResponse.json({ viewer_count: 0 });

    const accessToken = await getValidAccessToken(user.userId);
    const res = await fetch(`https://api.twitch.tv/helix/chat/chatters?broadcaster_id=${user.userId}&moderator_id=${user.userId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Client-ID': process.env.TWITCH_CLIENT_ID!,
        },
    });

    const data = await res.json();
    const chatters = data.data;

    return NextResponse.json({ chatters });
}