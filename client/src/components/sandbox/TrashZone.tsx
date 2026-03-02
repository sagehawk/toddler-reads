import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrashZoneProps {
    isActive: boolean; // True when an item is being dragged
    isHovering: boolean; // True when dragged item is over the trash zone
}

export default function TrashZone({ isActive, isHovering }: TrashZoneProps) {
    return (
        <motion.div
            className="relative flex items-center justify-center select-none pointer-events-none"
            animate={{
                scale: isHovering ? 1.3 : isActive ? 1.05 : 1,
                opacity: isActive ? 1 : 0.4,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* The hole / vortex */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center relative overflow-hidden transition-colors duration-200 ${isHovering
                    ? 'bg-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                    : 'bg-gray-800/60 dark:bg-gray-700/60'
                }`}>
                {/* Spinning vortex lines */}
                <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute inset-2 rounded-full border-2 border-dashed ${isHovering ? 'border-red-300/60' : 'border-gray-500/30'
                                }`}
                            style={{
                                inset: `${8 + i * 6}px`,
                            }}
                        />
                    ))}
                </motion.div>

                {/* Icon */}
                <motion.div
                    animate={isHovering ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.3, repeat: isHovering ? Infinity : 0 }}
                >
                    <svg className={`w-8 h-8 sm:w-10 sm:h-10 relative z-10 transition-colors duration-200 ${isHovering ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                        }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </motion.div>
            </div>

            {/* "Hungry" label when hovering */}
            <AnimatePresence>
                {isHovering && (
                    <motion.span
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute -bottom-7 text-xs font-bold text-red-500 whitespace-nowrap"
                    >
                        Drop to delete!
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
