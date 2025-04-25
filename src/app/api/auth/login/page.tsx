'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const loginWithTwitch = () => {
        const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!;
        const redirectUri = process.env.NEXT_PUBLIC_TWITCH_REDIRECT_URI!;
        const scope = 'chat:read chat:edit moderator:read:chatters';

        const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
        window.location.href = authUrl;
    };

    return (
        <div className="p-4">
            <button
                onClick={loginWithTwitch}
                className="bg-purple-600 text-white px-4 py-2 rounded"
            >
                Connect with Twitch
            </button>
        </div>
    );
}