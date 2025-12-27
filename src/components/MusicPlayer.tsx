"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface MusicPlayerProps {
    src: string;
    title?: string;
}

export default function MusicPlayer({ src, title = "Now Playing" }: MusicPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.25); // Start at 25%
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);
    const [showVolume, setShowVolume] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleCanPlay = () => {
            setIsLoaded(true);
            setShowPlayer(true);
            setDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            if (!isDragging) {
                const prog = (audio.currentTime / audio.duration) * 100;
                setProgress(isNaN(prog) ? 0 : prog);
            }
        };

        const handleEnded = () => {
            audio.currentTime = 0;
            audio.play();
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [isDragging]);

    useEffect(() => {
        const tryAutoplay = async () => {
            const audio = audioRef.current;
            if (!audio || !isLoaded) return;

            try {
                audio.volume = volume;
                await audio.play();
                setIsPlaying(true);
            } catch {
                console.log('Autoplay blocked');
            }
        };

        if (isLoaded) {
            tryAutoplay();
        }
    }, [isLoaded, volume]);

    // Update audio volume when volume state changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlay = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            try {
                await audio.play();
                setIsPlaying(true);
            } catch (e) {
                console.error('Playback failed:', e);
            }
        }
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = !audio.muted;
        setIsMuted(!isMuted);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        const progressBar = progressRef.current;
        if (!audio || !progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = (clickX / rect.width) * 100;
        const newTime = (percentage / 100) * audio.duration;

        audio.currentTime = newTime;
        setProgress(percentage);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume === 0) {
            setIsMuted(true);
        } else {
            setIsMuted(false);
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentTime = audioRef.current?.currentTime || 0;

    if (!showPlayer) return <audio ref={audioRef} src={src} preload="auto" loop />;

    return (
        <>
            <audio ref={audioRef} src={src} preload="auto" loop />

            {/* Floating glassmorphic music controller */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10"
                    style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                >
                    {/* Play/Pause button */}
                    <button
                        onClick={togglePlay}
                        className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.8), rgba(255, 68, 68, 0.8))',
                            boxShadow: '0 0 20px rgba(255, 107, 53, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        {isPlaying ? (
                            <Pause className="w-3 h-3 text-white" fill="white" />
                        ) : (
                            <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
                        )}
                    </button>

                    {/* Time */}
                    <span className="text-white/50 text-[9px] w-8 text-right tabular-nums">
                        {formatTime(currentTime)}
                    </span>

                    {/* Progress bar - clickable to seek */}
                    <div
                        ref={progressRef}
                        className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${progress}%`,
                                background: 'linear-gradient(90deg, #ff6b35, #ff4444)'
                            }}
                        />
                    </div>

                    {/* Duration */}
                    <span className="text-white/50 text-[9px] w-8 tabular-nums">
                        {formatTime(duration)}
                    </span>

                    {/* Title */}
                    <span className="text-white/60 text-[10px] uppercase tracking-wider mx-1">
                        {title}
                    </span>

                    {/* Volume control */}
                    <div
                        className="relative"
                        onMouseEnter={() => setShowVolume(true)}
                        onMouseLeave={() => setShowVolume(false)}
                    >
                        <button
                            onClick={toggleMute}
                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX className="w-3 h-3 text-white/40" />
                            ) : (
                                <Volume2 className="w-3 h-3 text-white/60" />
                            )}
                        </button>

                        {/* Volume slider popup - vertical */}
                        {showVolume && (
                            <div
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-full flex items-center justify-center"
                                style={{
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    height: '80px',
                                    width: '28px'
                                }}
                            >
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="volume-slider"
                                    style={{
                                        width: '60px',
                                        height: '4px',
                                        transform: 'rotate(-90deg)',
                                        transformOrigin: 'center center',
                                        appearance: 'none',
                                        background: `linear-gradient(to right, #ff6b35 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
                                        borderRadius: '2px',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #ff6b35;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #ff6b35;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
                }
            `}</style>
        </>
    );
}
