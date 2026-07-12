import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { getSharedAudioContext } from '../lib/sharedAudioContext';

// ----- Web Audio API Playful Menu Chimes -----
const playOpenChime = () => {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    // Ascending C major pentatonic sweep for a magical "tada!" entrance feel
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
    });
  } catch (e) {
    console.error(e);
  }
};

const playCloseChime = () => {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    // Smooth descending sweep for exit
    const notes = [659.25, 523.25, 392.00, 329.63, 261.63];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.22);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.22);
    });
  } catch (e) {
    console.error(e);
  }
};

// ----- Tray Menu Icons (Super Premium Toddler-Friendly Emojis) -----
const LettersIcon = ({ size = 64 }: { size?: number }) => (
  <div className="relative flex items-center justify-center select-none transform-gpu">
    <span style={{ fontSize: `${size}px`, lineHeight: 1 }} className="filter saturate-150 drop-shadow-md">
      🍎
    </span>
    <span 
      style={{ fontSize: `${size * 0.35}px` }} 
      className="absolute text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] font-nunito uppercase select-none bottom-[10%]"
    >
      A
    </span>
  </div>
);

const NumbersIcon = ({ size = 64 }: { size?: number }) => (
  <div className="relative flex items-center justify-center select-none transform-gpu">
    <span style={{ fontSize: `${size}px`, lineHeight: 1 }} className="filter saturate-150 drop-shadow-md">
      🎈
    </span>
    <span 
      style={{ fontSize: `${size * 0.35}px` }} 
      className="absolute text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] font-nunito select-none top-[25%]"
    >
      123
    </span>
  </div>
);

const BookIcon = ({ size = 64 }: { size?: number }) => (
  <div className="relative flex items-center justify-center select-none transform-gpu">
    <span style={{ fontSize: `${size}px`, lineHeight: 1 }} className="filter saturate-150 drop-shadow-md">
      📖
    </span>
    <span
      style={{ fontSize: `${size * 0.45}px` }}
      className="absolute -top-[15%] -right-[15%] filter drop-shadow-md select-none animate-bounce"
    >
      ✨
    </span>
  </div>
);

const SentencesIcon = ({ size = 64 }: { size?: number }) => (
  <div className="relative flex items-center justify-center select-none transform-gpu">
    <span style={{ fontSize: `${size}px`, lineHeight: 1 }} className="filter saturate-150 drop-shadow-md">
      💬
    </span>
    <span
      style={{ fontSize: `${size * 0.28}px` }}
      className="absolute text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] font-nunito select-none top-[28%]"
    >
      abc
    </span>
  </div>
);

const StoriesIcon = ({ size = 64 }: { size?: number }) => (
  <div className="relative flex items-center justify-center select-none transform-gpu">
    <span style={{ fontSize: `${size}px`, lineHeight: 1 }} className="filter saturate-150 drop-shadow-md">
      📚
    </span>
    <span
      style={{ fontSize: `${size * 0.45}px` }}
      className="absolute -top-[15%] -right-[15%] filter drop-shadow-md select-none animate-bounce"
    >
      🌟
    </span>
  </div>
);

const DoodleIcon = ({ size = 64 }: { size?: number }) => (
  <div className="relative flex items-center justify-center select-none transform-gpu">
    <span style={{ fontSize: `${size}px`, lineHeight: 1 }} className="filter saturate-150 drop-shadow-md">
      🎨
    </span>
    <span
      style={{ fontSize: `${size * 0.45}px` }}
      className="absolute -top-[15%] -right-[15%] filter drop-shadow-md select-none"
    >
      ✏️
    </span>
  </div>
);

// ----- Real-time Bubbly Sound Synthesis for Card Taps -----
const playBubblePop = () => {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.error(e);
  }
};

interface TrayMenuItem {
  id: string;
  label: string;
  shortLabel: string;
  Icon: React.FC<{ size?: number }>;
  href: string;
  gradient: string;
  activeColor: string;
}

const TRAY_ITEMS: TrayMenuItem[] = [
  { id: 'phonics', label: 'ABC Phonics', shortLabel: 'Letters', Icon: LettersIcon, href: '/phonics', gradient: 'from-emerald-400 to-teal-500', activeColor: 'shadow-teal-400/50' },
  { id: 'numbers', label: '123 Numbers', shortLabel: 'Numbers', Icon: NumbersIcon, href: '/numbers', gradient: 'from-amber-400 to-orange-500', activeColor: 'shadow-orange-400/50' },
  { id: 'vocab', label: 'Words Vocabulary', shortLabel: 'Words', Icon: BookIcon, href: '/vocab', gradient: 'from-indigo-400 to-violet-500', activeColor: 'shadow-violet-400/50' },
  { id: 'sentences', label: 'Simple Sentences', shortLabel: 'Sentences', Icon: SentencesIcon, href: '/sentences', gradient: 'from-rose-400 to-pink-500', activeColor: 'shadow-pink-400/50' },
  { id: 'stories', label: 'Picture Stories', shortLabel: 'Stories', Icon: StoriesIcon, href: '/story/all', gradient: 'from-sky-400 to-blue-500', activeColor: 'shadow-blue-400/50' },
  { id: 'doodle', label: 'Doodle Drawing', shortLabel: 'Doodle', Icon: DoodleIcon, href: '/doodle', gradient: 'from-rose-400 to-pink-500', activeColor: 'shadow-pink-400/50' },
];

