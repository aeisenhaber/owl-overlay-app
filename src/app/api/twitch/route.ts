import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust for your ORM setup

export async function POST(req: NextRequest) {
    const { token, expiresIn } = await req.json();

    // Example: associate with hardcoded user (or pull from session later)
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