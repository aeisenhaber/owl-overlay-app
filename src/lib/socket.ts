import { Server } from 'socket.io';
import http from 'http';

const server = http.createServer();
export const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // ✅ allow your Next.js dev origin
        methods: ['GET', 'POST'],
        credentials: true
    }
});

server.listen(3001, () => {
    console.log('Socket.IO server listening on port 3001');
});