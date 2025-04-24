// @ts-expect-error tmi.js doesnt support TS
import tmi from 'tmi.js';
import { Server } from 'socket.io';
import http from 'http';

const server = http.createServer();
const io = new Server(server, {
    cors: { origin: '*' }
});

const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: process.env.TWITCH_BOT_USERNAME!,
        password: process.env.TWITCH_OAUTH_TOKEN!
    },
    channels: [process.env.TWITCH_CHANNEL!]
});

client.connect();

client.on('message', (channel: any, tags: { [x: string]: any; }, message: any, self: any) => {
    if (self) return;
    const user = tags['display-name'];
    io.emit('chat', { user, message });
    console.log(`[${user}]: ${message}`);
});

server.listen(3001, () => {
    console.log('Twitch chat WebSocket server running on :3001');
});
