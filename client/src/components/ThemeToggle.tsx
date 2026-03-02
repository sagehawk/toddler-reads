import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";

// Fixed star positions so they never shift around
const STARS = [
  { top: '18%', left: '12%', size: 2.5, opacity: 0.9, delay: 0 },
  { top: '55%', left: '8%', size: 2, opacity: 0.6, delay: 0.1 },
  { top: '30%', left: '35%', size: 1.5, opacity: 0.8, delay: 0.15 },
  { top: '70%', left: '28%', size: 2, opacity: 0.7, delay: 0.05 },
  { top: '15%', left: '48%', size: 1.5, opacity: 0.5, delay: 0.2 },
];

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleTheme();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="relative flex items-center cursor-pointer focus:outline-none group"
      aria-label="Toggle Theme"
    >
      <motion.div
        className="relative w-[60px] h-[30px] rounded-full p-[3px] overflow-hidden"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
            : 'linear-gradient(135deg, #38bdf8 0%, #7dd3fc 50%, #bae6fd 100%)',
          boxShadow: isDarkMode
            ? 'inset 0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)'
            : 'inset 0 1px 3px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
        }}
        animate={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
            : 'linear-gradient(135deg, #38bdf8 0%, #7dd3fc 50%, #bae6fd 100%)',
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Stars (night mode) — fixed positions */}
        <AnimatePresence>
          {isDarkMode && STARS.map((star, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: star.opacity,
                scale: [1, 1.3, 1],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                opacity: { duration: 0.3, delay: star.delay },
                scale: {
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: star.delay,
                },
              }}
            />
          ))}
        </AnimatePresence>

        {/* Clouds (day mode) */}
        <AnimatePresence>
          {!isDarkMode && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Cloud 1 */}
              <div
                className="absolute"
                style={{ top: '20%', left: '10%' }}
              >
                <div className="relative">
                  <div className="w-3 h-1.5 bg-white/50 rounded-full" />
                  <div className="absolute -top-0.5 left-0.5 w-2 h-1 bg-white/40 rounded-full" />
                </div>
              </div>
              {/* Cloud 2 */}
              <div
                className="absolute"
                style={{ top: '60%', left: '25%' }}
              >
                <div className="relative">
                  <div className="w-2.5 h-1 bg-white/40 rounded-full" />
                  <div className="absolute -top-0.5 left-0.5 w-1.5 h-0.5 bg-white/30 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sliding orb (Sun / Moon) */}
        <motion.div
          className="relative z-10 rounded-full flex items-center justify-center"
          style={{
            width: 24,
            height: 24,
          }}
          animate={{
            x: isDarkMode ? 30 : 0,
            background: isDarkMode
              ? 'linear-gradient(145deg, #e2e8f0, #cbd5e1)'
              : 'linear-gradient(145deg, #fbbf24, #f59e0b)',
            boxShadow: isDarkMode
              ? '0 2px 8px rgba(148,163,184,0.4), inset 0 -1px 2px rgba(0,0,0,0.1)'
              : '0 2px 12px rgba(251,191,36,0.5), 0 0 20px rgba(251,191,36,0.2), inset 0 -1px 2px rgba(0,0,0,0.05)',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 28,
            mass: 0.8,
          }}
        >
          {/* Sun rays (light mode) */}
          <AnimatePresence>
            {!isDarkMode && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.25 }}
              >
                {/* Subtle inner glow ring */}
                <div className="absolute inset-[3px] border border-yellow-200/60 rounded-full" />
                {/* Tiny warm dot at center */}
                <div className="absolute inset-[8px] bg-yellow-200/40 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Moon craters (dark mode) */}
          <AnimatePresence>
            {isDarkMode && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0, rotate: 45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -45 }}
                transition={{ duration: 0.25 }}
              >
                <div className="absolute top-[4px] left-[6px] w-[5px] h-[5px] bg-slate-300/50 rounded-full" />
                <div className="absolute bottom-[5px] right-[4px] w-[4px] h-[4px] bg-slate-300/40 rounded-full" />
                <div className="absolute top-[12px] left-[4px] w-[3px] h-[3px] bg-slate-300/35 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </button>
  );
};
