"use client";

import { useState } from "react";
import {
    Music,
    ShoppingBag,
    Instagram,
    Facebook
} from "lucide-react";

// Brand colors for each platform - reordered to spread white icons apart
const BRAND_COLORS: Record<string, { bg: string; glow: string; icon: string }> = {
    spotify: {
        bg: 'rgba(30, 215, 96, 0.2)',
        glow: 'rgba(30, 215, 96, 0.6)',
        icon: '#1DB954'
    },
    soundcloud: {
        bg: 'rgba(255, 85, 0, 0.2)',
        glow: 'rgba(255, 85, 0, 0.6)',
        icon: '#FF5500'
    },
    music: {
        bg: 'rgba(252, 60, 68, 0.2)',
        glow: 'rgba(252, 60, 68, 0.6)',
        icon: '#FC3C44'
    },
    merch: {
        bg: 'rgba(168, 85, 247, 0.2)',  // Purple for merch
        glow: 'rgba(168, 85, 247, 0.6)',
        icon: '#A855F7'
    },
    tiktok: {
        bg: 'rgba(255, 255, 255, 0.1)',
        glow: 'rgba(255, 255, 255, 0.4)',
        icon: '#ffffff'
    },
    instagram: {
        bg: 'rgba(225, 48, 108, 0.2)',
        glow: 'rgba(225, 48, 108, 0.6)',
        icon: '#E1306C'
    },
    x: {
        bg: 'rgba(255, 255, 255, 0.1)',
        glow: 'rgba(255, 255, 255, 0.4)',
        icon: '#ffffff'
    },
    threads: {
        bg: 'rgba(255, 255, 255, 0.1)',
        glow: 'rgba(255, 255, 255, 0.4)',
        icon: '#ffffff'
    },
    facebook: {
        bg: 'rgba(24, 119, 242, 0.2)',
        glow: 'rgba(24, 119, 242, 0.6)',
        icon: '#1877F2'
    },
};

// Custom SVG icons - explicit small size
const SpotifyIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
        <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
);

const SoundCloudIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
        <path fill="currentColor" d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.102-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c.014.057.045.094.09.094s.089-.037.099-.094l.19-1.308-.21-1.319c-.012-.057-.045-.106-.09-.106m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.104.106.104.061 0 .12-.044.12-.104l.24-2.474-.24-2.547c0-.06-.059-.104-.12-.104m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.138l.24-2.544-.24-2.64c-.015-.075-.074-.135-.149-.135l-.017.001m.96-.165c-.09 0-.149.075-.165.164l-.18 2.79.18 2.595c.016.09.075.164.165.164.089 0 .164-.074.164-.164l.21-2.595-.225-2.79c0-.09-.075-.164-.165-.164m.975-.135c-.104 0-.179.09-.179.194l-.165 2.925.165 2.587c0 .104.075.18.179.18.104 0 .179-.076.194-.18l.18-2.587-.18-2.925c-.015-.104-.09-.194-.194-.194m1.004-.06c-.119 0-.209.09-.224.209l-.15 2.985.15 2.58c.016.104.106.194.224.194.12 0 .209-.09.225-.194l.165-2.58-.165-2.985c-.016-.119-.105-.209-.225-.209m.99-.075c-.135 0-.239.105-.239.24l-.12 3.06.135 2.565c0 .135.09.24.239.24.136 0 .24-.105.24-.24l.149-2.565-.149-3.06c0-.135-.105-.24-.24-.24m1.109.03c-.149 0-.27.12-.27.27l-.12 3.03.12 2.565c0 .149.121.27.27.27.135 0 .255-.12.27-.27l.135-2.565-.135-3.03c-.015-.15-.135-.27-.27-.27m1.02-.03c-.164 0-.284.135-.284.285l-.105 3.075.105 2.565c0 .149.12.285.284.285.149 0 .27-.136.285-.285l.12-2.565-.12-3.075c-.015-.15-.136-.285-.285-.285m1.005-.015c-.164 0-.299.135-.299.3l-.09 3.09.09 2.55c.015.165.135.3.299.3.165 0 .3-.135.3-.3l.105-2.55-.105-3.09c0-.165-.135-.3-.3-.3m1.064.003c-.18 0-.314.135-.329.315l-.075 3.072.075 2.55c.015.18.149.315.329.315.165 0 .314-.135.314-.315l.09-2.55-.09-3.072c0-.18-.149-.315-.314-.315m7.379 1.605c-.451 0-.886.09-1.275.27-.24-2.715-2.505-4.83-5.28-4.83-.584 0-1.155.09-1.695.27-.209.075-.27.15-.285.3v9.555c.015.149.12.27.27.285h8.265c1.59 0 2.88-1.29 2.88-2.895 0-1.59-1.29-2.955-2.88-2.955" />
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
        <path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);

const XIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
        <path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

const ThreadsIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
        <path fill="currentColor" d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.788-.653 1.86-1.044 3.105-1.138 1.024-.078 2.088-.026 3.163.149-.043-.502-.165-.942-.362-1.313-.394-.744-1.106-1.123-2.116-1.128h-.053c-.752.011-1.478.215-2.104.59l-1.018-1.73c.924-.552 2.03-.858 3.186-.878h.082c1.652.014 2.94.588 3.83 1.706.678.85 1.048 1.97 1.109 3.326 1.014.366 1.876.872 2.568 1.516l.012.012c1.088 1.025 1.741 2.372 1.891 3.898.18 1.834-.36 3.593-1.549 5.074-1.742 2.17-4.476 3.323-7.912 3.337z" />
    </svg>
);

// Social links - arranged in a circle
const LINKS = [
    { id: "spotify", name: "Spotify", url: "https://spotify.com", Icon: SpotifyIcon },
    { id: "instagram", name: "Instagram", url: "https://instagram.com", Icon: () => <Instagram className="w-4 h-4" /> },
    { id: "x", name: "X", url: "https://x.com", Icon: XIcon },
    { id: "soundcloud", name: "SoundCloud", url: "https://soundcloud.com", Icon: SoundCloudIcon },
    { id: "tiktok", name: "TikTok", url: "https://tiktok.com", Icon: TikTokIcon },
    { id: "merch", name: "Merch", url: "https://a-ram.printify.me/", Icon: () => <ShoppingBag className="w-4 h-4" /> },
    { id: "facebook", name: "Facebook", url: "https://www.facebook.com/profile.php?id=61585481533517", Icon: () => <Facebook className="w-4 h-4" /> },
    { id: "music", name: "Apple Music", url: "https://music.apple.com", Icon: () => <Music className="w-4 h-4" /> },
];

export default function SocialIcons() {
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            {LINKS.map((link, index) => {
                const angle = (index / LINKS.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 38;
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;
                const Icon = link.Icon;
                const colors = BRAND_COLORS[link.id];
                const isHovered = hoveredIcon === link.id;

                // Show tooltip above for bottom icons to avoid collision with music player
                const tooltipAbove = y > 60;

                return (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute pointer-events-auto cursor-pointer group"
                        style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: "translate(-50%, -50%)",
                        }}
                        onMouseEnter={() => setHoveredIcon(link.id)}
                        onMouseLeave={() => setHoveredIcon(null)}
                    >
                        {/* Glassmorphic container */}
                        <div
                            className={`relative w-12 h-12 p-3.5 rounded-2xl flex items-center justify-center transition-all duration-300 ${isHovered ? "scale-110" : "scale-100"
                                }`}
                            style={{
                                background: isHovered
                                    ? colors.bg
                                    : 'rgba(0, 0, 0, 0.6)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: `1px solid ${isHovered ? colors.icon + '50' : 'rgba(255, 255, 255, 0.08)'}`,
                                boxShadow: isHovered
                                    ? `0 0 30px ${colors.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                                    : '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                color: colors.icon,
                            }}
                        >
                            <Icon />
                        </div>

                        {/* Tooltip - appears above for bottom icons */}
                        <span
                            className={`absolute left-1/2 -translate-x-1/2 px-3 py-1.5 text-[9px] font-medium uppercase tracking-widest rounded-lg whitespace-nowrap transition-all duration-300 ${isHovered
                                ? "opacity-100"
                                : "opacity-0"
                                }`}
                            style={{
                                top: tooltipAbove ? '-36px' : 'auto',
                                bottom: tooltipAbove ? 'auto' : '-36px',
                                transform: `translateX(-50%) ${isHovered ? 'translateY(0)' : (tooltipAbove ? 'translateY(4px)' : 'translateY(-4px)')}`,
                                background: 'rgba(0, 0, 0, 0.8)',
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${colors.icon}30`,
                                boxShadow: `0 0 20px ${colors.glow}`,
                                color: colors.icon,
                            }}
                        >
                            {link.name}
                        </span>
                    </a>
                );
            })}
        </div>
    );
}
