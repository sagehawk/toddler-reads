import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LandscapeEnforcer
 * 
 * Shows a "rotate your device" overlay when the device is in portrait mode on mobile.
 * Also attempts to lock orientation via Screen Orientation API on supported browsers.
 */
export function LandscapeEnforcer({ children }: { children: React.ReactNode }) {
    const [isPortrait, setIsPortrait] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect if mobile based on screen size and touch
        const checkMobile = () => {
            const mobile = window.matchMedia('(max-width: 1024px) and (hover: none), (max-height: 600px) and (hover: none)').matches
                || ('ontouchstart' in window && window.innerWidth < 1024);
            setIsMobile(mobile);
        };

        const checkOrientation = () => {
            // Use both matchMedia and window dimensions
            const portrait = window.matchMedia('(orientation: portrait)').matches
                || (window.innerHeight > window.innerWidth);
            setIsPortrait(portrait);
        };

        checkMobile();
        checkOrientation();

        // Try to lock orientation to landscape via Screen Orientation API
        const tryLockOrientation = async () => {
            try {
                const screen = window.screen as any;
                if (screen?.orientation?.lock) {
                    await screen.orientation.lock('landscape');
                }
            } catch {
                // Silently fail — not supported on iOS or non-fullscreen contexts
            }
        };

        tryLockOrientation();

        // Listen for resize/orientation changes
        const handleChange = () => {
            checkMobile();
            checkOrientation();
        };

        window.addEventListener('resize', handleChange);
        window.addEventListener('orientationchange', handleChange);

        // Also listen to matchMedia changes
        const mql = window.matchMedia('(orientation: portrait)');
        mql.addEventListener?.('change', handleChange);

        return () => {
            window.removeEventListener('resize', handleChange);
            window.removeEventListener('orientationchange', handleChange);
            mql.removeEventListener?.('change', handleChange);
        };
    }, []);

    const showOverlay = isMobile && isPortrait;

    return (
        <>
            {children}
            <AnimatePresence>
                {showOverlay && (
                    <motion.div
                        key="landscape-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)',
                        }}
                    >
                        {/* Floating particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full"
                                    style={{
                                        width: 6 + (i % 3) * 4,
                                        height: 6 + (i % 3) * 4,
                                        left: `${10 + i * 11}%`,
                                        top: `${15 + (i % 4) * 20}%`,
                                        background: `rgba(255, 255, 255, ${0.08 + (i % 3) * 0.04})`,
                                    }}
                                    animate={{
                                        y: [0, -15, 0],
                                        x: [0, 8, 0],
                                        opacity: [0.15, 0.35, 0.15],
                                    }}
                                    transition={{
                                        duration: 3 + i * 0.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: i * 0.4,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Rotating phone icon */}
                        <motion.div
                            className="relative mb-8"
                            animate={{ rotate: [0, -90, -90, 0] }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                times: [0, 0.4, 0.7, 1],
                            }}
                        >
                            {/* Phone body */}
                            <div
                                className="relative flex items-center justify-center"
                                style={{
                                    width: 72,
                                    height: 120,
                                    borderRadius: 16,
                                    border: '3px solid rgba(255, 255, 255, 0.8)',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    backdropFilter: 'blur(8px)',
                                }}
                            >
                                {/* Screen area */}
                                <div
                                    className="absolute"
                                    style={{
                                        top: 14,
                                        left: 6,
                                        right: 6,
                                        bottom: 14,
                                        borderRadius: 6,
                                        background: 'rgba(255, 255, 255, 0.06)',
                                    }}
                                />
                                {/* Home indicator */}
                                <div
                                    className="absolute"
                                    style={{
                                        bottom: 5,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 28,
                                        height: 3,
                                        borderRadius: 2,
                                        background: 'rgba(255, 255, 255, 0.4)',
                                    }}
                                />
                            </div>

                            {/* Rotation arrow */}
                            <motion.div
                                className="absolute -right-6 top-1/2 -translate-y-1/2"
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.7)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    <polyline points="22 2 22 8 16 8" />
                                </svg>
                            </motion.div>
                        </motion.div>

                        {/* Text */}
                        <motion.h2
                            className="text-white text-2xl font-bold mb-2 text-center px-8"
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Rotate Your Device
                        </motion.h2>

                        <motion.p
                            className="text-indigo-200 text-base text-center px-10 max-w-xs leading-relaxed"
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.35 }}
                        >
                            This app works best in landscape mode. Please turn your phone sideways!
                        </motion.p>

                        {/* Subtle bottom hint */}
                        <motion.div
                            className="absolute bottom-8 flex items-center gap-2 text-indigo-300/60 text-sm"
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <span>📱</span>
                            <span>ToddlerReads</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
