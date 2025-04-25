import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    const { token, expiresIn } = await req.json();

    // @ts-ignore
    await db.twitchToken.create({
        data: {
            userId: 'bot-owner',
            token,
            expiresIn,
        }
    });

    return NextResponse.json({ success: true });
}