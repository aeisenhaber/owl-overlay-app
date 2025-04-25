// @ts-expect-error tmi.js doesnt support TS
import tmi from 'tmi.js';
import { db } from './db';
import { io } from './socket';
import { getValidAccessToken } from "./getValidAccessToken";

let client: tmi.Client | null = null;

export async function startTmiClient() {
    if (client) return; // prevent multiple connects
    const user = await db.twitchToken.findFirst();

    if (!user) {
        console.warn('No user found in database.');
        return;
    }

    const accessToken = await getValidAccessToken(user.userId);
    const username = user.username;

    if (!accessToken) {
        console.warn('No Twitch token found in database.');
        return;
    }


    client = new tmi.Client({
        options: { debug: true },
        identity: {
            username,
            password: `oauth:${accessToken}`, // make sure it's prefixed with oauth:
        },
        channels: [process.env.TWITCH_CHANNEL!],
    });

    await client.connect();

    client.on('message', (channel: any, tags: { [x: string]: any; }, message: any, self: any) => {
        if (self) return;

        const payload = {
            user: tags['display-name'] || 'Unknown',
            message,
        };

        io.emit('chat', payload);
        console.log(`[${payload.user}]: ${message}`);
    });
}
