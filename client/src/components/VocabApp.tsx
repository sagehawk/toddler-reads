import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Volume2, VolumeX } from "lucide-react";
import { getLetterColors } from "../lib/colorUtils";
import { vocabData, VocabItem } from "../data/vocabData";
import useLocalStorage from "@/hooks/useLocalStorage";
import { AnimalsVocab } from "./AnimalsVocab";
import confetti from "canvas-confetti";
import { useSwipe } from "@/hooks/useSwipe";
import { motion, AnimatePresence } from 'framer-motion';
import { TrayMenu } from '@/components/TrayMenu';
import { ThemeToggle } from '@/components/ThemeToggle';

const categoryOrder = ["Animals", "Things", "Nature", "Vehicles", "People"];

const sortedVocabData = [...vocabData].sort((a, b) => {
  const categoryA = categoryOrder.indexOf(a.category);
  const categoryB = categoryOrder.indexOf(b.category);
  if (categoryA !== categoryB) {
    return categoryA - categoryB;
  }
  return a.name.localeCompare(b.name);
});

// Helper to detect Android
const isAndroid = /Android/i.test(navigator.userAgent);

// Extracted component to handle animation isolation
const DecodableWord = ({
  text,
  ttsText,
  voice,
  hasInteracted,
  replayTrigger,
  onComplete,
  isAnimatingRef,
}: {
  text: string;
  ttsText: string;
  voice: SpeechSynthesisVoice | null;
  hasInteracted: boolean;
  replayTrigger: number;
  onComplete: () => void;
  isAnimatingRef: React.MutableRefObject<boolean>;
}) => {
  const [highlightedCount, setHighlightedCount] = useState(0);
  const { speak, stop } = useSpeechSynthesis();
  const wordRef = useRef<HTMLHeadingElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Adjust font size dynamically to fit container width up to 95%
  const adjustFontSize = useCallback(() => {
    if (wordRef.current) {
      const container = wordRef.current.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        wordRef.current.style.fontSize = "100px";
        const wordWidth = wordRef.current.scrollWidth;
        const targetWidth = containerWidth * 0.95;
        let newFontSize = (targetWidth / wordWidth) * 100;
        
        // Boundaries for font size to ensure legibility and control on large viewports
        const maxFontSize = 10 * 16; // 160px
        const minFontSize = 4.5 * 16; // 72px
        newFontSize = Math.max(minFontSize, Math.min(newFontSize, maxFontSize));
        wordRef.current.style.fontSize = `${newFontSize}px`;
      }
    }
  }, [text]);

  useLayoutEffect(() => {
    adjustFontSize();
  }, [adjustFontSize]);

  useEffect(() => {
    window.addEventListener("resize", adjustFontSize);
    return () => {
      window.removeEventListener("resize", adjustFontSize);
    };
  }, [adjustFontSize]);

  // Soft synth ascending chime sounds as letters light up
  const playLetterSound = (index: number) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      const baseFreq = 261.63; // C4 (Middle C)
      const freqStep = 35; // Gentle step up for each letter
      osc.frequency.setValueAtTime(baseFreq + index * freqStep, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.error("Synth play failed:", e);
    }
  };

  useEffect(() => {
    if (!hasInteracted) {
      setHighlightedCount(0);
      isAnimatingRef.current = false;
      return;
    }

    let isCancelled = false;
    let animationInterval: NodeJS.Timeout;

    const runSequence = async () => {
      isAnimatingRef.current = true;
      const totalLetters = text.length;

      // Start highlighting the first letter immediately
      setHighlightedCount(1);
      playLetterSound(0);

      if (totalLetters > 1) {
        await new Promise<void>((resolve) => {
          let current = 1;
          const letterDelay = 320; // Perfect toddler-friendly speed

          animationInterval = setInterval(() => {
            if (isCancelled) {
              resolve();
              return;
            }
            current++;
            setHighlightedCount(current);
            playLetterSound(current - 1);

            if (current >= totalLetters) {
              clearInterval(animationInterval);
              resolve();
            }
          }, letterDelay);
        });
      }

      if (isCancelled) return;

      setHighlightedCount(totalLetters);

      // Short beat after spelling before TTS speaks the word
      await new Promise((r) => setTimeout(r, 250));
      if (isCancelled) return;

      // Speak word with slightly slower rate for toddler decoding clarity
      await speak(ttsText, { voice: voice, rate: 0.95 });

      if (!isCancelled) {
        isAnimatingRef.current = false;
        onCompleteRef.current(); // Reveal illustration last
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
      stop();
      if (animationInterval) clearInterval(animationInterval);
      isAnimatingRef.current = false;
    };
  }, [text, ttsText, voice, speak, stop, hasInteracted, replayTrigger, isAnimatingRef]);

  return (
    <h2
      ref={wordRef}
      className="font-black text-center tracking-wide break-words select-none leading-none"
    >
      {text.split("").map((char, index) => {
        const isHighlighted = index < highlightedCount;
        const colorClass = isHighlighted
          ? getLetterColors(char).text
          : "text-gray-300 dark:text-gray-700"; // Always visible, neutral color in high-contrast mode

        return (
          <span
            key={index}
            className={`transition-colors duration-200 ${colorClass}`}
          >
            {char}
          </span>
        );
      })}
    </h2>
  );
};

import { usePreventBackExit } from "@/hooks/usePreventBackExit";

