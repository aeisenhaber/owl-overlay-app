'use client'
import dynamic from 'next/dynamic';
import Head from 'next/head';
import "./assets/globals.css";
import {ViewerCountProvider} from "@/app/context/ViewerCount.context";

// ✅ Import OwlOverlay with SSR disabled (Phaser needs the browser)
const OwlOverlay = dynamic(() => import('../app/components/OwlOverlay'), {
  ssr: false
});

export default function Home() {
  return (
      <>
        <Head>
          <title>Owl Overlay</title>
        </Head>
        <main style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
            <ViewerCountProvider>
                <OwlOverlay />
            </ViewerCountProvider>
        </main>
      </>
  );
}