import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
    transports: ['websocket'],         // ✅ prefer websocket
    withCredentials: true              // ✅ match CORS credentials
});

export function useTwitchChat() {
    const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);

    useEffect(() => {
        socket.on('chat', (msg) => {
            setMessages((prev) => [...prev.slice(-30), msg]); // keep last 30
        });

        return () => {
            socket.off('chat');
        };
    }, []);

    return messages;
}