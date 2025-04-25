'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ChatterColorMap = Record<string, string>;

interface ChatterColorContextType {
    colors: ChatterColorMap;
    getColor: (userId: number) => Promise<string>;
}

const ChatterColorContext = createContext<ChatterColorContextType | null>(null);

export const useChatterColor = () => {
    const context = useContext(ChatterColorContext);
    if (!context) {
        throw new Error('useChatterColor must be used within a ChatterColorProvider');
    }
    return context;
};

async function fetchChatterColor(userId: number): Promise<string> {
    const res = await fetch(`/api/chatters/color?userId=${userId}`);
    const data = await res.json();
    return data.color ?? '#FFFFFF'; // fallback to white
}

export function ChatterColorProvider({ children }: { children: ReactNode }) {
    const [colors, setColors] = useState<ChatterColorMap>({});

    const getColor = async (userId: number) => {
        if (colors[userId]) {
            return colors[userId]; // ✅ already cached
        }

        const color = await fetchChatterColor(userId);
        setColors(prev => ({ ...prev, [userId]: color }));
        return color;
    };

    return (
        <ChatterColorContext.Provider value={{ colors, getColor }}>
            {children}
        </ChatterColorContext.Provider>
    );
}