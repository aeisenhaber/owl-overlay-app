'use client';
import { useViewerCount } from '@/app/context/ViewerCount.context'


const ViewerCount = () => {
    const count = useViewerCount();

    return (
        <div style={{ position: 'absolute', top: 16, left: 16, fontSize: 18, fontWeight: 'bold', zIndex: 10 }} className={'text-black'}>
            👀 Viewers: {count ?? '...'}
        </div>
    );
};

export default ViewerCount;