const VocabApp = () => {
  usePreventBackExit();
  const [match, params] = useRoute("/vocab/:category?");
  const [, setLocation] = useLocation();
  const category = params?.category;

  const filteredVocab =
    category && category !== "all"
      ? sortedVocabData.filter(
        (item) =>
          item.category.toLowerCase().replace(/[\s/]+/g, "-") === category,
      )
      : sortedVocabData;

  // New Animals Flow Integration
  if (category === "animals") {
    return (
      <AnimalsVocab
        items={filteredVocab}
        onExit={() => {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { });
          }
          setLocation("/app", { replace: true });
        }}
      />
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [replayTrigger, setReplayTrigger] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { speak, stop, voices } = useSpeechSynthesis();
  const femaleVoice =
    voices?.find((v) => v.lang.startsWith("en") && v.name.includes("Female")) ||
    voices?.find((v) => v.lang.startsWith("en"));
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to track animation status across the extracted component
  const isAnimatingRef = useRef(false);

  // Ref to track image loading
  const imageLoadedRef = useRef(false);

  const currentItem = filteredVocab[currentIndex];

  const shuffleItems = useCallback(
    (shouldSetFirst = false) => {
      const indices = filteredVocab.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
      if (shouldSetFirst && indices.length > 0) {
        setCurrentIndex(indices[0]);
        setShuffledIndex(1);
      } else {
        setShuffledIndex(0);
      }
    },
    [filteredVocab],
  );

  useEffect(() => {
    shuffleItems(true);
  }, [category]);

  // Reset listened state and image loaded ref when index changes
  useEffect(() => {
    setHasListened(false);
    setIsImageVisible(false);
    setHasInteracted(false);
    imageLoadedRef.current = false;
  }, [currentIndex]);

  // Handle image fade in/out sequence (keeps image visible)
  useEffect(() => {
    if (hasListened) {
      setIsImageVisible(true);
    }
  }, [hasListened]);

  const handleShuffle = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    stop();
    setIsShuffling(true);

    setTimeout(() => {
      let nextIndex = shuffledIndex;
      if (nextIndex >= shuffledIndices.length) {
        shuffleItems(true);
      } else {
        setHasListened(false); // Reset immediately
        setIsImageVisible(false);
        setCurrentIndex(shuffledIndices[nextIndex]);
        setShuffledIndex((prev) => prev + 1);
      }
      setIsShuffling(false);
    }, 150);
  }, [shuffledIndex, shuffledIndices, shuffleItems, stop]);

  const handleInteraction = useCallback(async () => {
    handleShuffle();
  }, [handleShuffle]);

  const handleSequenceComplete = useCallback(() => {
    setHasListened(true);
  }, []);

  const handleNext = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    stop();
    setTimeout(() => {
      setHasListened(false); // Reset immediately
      setIsImageVisible(false);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredVocab.length);
    }, 150);
  }, [filteredVocab.length, stop]);

  const handlePrevious = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    stop();
    setTimeout(() => {
      setHasListened(false); // Reset immediately
      setIsImageVisible(false);
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredVocab.length) % filteredVocab.length,
      );
    }, 150);
  }, [filteredVocab.length, stop]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "a" && e.key <= "z") {
        const newIndex = filteredVocab.findIndex((item) =>
          item.name.toLowerCase().startsWith(e.key),
        );
        if (newIndex !== -1) {
          setHasListened(false); // Reset immediately
          setIsImageVisible(false);
          setCurrentIndex(newIndex);
        }
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handleShuffle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePrevious, handleNext, filteredVocab, handleShuffle]);

  if (!currentItem) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="fixed inset-0 select-none flex flex-col overflow-hidden touchable-area bg-[#FFFDF9] dark:bg-[#000000]"
      onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
      onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
      onTouchEnd={(e) => swipeHandlers.onTouchEnd()}
      onClick={handleInteraction}
    >
      <header className="absolute top-0 left-0 w-full p-4 z-50 flex items-center justify-between pointer-events-none">
        <TrayMenu currentPageId="vocab" />



        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center w-full overflow-hidden relative">
        <main className="flex flex-col items-center justify-center text-center px-4 w-full h-full">
          <div className="w-full flex justify-center items-center">
            <div
              className="relative flex flex-col items-center justify-center gap-6 sm:gap-10 w-[95%] max-w-[800px] pointer-events-auto"
              style={{ minHeight: "clamp(300px, 75vh, 600px)" }}
            >
              {/* Text Layer (Top Portion) */}
              <div className="relative z-10 w-full flex items-center justify-center">
                {!isShuffling && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      stop();
                      if (!hasInteracted) {
                        setHasInteracted(true);
                      } else {
                        setHasListened(false);
                        setIsImageVisible(false);
                        setReplayTrigger(prev => prev + 1);
                      }
                    }}
                    className="cursor-pointer select-none"
                  >
                    <DecodableWord
                      key={`${currentIndex}-${replayTrigger}`}
                      text={currentItem.name}
                      ttsText={currentItem.tts || currentItem.name}
                      voice={femaleVoice ?? null}
                      hasInteracted={hasInteracted}
                      replayTrigger={replayTrigger}
                      onComplete={handleSequenceComplete}
                      isAnimatingRef={isAnimatingRef}
                    />
                  </div>
                )}
              </div>

              {/* Image Layer (Bottom Portion) */}
              <div className="w-full flex items-center justify-center h-56 sm:h-80 relative">
                <AnimatePresence>
                  {isImageVisible && (
                    <motion.div
                      key={currentIndex}
                      className="w-full h-full flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.8, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -15 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    >
                      <img
                        src={currentItem.image}
                        alt={currentItem.name}
                        className="max-w-full max-h-full object-contain drop-shadow-lg"
                        draggable="false"
                        onLoad={() => {
                          imageLoadedRef.current = true;
                        }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VocabApp;
