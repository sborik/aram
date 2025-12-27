"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import SocialIcons from "./SocialIcons";

interface GaussianViewerProps {
    modelUrl: string;
}

export default function GaussianViewer({ modelUrl }: GaussianViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<unknown>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current || !modelUrl) return;

        let disposed = false;
        let animationFrameId: number;

        const initViewer = async () => {
            try {
                setIsLoading(true);
                setError(null);
                setLoadProgress(0);

                if (containerRef.current) {
                    containerRef.current.innerHTML = "";
                }

                const GaussianSplats3D = await import("@mkkellogg/gaussian-splats-3d");

                if (disposed || !containerRef.current) return;

                const container = containerRef.current;
                const width = container.clientWidth;
                const height = container.clientHeight;

                // Create renderer
                const renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: true,
                });
                renderer.setSize(width, height);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                container.appendChild(renderer.domElement);
                rendererRef.current = renderer;

                // Create camera
                const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 500);
                camera.position.set(0, 0, -3);
                camera.up.set(0, -1, 0);
                camera.lookAt(0, 0, 0);

                // Create controls with AUTO-ROTATE
                const controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
                controls.rotateSpeed = 0.5;
                controls.enableZoom = true;
                controls.zoomSpeed = 0.8;
                controls.minDistance = 1;
                controls.maxDistance = 8;
                controls.enablePan = false;
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.5;
                controls.target.set(0, 0, 0);
                controlsRef.current = controls;

                // Create viewer
                const viewer = new GaussianSplats3D.Viewer({
                    renderer: renderer,
                    camera: camera,
                    selfDrivenMode: false,
                    useBuiltInControls: false,
                    sharedMemoryForWorkers: false,
                    dynamicScene: false,
                    sceneRevealMode: GaussianSplats3D.SceneRevealMode.Gradual,
                    antialiased: true,
                    focalAdjustment: 1.0,
                    integerBasedSort: false,
                });

                viewerRef.current = { viewer, camera, renderer, controls };

                await viewer.addSplatScene(modelUrl, {
                    splatAlphaRemovalThreshold: 5,
                    showLoadingUI: false,
                    progressiveLoad: true,
                    onProgress: (progress: number) => {
                        setLoadProgress(Math.min(100, Math.round(progress)));
                    },
                });

                if (disposed) return;

                setIsLoading(false);

                // User interaction handling - pause auto-rotate during interaction
                let idleTimeout: ReturnType<typeof setTimeout> | null = null;

                const pauseAutoRotate = () => {
                    controls.autoRotate = false;
                    if (idleTimeout) clearTimeout(idleTimeout);
                };

                const resumeAutoRotate = () => {
                    if (idleTimeout) clearTimeout(idleTimeout);
                    // Resume after 2 seconds of inactivity
                    idleTimeout = setTimeout(() => {
                        controls.autoRotate = true;
                    }, 2000);
                };

                // Listen for user interaction
                renderer.domElement.addEventListener('pointerdown', pauseAutoRotate);
                renderer.domElement.addEventListener('pointermove', (e) => {
                    // Only pause if button is pressed (dragging)
                    if (e.buttons > 0) pauseAutoRotate();
                });
                renderer.domElement.addEventListener('pointerup', resumeAutoRotate);
                renderer.domElement.addEventListener('pointerleave', resumeAutoRotate);
                renderer.domElement.addEventListener('wheel', () => {
                    pauseAutoRotate();
                    resumeAutoRotate();
                });

                // Animation loop
                const animate = () => {
                    if (disposed) return;
                    animationFrameId = requestAnimationFrame(animate);

                    controls.update();
                    viewer.update();
                    viewer.render();
                };
                animate();

                // Handle resize
                const handleResize = () => {
                    if (!containerRef.current || disposed) return;
                    const newWidth = containerRef.current.clientWidth;
                    const newHeight = containerRef.current.clientHeight;
                    camera.aspect = newWidth / newHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(newWidth, newHeight);
                };

                window.addEventListener("resize", handleResize);
            } catch (err) {
                console.error("Error initializing viewer:", err);
                if (!disposed) {
                    setError("Failed to load 3D scene.");
                    setIsLoading(false);
                }
            }
        };

        initViewer();

        return () => {
            disposed = true;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (rendererRef.current) rendererRef.current.dispose();
            if (controlsRef.current) controlsRef.current.dispose();
        };
    }, [modelUrl]);

    return (
        <div className="relative w-full h-full">
            {/* 3D Scene Container */}
            <div ref={containerRef} className="absolute inset-0" />

            {/* Loading Screen */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50">
                    <div className="w-12 h-12 border-2 border-transparent border-t-orange-500 rounded-full animate-spin" />
                    <p className="mt-4 text-white text-sm uppercase tracking-widest opacity-70">
                        Loading... {loadProgress}%
                    </p>
                </div>
            )}

            {/* Error Screen */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
                    <p className="text-red-500">{error}</p>
                </div>
            )}

            {/* Social Icons */}
            {!isLoading && !error && <SocialIcons />}
        </div>
    );
}
