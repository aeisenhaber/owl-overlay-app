import { useChatterColor } from '@/app/context/ChatColorContext';
import {useEffect, useState} from "react";

export function ChatterBubble({ userId }: { userId: string }) {
    const { getColor } = useChatterColor();
    const [color, setColor] = useState('#FFFFFF');

    useEffect(() => {
        getColor(userId).then(setColor);
    }, [userId, getColor]);

    return (
        <div style={{ color }}>
            🦉 {userId}
        </div>
    );
}