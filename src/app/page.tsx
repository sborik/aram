"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import SocialIcons from "@/components/SocialIcons";
import MusicPlayer from "@/components/MusicPlayer";
import { Sparkles, Image as ImageIcon } from "lucide-react";

// Dynamic import to prevent SSR issues with Three.js
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

// Detect if device is low-end or mobile
function detectBasicMode(): boolean {
    if (typeof window === 'undefined') return false;

    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Check for low memory (if available)
    const lowMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined
        && (navigator as Navigator & { deviceMemory?: number }).deviceMemory! < 4;

    // Check for low core count
    const lowCores = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency < 4;

    // Check screen size
    const smallScreen = window.innerWidth < 768;

    // Check for WebGL2 support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    const noWebGL2 = !gl;

    return isMobile || lowMemory || lowCores || smallScreen || noWebGL2;
}

export default function Home() {
    const [mode, setMode] = useState<'auto' | '3d' | 'basic'>('auto');
    const [isBasicMode, setIsBasicMode] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [showModeToggle, setShowModeToggle] = useState(false);

    useEffect(() => {
        // Auto-detect on mount
        const shouldUseBasic = detectBasicMode();
        setIsBasicMode(mode === 'auto' ? shouldUseBasic : mode === 'basic');
        setShowModeToggle(true);
    }, [mode]);

    // Handle 3D load error - fallback to basic
    const handleError = () => {
        setHasError(true);
        setIsBasicMode(true);
    };

    const actualMode = hasError ? true : isBasicMode;

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
            {actualMode && (
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
            )}

            {/* 3D mode - Gaussian Splat viewer */}
            {!actualMode && (
                <GaussianViewer modelUrl="/fire.ply" />
            )}

            {/* Mode toggle button - glassmorphic */}
            {showModeToggle && (
                <button
                    onClick={() => {
                        if (hasError) return;
                        setMode(prev => prev === '3d' ? 'basic' : '3d');
                        setIsBasicMode(prev => !prev);
                    }}
                    className="fixed bottom-4 right-4 z-50 flex items-center gap-1 px-4 py-2 rounded-full transition-all duration-300"
                    style={{
                        background: hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: hasError ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                        color: hasError ? 'rgb(248, 113, 113)' : 'rgba(255, 255, 255, 0.7)',
                        cursor: hasError ? 'not-allowed' : 'pointer'
                    }}
                    disabled={hasError}
                    title={hasError ? '3D mode unavailable' : `Switch to ${actualMode ? '3D' : 'Basic'} mode`}
                >
                    <span className="text-[8px] uppercase tracking-widest">
                        {actualMode ? (hasError ? '3D N/A' : 'Try 3D') : 'Basic'}
                    </span>
                </button>
            )}

            {/* Low-power mode notice removed for cleaner mobile experience */}
        </main>
    );
}
