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
// Helper to get letter sound file path from Phonics audio assets
const getLetterSoundFile = (char: string): string | null => {
  const code = char.toLowerCase().charCodeAt(0);
  if (code >= 97 && code <= 122) {
    const index = code - 96;
    const paddedIndex = index.toString().padStart(2, "0");
    return `/sounds/Phonics/Sound ${paddedIndex}.mp3`;
  }
  return null;
};

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
  
  // Track multiple concurrent active audios during rapid blending phase to prevent memory/sensory leaks
  const activeAudiosRef = useRef<Set<HTMLAudioElement>>(new Set());

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

  // Play real human-recorded phonics MP3 letter sound sequentially
  const playLetterSound = (char: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      const soundFile = getLetterSoundFile(char);
      if (!soundFile) {
        resolve();
        return;
      }
      
      const audio = new Audio(soundFile);
      activeAudiosRef.current.add(audio);
      
      audio.onended = () => {
        activeAudiosRef.current.delete(audio);
        resolve();
      };
      
      audio.onerror = () => {
        activeAudiosRef.current.delete(audio);
        resolve();
      };
      
      // Safety backup timeout of 1.2s to prevent getting stuck
      const timeout = setTimeout(() => {
        activeAudiosRef.current.delete(audio);
        resolve();
      }, 1200);
      
      audio.play()
        .then(() => {})
        .catch((err) => {
          console.error("Audio playback error:", err);
          clearTimeout(timeout);
          activeAudiosRef.current.delete(audio);
          resolve();
        });
    });
  };

  useEffect(() => {
    if (!hasInteracted) {
      setHighlightedCount(0);
      isAnimatingRef.current = false;
      return;
    }

    let isCancelled = false;

    const runSequence = async () => {
      isAnimatingRef.current = true;
      const totalLetters = text.length;

      // ==========================================
      // STAGE 1: DECODING (Slow Spelling)
      // ==========================================
      setHighlightedCount(1);
      await playLetterSound(text[0]);

      if (totalLetters > 1) {
        for (let current = 2; current <= totalLetters; current++) {
          if (isCancelled) return;
          
          // Gentle, slow spelling delay (250ms) for letter recognition
          await new Promise((r) => setTimeout(r, 250));
          if (isCancelled) return;
          
          setHighlightedCount(current);
          await playLetterSound(text[current - 1]);
        }
      }

      if (isCancelled) return;

      // ==========================================
      // STAGE 2: BLENDING (Rapid Spelling)
      // ==========================================
      // Toddler beat: Pause for 600ms to separate spelling from blending
      await new Promise((r) => setTimeout(r, 600));
      if (isCancelled) return;

      // Snappy un-highlight to show spelling reset
      setHighlightedCount(0);
      await new Promise((r) => setTimeout(r, 120));
      if (isCancelled) return;

      // Rapidly sound it out without awaiting, letting letter sounds blend together naturally!
      setHighlightedCount(1);
      playLetterSound(text[0]); // Fire and forget so they blend!

      if (totalLetters > 1) {
        for (let current = 2; current <= totalLetters; current++) {
          if (isCancelled) return;
          
          // Fast blending delay (120ms) between letter starts
          await new Promise((r) => setTimeout(r, 120));
          if (isCancelled) return;
          
          setHighlightedCount(current);
          playLetterSound(text[current - 1]);
        }
      }

      if (isCancelled) return;
      setHighlightedCount(totalLetters);

      // Spacious toddler-friendly pause after blending (1200ms) to let them say the word before the TTS voice does
      await new Promise((r) => setTimeout(r, 1200));
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
      
      // Stop and clear all active letter audio objects instantly
      activeAudiosRef.current.forEach((audio) => {
        try {
          audio.pause();
        } catch (e) {
          // Ignore
        }
      });
      activeAudiosRef.current.clear();
      
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
          : "text-slate-700 dark:text-slate-200"; // Extremely high contrast legibility in both light & dark modes!

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
