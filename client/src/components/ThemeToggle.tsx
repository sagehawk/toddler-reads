import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { Cloud, Star } from "lucide-react";

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <LazyMotion features={domAnimation}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleTheme();
        }}
        className="relative flex items-center cursor-pointer focus:outline-none"
        aria-label="Toggle Theme"
      >
        <motion.div
          className={`relative w-24 h-12 rounded-full p-1 shadow-inner overflow-hidden transition-colors duration-500 ease-in-out ${
            isDarkMode ? "bg-[#1a237e]" : "bg-[#4fc3f7]"
          }`}
          layout
        >
          {/* Background Elements - Stars (Night) */}
          <AnimatePresence>
            {isDarkMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(6)].map((_, i) => (
                  <Star
                    key={i}
                    className="absolute text-white w-2 h-2 fill-white"
                    style={{
                      top: `${Math.random() * 80 + 10}%`,
                      left: `${Math.random() * 50 + 10}%`,
                      opacity: Math.random() * 0.5 + 0.5,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background Elements - Clouds (Day) */}
          <AnimatePresence>
            {!isDarkMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 pointer-events-none"
              >
                <Cloud className="absolute top-2 right-8 text-white/80 w-4 h-4 fill-white/80" />
                <Cloud className="absolute bottom-1 right-3 text-white/60 w-3 h-3 fill-white/60" />
                <Cloud className="absolute top-1 right-2 text-white/90 w-2 h-2 fill-white/90" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sliding Handle (Sun/Moon) */}
          <motion.div
            className={`relative w-10 h-10 rounded-full shadow-md flex items-center justify-center z-10 ${
              isDarkMode ? "bg-slate-200" : "bg-yellow-400"
            }`}
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              marginLeft: isDarkMode ? "auto" : "0",
              marginRight: isDarkMode ? "0" : "auto",
            }}
          >
            <AnimatePresence mode="wait">
              {isDarkMode ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full"
                >
                  {/* Craters for Moon */}
                  <div className="absolute top-2 left-3 w-2 h-2 bg-slate-300 rounded-full opacity-60" />
                  <div className="absolute bottom-3 right-2 w-1.5 h-1.5 bg-slate-300 rounded-full opacity-50" />
                  <div className="absolute top-5 left-2 w-1 h-1 bg-slate-300 rounded-full opacity-70" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full"
                >
                  {/* Simple Sun glow/shine effect could go here, 
                      but the yellow circle is often enough. 
                      Let's add a subtle inner ring. */}
                  <div className="absolute inset-1 border-2 border-yellow-200/50 rounded-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </button>
    </LazyMotion>
  );
};
