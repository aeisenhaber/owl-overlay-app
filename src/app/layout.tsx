import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./assets/globals.css";
import {ChatterColorProvider} from "@/app/context/ChatColorContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Owl Layout",
  description: "Owls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-transparent margin-0 overflow-hidden`}
      >
      <ChatterColorProvider>
        {children}
      </ChatterColorProvider>
      </body>
    </html>
  );
}
