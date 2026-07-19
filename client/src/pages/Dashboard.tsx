import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { BackgroundAnimator } from "@/components/BackgroundAnimator";
import { getSharedAudioContext } from "../lib/sharedAudioContext";

// ----- Synthesize Bubbly Pop Sound for Card Taps -----
const playBubblePop = () => {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    // Soft, bubbly pitch sweep upwards for a highly satisfying blop/pop effect
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

// ----- Premium Toddler Card Icons -----
const LettersIcon = ({ size = 96 }: { size?: number }) => (
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

const NumbersIcon = ({ size = 96 }: { size?: number }) => (
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

const SparklesIcon = ({ size = 96 }: { size?: number }) => (
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

const SentencesIcon = ({ size = 96 }: { size?: number }) => (
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

const StoriesIcon = ({ size = 96 }: { size?: number }) => (
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

const DoodleIcon = ({ size = 96 }: { size?: number }) => (
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

interface LobbyCardItem {
  id: string;
  title: string;
  subtitle: string;
  Icon: React.FC<{ size?: number }>;
  href: string;
  gradient: string;
  shadowColor: string;
}

const LOBBY_CARDS: LobbyCardItem[] = [
  {
    id: "phonics",
    title: "Letters",
    subtitle: "ABC Phonics",
    Icon: LettersIcon,
    href: "/phonics",
    gradient: "from-emerald-400 to-teal-500",
    shadowColor: "shadow-teal-400/30 dark:shadow-teal-900/40",
  },
  {
    id: "numbers",
    title: "Numbers",
    subtitle: "123 Counting",
    Icon: NumbersIcon,
    href: "/numbers",
    gradient: "from-amber-400 to-orange-500",
    shadowColor: "shadow-orange-400/30 dark:shadow-orange-950/40",
  },
  {
    id: "vocab",
    title: "Words",
    subtitle: "Vocabulary",
    Icon: SparklesIcon,
    href: "/vocab",
    gradient: "from-indigo-400 to-violet-500",
    shadowColor: "shadow-violet-400/30 dark:shadow-violet-950/40",
  },
  {
    id: "sentences",
    title: "Sentences",
    subtitle: "First Sentences",
    Icon: SentencesIcon,
    href: "/sentences",
    gradient: "from-rose-400 to-pink-500",
    shadowColor: "shadow-pink-400/30 dark:shadow-pink-950/40",
  },
  {
    id: "stories",
    title: "Stories",
    subtitle: "Picture Stories",
    Icon: StoriesIcon,
    href: "/story/all",
    gradient: "from-sky-400 to-blue-500",
    shadowColor: "shadow-blue-400/30 dark:shadow-blue-950/40",
  },
  {
    id: "doodle",
    title: "Doodle",
    subtitle: "Draw & Trace",
    Icon: DoodleIcon,
    href: "/doodle",
    gradient: "from-rose-400 to-pink-500",
    shadowColor: "shadow-pink-400/30 dark:shadow-pink-950/40",
  },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const handleCardClick = (href: string) => {
    playBubblePop();
    
    // Ensure fullscreen request carries forward seamlessly
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}

    // Brief delay to let the bubbly sound trigger before screen switches
    setTimeout(() => {
      setLocation(href);
    }, 150);
  };

  return (
    <div className="relative w-full h-dvh overflow-hidden flex flex-col items-center justify-center select-none font-nunito px-4">
      {/* Visual Atmospheric Background Day/Night */}
      <BackgroundAnimator />

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20 dark:bg-white/5 backdrop-blur-[1px]"
            style={{
              width: 12 + i * 8,
              height: 12 + i * 8,
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.45, 0.15],
            }}
            transition={{
              duration: 6 + i * 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>


      {/* Central Immersive Playshelf Grid */}
      <div className="w-full max-w-4xl flex flex-col items-center justify-center z-10">
        {/* Animated Bobbing Logo */}
        <motion.h1
          className="font-black text-center text-4xl sm:text-6xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-500 dark:from-amber-300 dark:via-emerald-300 dark:to-indigo-300 pb-8 sm:pb-14 font-nunito filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)] select-none"
          initial={{ y: -50, opacity: 0 }}
          animate={{ 
            opacity: 1,
            y: [0, -8, 0] // Soft bobbing sequence
          }}
          transition={{
            y: { repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.2 },
            opacity: { duration: 0.6 }
          }}
        >
          ToddlerReads 🎨✨
        </motion.h1>

        {/* 3D Claymorphic Cards Container */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-5 sm:gap-8 w-full max-w-3xl px-2">
          {LOBBY_CARDS.map((card, idx) => (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.href)}
              className={`relative flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-[2.5rem] text-white focus:outline-none bg-gradient-to-br ${card.gradient} shadow-2xl ${card.shadowColor}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -6, 0] // Independent card floating sequences
              }}
              transition={{
                scale: { type: "spring", stiffness: 300, damping: 20, delay: idx * 0.1 },
                opacity: { duration: 0.4, delay: idx * 0.1 },
                y: { repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: idx * 0.25 }
              }}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.93 }}
              style={{
                // Thick 3D Inner Clay Shadowing
                boxShadow: `inset 0 6px 12px rgba(255,255,255,0.5), inset 0 -6px 12px rgba(0,0,0,0.2), 0 20px 40px rgba(0,0,0,0.15)`
              }}
            >
              {/* Icon Container */}
              <div className="transform-gpu transition-transform hover:scale-105 duration-200 mb-3">
                <card.Icon size={84} />
              </div>

              {/* Game Text Label */}
              <span className="absolute bottom-4 font-black tracking-widest text-sm sm:text-base font-nunito uppercase select-none text-white/90 drop-shadow-sm">
                {card.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
