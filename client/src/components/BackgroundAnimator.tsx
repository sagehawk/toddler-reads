import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Star, Moon, Sun } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export const BackgroundAnimator = () => {
  const { isDarkMode } = useTheme();
  
  // Generate static positions for stars to avoid hydration mismatches or random jumping
  // using useMemo to keep them constant across re-renders unless explicitly changed
  const stars = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 60}%`, // Keep stars mostly in the upper 60%
      left: `${Math.random() * 100}%`,
      size: Math.random() * 1.5 + 0.5, // range 0.5 - 2.0rem equivalent
      duration: Math.random() * 3 + 2, // 2-5s twinkle duration
      delay: Math.random() * 2,
    }));
  }, []);

  const clouds = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 40 + 5}%`, // Upper half
      scale: Math.random() * 0.5 + 0.8,
      duration: Math.random() * 20 + 40, // Very slow movement (40-60s)
      delay: Math.random() * -20, // Start at different positions
      initialX: Math.random() * 100, // Start somewhere on screen
    }));
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
      {/* Dynamic Gradient Background */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={{
          background: isDarkMode
            ? "linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)" // Dark Slate / Night
            : "linear-gradient(to bottom, #bae6fd 0%, #f0f9ff 100%)", // Sky Blue / Day
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Day Elements: Clouds */}
      <AnimatePresence>
        {!isDarkMode && (
          <motion.div
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {clouds.map((cloud) => (
              <motion.div
                key={cloud.id}
                className="absolute text-white/40"
                style={{
                  top: cloud.top,
                  left: -150, // Start off-screen left
                }}
                animate={{
                  x: ["0vw", "120vw"],
                }}
                transition={{
                  duration: cloud.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: cloud.delay, // Use negative delay to pre-warm animation if supported or start mid-way? 
                  // Framer motion simple x tween might not support negative delay for positioning seamlessly on mount without calculating x manually.
                  // Let's rely on long duration.
                }}
                // Workaround for "starting in middle":
                // We'll actually animate x from -200 to window width + 200.
                // To make them appear scattered initially, we can't easily do that with simple keyframes without complex logic.
                // For now, let's just let them drift. They will enter from left.
                // To make it look "alive" immediately, we can render them at random % left and animate to right, then reset.
              >
                 <Cloud 
                    fill="currentColor" 
                    stroke="none" 
                    style={{ transform: `scale(${cloud.scale})` }} 
                    className="w-24 h-24 md:w-32 md:h-32 opacity-80"
                 />
              </motion.div>
            ))}
            
            {/* Sun Glow (Top Right) */}
            <motion.div
               className="absolute top-[-10%] right-[-10%] w-[50vmin] h-[50vmin] rounded-full bg-yellow-300/20 blur-[100px]"
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Night Elements: Stars */}
      <AnimatePresence>
        {isDarkMode && (
          <motion.div
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {stars.map((star) => (
              <motion.div
                key={star.id}
                className="absolute text-yellow-100"
                style={{
                  top: star.top,
                  left: star.left,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: star.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: star.delay,
                }}
              >
                <Star 
                    fill="currentColor" 
                    stroke="none" 
                    style={{ width: `${star.size}rem`, height: `${star.size}rem` }}
                />
              </motion.div>
            ))}

            {/* Moon Glow (Top Right) */}
             <motion.div
               className="absolute top-[-10%] right-[-10%] w-[40vmin] h-[40vmin] rounded-full bg-blue-100/10 blur-[80px]"
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
