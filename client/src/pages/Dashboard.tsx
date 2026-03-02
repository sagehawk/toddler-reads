import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import logoUrl from '../assets/toddler-reads-logo.png';
import whiteLogoUrl from '../assets/toddler-reads-logo-white.png';
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from 'framer-motion';

// SVG icons as components
const PuzzleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 text-white" stroke="currentColor" strokeWidth={2}>
    <path fill="currentColor" fillOpacity="0.25" strokeLinecap="round" strokeLinejoin="round"
      d="M 8 6
         h 2
         a 2 2 0 1 0 4 0
         h 2
         a 2 2 0 0 1 2 2
         v 2
         a 2 2 0 1 0 0 4
         v 2
         a 2 2 0 0 1 -2 2
         h -2
         a 2 2 0 1 1 -4 0
         h -2
         a 2 2 0 0 1 -2 -2
         v -2
         a 2 2 0 1 1 0 -4
         v -2
         a 2 2 0 0 1 2 -2
         Z" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const LettersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 text-white" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="9" height="9" rx="2" fill="currentColor" fillOpacity="0.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 10L7.5 5.5L9.5 10M6.5 8.5h2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="12" y="11" width="9" height="9" rx="2" fill="currentColor" fillOpacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5 18V13.5H16c.8 0 1.5.3 1.5 1s-.7 1-1.5 1h-1.5c.8 0 1.5.3 1.5 1s-.7 1-1.5 1h-1.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NumbersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 text-white" stroke="currentColor" strokeWidth={2}>
    <circle cx="7" cy="7" r="5" fill="currentColor" fillOpacity="0.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6.5L7 5.5v4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="17" cy="17" r="5" fill="currentColor" fillOpacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 16s1-1.5 2-1.5c.8 0 1.5.5 1.5 1.25 0 1.5-3.5 3.25-3.5 3.25h3.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="6" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 text-white" stroke="currentColor" strokeWidth={2}>
    <path fill="currentColor" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    <path d="M12 9v2M12 13v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <path d="M7 8h1M8 12h2M15 8h2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const menuItems = [
  {
    title: "Play",
    subtitle: "Build Words",
    Icon: PuzzleIcon,
    href: "/sandbox",
    gradient: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-300/40 dark:shadow-orange-900/30",
  },
  {
    title: "ABC",
    subtitle: "Letters & Sounds",
    Icon: LettersIcon,
    href: "/phonics",
    gradient: "from-teal-400 to-emerald-500",
    shadow: "shadow-emerald-300/40 dark:shadow-emerald-900/30",
  },
  {
    title: "123",
    subtitle: "Counting",
    Icon: NumbersIcon,
    href: "/numbers",
    gradient: "from-yellow-400 to-amber-500",
    shadow: "shadow-amber-300/40 dark:shadow-amber-900/30",
  },
  {
    title: "Words",
    subtitle: "Vocabulary",
    Icon: BookIcon,
    href: "/vocab",
    gradient: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-300/40 dark:shadow-blue-900/30",
  },
];

const DigitalPlayshelf = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center px-5 sm:px-8 relative overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 8 + i * 4,
              height: 8 + i * 4,
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 4) * 20}%`,
              background: isDarkMode
                ? `hsla(${180 + i * 30}, 50%, 60%, 0.08)`
                : `hsla(${30 + i * 25}, 80%, 70%, 0.25)`,
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, 12, 0],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: 5 + i * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.6,
            }}
          />
        ))}
      </div>

      {/* Theme toggle */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <motion.div
        className="flex-shrink-0 mb-6 sm:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Link href="/story/all">
          <img
            src={isDarkMode ? whiteLogoUrl : logoUrl}
            alt="ToddlerReads Logo"
            className="h-16 sm:h-24 select-none cursor-pointer drop-shadow-sm"
            draggable="false"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </Link>
      </motion.div>

      {/* Menu buttons — compact to fit without scrolling */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-3 sm:gap-4 relative z-10">
        {menuItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 24,
              delay: 0.15 + i * 0.08,
            }}
          >
            <Link
              href={item.href}
              onClick={() => {
                try {
                  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => { });
                  }
                } catch { }
              }}
              className={`group w-full flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5 rounded-2xl text-white font-bold shadow-lg ${item.shadow} transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97] border-b-[3px] border-black/10 bg-gradient-to-r ${item.gradient}`}
            >
              <div className="flex-shrink-0 bg-white/20 rounded-xl p-2 backdrop-blur-sm group-hover:scale-110 transition-transform duration-200">
                <item.Icon />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xl sm:text-2xl tracking-wide leading-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {item.title}
                </span>
                <span className="text-xs sm:text-sm font-medium text-white/70 leading-tight">
                  {item.subtitle}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DigitalPlayshelf;