export type TrayPageId = 'phonics' | 'numbers' | 'vocab' | 'sentences' | 'stories' | 'doodle';

export function TrayMenu({ currentPageId }: { currentPageId: TrayPageId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();

  // Prevent scroll locks when menu is open. Save-and-restore rather than
  // resetting to '' — pages like Doodle set their own body overflow guard,
  // and hardcoding '' here would silently strip it after the tray closes.
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const docEl = document.documentElement;
      if (!document.fullscreenElement && docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      }
    } catch {}
    if (!isOpen) {
      playOpenChime();
    } else {
      playCloseChime();
    }
    setIsOpen(prev => !prev);
  };

  const handleSelect = (item: TrayMenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    playBubblePop();
    
    if (item.id === currentPageId) {
      // Small bounce sound or just close menu
      playCloseChime();
      setIsOpen(false);
      return;
    }
    playCloseChime();
    setIsOpen(false);
    
    // Ensure fullscreen request carries forward seamlessly
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}

    setTimeout(() => {
      navigate(item.href, { replace: true });
    }, 150);
  };

  return (
    <>
      {/* Main glassmorphic tray toggle button */}
      <div className="pointer-events-auto relative z-[60]">
        <motion.button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleToggle}
          className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 dark:border-zinc-800/50 backdrop-blur-md transition-all focus:outline-none"
          whileHover={{ scale: 1.08, shadow: "0 12px 40px rgba(0,0,0,0.18)" }}
          whileTap={{ scale: 0.92 }}
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {isOpen ? (
            <svg viewBox="0 0 24 24" fill="none" width={36} height={36} stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <span style={{ fontSize: '36px', lineHeight: 1 }} className="filter saturate-150 drop-shadow-sm select-none">
              🏠
            </span>
          )}
        </motion.button>
      </div>

      {/* magical Game Lobby Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 dark:bg-black/85 backdrop-blur-xl pointer-events-auto select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleToggle}
            transition={{ duration: 0.25 }}
          >
            {/* Playful Floating Title */}
            <motion.h1
              className="font-black text-center text-3xl sm:text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-indigo-300 pb-12 sm:pb-16 font-nunito"
              initial={{ y: -30, opacity: 0 }}
              animate={{ 
                opacity: 1,
                y: [0, -6, 0] // Floating animation
              }}
              transition={{
                y: { repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.3 },
                opacity: { duration: 0.5 }
              }}
            >
              Choose a Game! 🎨✨
            </motion.h1>

            {/* Claymorphic 3D Card Row */}
            <motion.div
              className="flex flex-row flex-wrap items-center justify-center gap-8 sm:gap-12 p-6 max-w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            >
              {TRAY_ITEMS.filter(item => item.id !== currentPageId).map((item, i) => {
                const isActive = item.id === currentPageId;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={(e) => handleSelect(item, e)}
                    className={`relative flex flex-col items-center justify-center w-36 h-36 sm:w-48 sm:h-48 rounded-[2.5rem] text-white cursor-pointer focus:outline-none transition-all duration-300 bg-gradient-to-br ${item.gradient} ${
                      isActive 
                        ? `ring-8 ring-amber-400 ring-offset-4 ring-offset-black/50 shadow-2xl ${item.activeColor} cursor-default` 
                        : "shadow-xl hover:shadow-[0_15px_40px_rgba(255,255,255,0.15)]"
                    }`}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={
                      isActive 
                        ? { 
                            opacity: 1, 
                            scale: [1, 1.03, 1], // Breathing pulse
                            y: [0, -4, 0] // floating balloon sequence
                          }
                        : { opacity: 1, scale: 1 }
                    }
                    transition={{
                      opacity: { delay: i * 0.08 + 0.1 },
                      scale: isActive 
                        ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                        : { type: 'spring', stiffness: 400, damping: 20, delay: i * 0.08 + 0.1 },
                      y: isActive
                        ? { repeat: Infinity, duration: 3, ease: 'easeInOut', delay: i * 0.2 }
                        : {}
                    }}
                    whileHover={isActive ? {} : { scale: 1.08, y: -6 }}
                    whileTap={isActive ? {} : { scale: 0.92 }}
                    style={{
                      // 3D Inner Clay shadow depth
                      boxShadow: isActive
                        ? `inset 0 6px 12px rgba(255,255,255,0.5), inset 0 -6px 12px rgba(0,0,0,0.2), 0 20px 40px rgba(0,0,0,0.4)`
                        : `inset 0 4px 8px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.25)`
                    }}
                  >
                    {/* Pulsing Active Badge */}
                    {isActive && (
                      <span className="absolute -top-3 px-3 py-1 bg-amber-400 text-zinc-950 font-black text-xs sm:text-sm rounded-full shadow-lg animate-bounce tracking-wide select-none z-20">
                        ⭐ Playing
                      </span>
                    )}

                    {/* Icon Container */}
                    <div className="transform-gpu transition-transform hover:scale-105 duration-200">
                      <item.Icon size={105} />
                    </div>

                    {/* Text Label */}
                    <span className="absolute bottom-4 font-black tracking-wide text-sm sm:text-base opacity-90 font-nunito uppercase select-none">
                      {item.shortLabel}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
