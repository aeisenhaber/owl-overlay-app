'use client';

import { createContext, useContext, useEffect, useState } from 'react';


const ViewerCountContext = createContext<number | null>(null);

export const useViewerCount = () => useContext(ViewerCountContext);

export const ViewerCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        const fetchViewers = async () => {
            try {
                const res = await fetch('/api/viewers');
                const data = await res.json();
                setCount(data.viewer_count);
            } catch (err) {
                console.error('Failed to fetch viewer count', err);
            }
        };
        fetchViewers();
        const interval = setInterval(fetchViewers, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ViewerCountContext.Provider value={count}>
            {children}
        </ViewerCountContext.Provider>
    );
};
