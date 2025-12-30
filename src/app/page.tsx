"use client";

import dynamic from "next/dynamic";
import SocialIcons from "@/components/SocialIcons";
import MusicPlayer from "@/components/MusicPlayer";
import { Sparkles, Image as ImageIcon } from "lucide-react";

// Dynamic import preserved so 3D viewer code remains available if re-enabled
const GaussianViewer = dynamic(
    () => import("@/components/GaussianViewer"),
    {
        ssr: false,
        loading: () => <LoadingScreen />
    }
);

function LoadingScreen() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50">
            <div className="w-12 h-12 border-2 border-transparent border-t-orange-500 rounded-full animate-spin" />
            <p className="mt-4 text-white text-sm uppercase tracking-widest opacity-70">
                Loading 3D Scene...
            </p>
        </div>
    );
}

export default function Home() {
    // 3D viewer kept but intentionally disabled to always show the 2D video loop
    const show3D = false;

    return (
        <main className="w-screen h-screen bg-black overflow-hidden relative">
            {/* Music Player */}
            <MusicPlayer src="/music/to-the-arena-instrumental.mp3" title="To The Arena!" />

            {/* A-RAM Logo - centered above the figure */}
            <div className="absolute top-[25%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <img
                    src="/images/a-ram-web-pic.jpeg"
                    alt="A-RAM"
                    className="w-48 h-48 object-contain"
                    style={{
                        filter: 'drop-shadow(0 0 40px rgba(255, 107, 53, 0.7)) drop-shadow(0 0 80px rgba(255, 68, 68, 0.5))',
                    }}
                />
            </div>

            {/* Basic mode - Static image background */}
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                <video
                    src="/web-loop-2d.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="min-w-full min-h-full w-auto h-auto object-cover"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        minWidth: '100%',
                        minHeight: '100%'
                    }}
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                {/* Social Icons */}
                <SocialIcons />
            </div>

            {/* 3D mode - Gaussian Splat viewer (disabled) */}
            {show3D && (
                <GaussianViewer modelUrl="/fire.ply" />
            )}
        </main>
    );
}
