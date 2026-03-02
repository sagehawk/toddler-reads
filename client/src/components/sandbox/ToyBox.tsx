import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToyBoxProps {
  onSpawn: () => void;
}

export default function ToyBox({ onSpawn }: ToyBoxProps) {
  const [isBumped, setIsBumped] = useState(false);

  const handleTap = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(15);
    setIsBumped(true);
    onSpawn();
    setTimeout(() => setIsBumped(false), 400);
  }, [onSpawn]);

  return (
    <motion.button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={handleTap}
      className="relative flex items-center justify-center select-none focus:outline-none"
      animate={isBumped ? {
        y: [0, -18, 0],
        scale: [1, 1.12, 1],
      } : {}}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label="Spawn a letter or number"
    >
      {/* Block body */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 border-4 border-amber-600 shadow-lg flex items-center justify-center relative overflow-hidden">
        {/* Inner shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-2xl" />
        {/* Question Mark */}
        <span className="text-4xl sm:text-5xl font-black text-amber-800 drop-shadow-sm select-none" style={{ fontFamily: "'Nunito', sans-serif" }}>
          ?
        </span>
        {/* Rivet dots */}
        <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-amber-700/40" />
        <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-700/40" />
        <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-amber-700/40" />
        <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-700/40" />
      </div>

      {/* Sparkle burst on bump */}
      <AnimatePresence>
        {isBumped && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-300"
                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  x: Math.cos((i * Math.PI * 2) / 6) * 40,
                  y: Math.sin((i * Math.PI * 2) / 6) * 40 - 20,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
