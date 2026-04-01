import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

// ----- Tray Menu Icons (Text/Emoji for Toddlers) -----
const PuzzleIcon = ({ size = 64 }: { size?: number }) => (
    <span style={{ fontSize: `${size}px`, lineHeight: 1 }} className="drop-shadow-md select-none">🧩</span>
);

const LettersIcon = ({ size = 64 }: { size?: number }) => (
    <span style={{ fontSize: `${size * 0.75}px`, fontWeight: 900, WebkitTextStroke: '2px currentColor', lineHeight: 1, fontFamily: "'Nunito', sans-serif", letterSpacing: '-0.05em' }} className="drop-shadow-md select-none">ABC</span>
);

const NumbersIcon = ({ size = 64 }: { size?: number }) => (
    <span style={{ fontSize: `${size * 0.75}px`, fontWeight: 900, WebkitTextStroke: '2px currentColor', lineHeight: 1, fontFamily: "'Nunito', sans-serif", letterSpacing: '-0.05em' }} className="drop-shadow-md select-none">123</span>
);

const BookIcon = ({ size = 64 }: { size?: number }) => (
    <span style={{ fontSize: `${size}px`, lineHeight: 1 }} className="drop-shadow-md select-none">✨</span>
);

// Hamburger icon for the closed tray - thicker
const MenuIcon = ({ size = 32 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.5h18M3 12h18M3 17.5h18" />
    </svg>
);

interface TrayMenuItem {
    id: string;
    label: string;
    Icon: React.FC<{ size?: number }>;
    href: string;
    gradient: string;
}

const TRAY_ITEMS: TrayMenuItem[] = [

    { id: 'phonics', label: 'ABC', Icon: LettersIcon, href: '/phonics', gradient: 'from-teal-400 to-emerald-500' },
    { id: 'numbers', label: '123', Icon: NumbersIcon, href: '/numbers', gradient: 'from-yellow-400 to-amber-500' },
    { id: 'vocab', label: 'Words', Icon: BookIcon, href: '/vocab', gradient: 'from-blue-400 to-indigo-500' },
];

export type TrayPageId = 'phonics' | 'numbers' | 'vocab';

export function TrayMenu({ currentPageId }: { currentPageId: TrayPageId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [, navigate] = useLocation();

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [isOpen]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    };

    const handleSelect = (item: TrayMenuItem, e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.id === currentPageId) return; // Don't navigate to current page
        setIsOpen(false);
        navigate(item.href, { replace: true });
    };

    return (
        <>
            {/* Main tray toggle button */}
            <div className="pointer-events-auto relative z-[60]">
                <motion.button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={handleToggle}
                    className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 shadow-xl backdrop-blur-md transition-all focus:outline-none"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                    {isOpen ? (
                        <svg viewBox="0 0 24 24" fill="none" width={40} height={40} stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <MenuIcon size={40} />
                    )}
                </motion.button>
            </div>

            {/* Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg pointer-events-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onPointerDown={() => setIsOpen(false)}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="flex flex-row flex-wrap items-center justify-center gap-6 sm:gap-10 p-6"
                            onPointerDown={(e) => e.stopPropagation()}
                            initial={{ scale: 0.8, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: 30, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            {TRAY_ITEMS.map((item, i) => {
                                const isCurrent = item.id === currentPageId;
                                return (
                                    <motion.button
                                        key={item.id}
                                        onClick={(e) => handleSelect(item, e)}
                                        className={`relative flex flex-col items-center justify-center w-36 h-36 sm:w-48 sm:h-48 rounded-[2rem] shadow-2xl focus:outline-none transition-shadow ${isCurrent
                                            ? 'bg-gray-300/90 dark:bg-gray-800/90 text-gray-500 dark:text-gray-500 cursor-default shadow-none'
                                            : `bg-gradient-to-br ${item.gradient} text-white cursor-pointer hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]`
                                            }`}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: isCurrent ? 0.7 : 1, scale: 1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 20,
                                            delay: i * 0.05 + 0.1,
                                        }}
                                        whileHover={isCurrent ? {} : { scale: 1.05, y: -5 }}
                                        whileTap={isCurrent ? {} : { scale: 0.95 }}
                                    >
                                        <item.Icon size={100} />
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
}
