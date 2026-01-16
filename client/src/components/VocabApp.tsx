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
const AnimatedWord = ({
  text,
  ttsText,
  onComplete,
  voice,
  isAnimatingRef,
}: {
  text: string;
  ttsText: string;
  onComplete: () => void;
  voice: SpeechSynthesisVoice | null;
  isAnimatingRef: React.MutableRefObject<boolean>;
}) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const { speak, stop } = useSpeechSynthesis();
  const wordRef = useRef<HTMLHeadingElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let isCancelled = false;
    let animationInterval: NodeJS.Timeout;

    const animateLetters = async () => {
      const totalLetters = text.length;
      let current = 1;
      const letterDelay = 300;

      if (totalLetters <= 1) return;

      return new Promise<void>((resolve) => {
        animationInterval = setInterval(() => {
          if (isCancelled) {
            resolve();
            return;
          }
          current++;
          setVisibleCount(current);
          if (current >= totalLetters) {
            clearInterval(animationInterval);
            resolve();
          }
        }, letterDelay);
      });
    };

    const runSequence = async () => {
      isAnimatingRef.current = true;
      
      if (isCancelled) return;

      // Start first letter fade immediately
      setVisibleCount(1);

      // 1. Animation only
      await animateLetters();
      
      if (isCancelled) return;

      // Ensure full word visible
      setVisibleCount(text.length);
      clearInterval(animationInterval);

      await new Promise((r) => setTimeout(r, 200));
      if (isCancelled) return;

      // 2. Regular TTS
      await speak(ttsText, { voice: voice, rate: 1.0 });

      if (!isCancelled) {
        isAnimatingRef.current = false;
        onCompleteRef.current();
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
      stop();
      clearInterval(animationInterval);
      isAnimatingRef.current = false;
    };
  }, [text, ttsText, voice, speak, stop, isAnimatingRef]);

  useLayoutEffect(() => {
    if (wordRef.current) {
      const container = wordRef.current.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        wordRef.current.style.fontSize = "100px";
        const wordWidth = wordRef.current.scrollWidth;
        const targetWidth = containerWidth * 0.9;
        let newFontSize = (targetWidth / wordWidth) * 100;
        const maxFontSize = 10 * 16;
        const minFontSize = 3 * 16;
        newFontSize = Math.max(minFontSize, Math.min(newFontSize, maxFontSize));
        wordRef.current.style.fontSize = `${newFontSize}px`;
      }
    }
  }, [text]);

  return (
    <h2 ref={wordRef} className="font-bold break-words">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`transition-opacity duration-300 ${index < visibleCount ? "opacity-100" : "opacity-0"} ${index === 0 ? getLetterColors(char).text : "text-gray-600 dark:text-gray-400"}`}
        >
          {char}
        </span>
      ))}
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
                document.documentElement.requestFullscreen().catch(() => {});
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
  const [isShuffling, setIsShuffling] = useState(false);

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
    imageLoadedRef.current = false;
  }, [currentIndex]);

  // Handle image fade in/out sequence
  useEffect(() => {
    if (hasListened) {
      setIsImageVisible(true);
      const timer = setTimeout(() => {
        setIsImageVisible(false);
      }, 3000); // 1s fade in + 2s hold
      return () => clearTimeout(timer);
    }
  }, [hasListened]);

  const handleShuffle = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
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
  }, [shuffledIndex, shuffledIndices, shuffleItems]);

  const handleInteraction = useCallback(async () => {
    handleShuffle();
  }, [handleShuffle]);

  const handleSequenceComplete = useCallback(() => {
    setHasListened(true);
    // Auto confetti at the end of the sequence
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });
    // Removed auto-flip to image since flip is disabled
  }, []);

  const handleNext = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    setTimeout(() => {
      setHasListened(false); // Reset immediately
      setIsImageVisible(false);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredVocab.length);
    }, 150);
  }, [filteredVocab.length]);

  const handlePrevious = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    setTimeout(() => {
      setHasListened(false); // Reset immediately
      setIsImageVisible(false);
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredVocab.length) % filteredVocab.length,
      );
    }, 150);
  }, [filteredVocab.length]);

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
      className="fixed inset-0 select-none flex flex-col overflow-hidden pb-12 md:pb-0 touchable-area"
      onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
      onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
      onTouchEnd={(e) => swipeHandlers.onTouchEnd()}
      onClick={handleInteraction}
    >
      <header className="flex items-center justify-between p-4 flex-shrink-0 w-full">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
            setLocation("/app", { replace: true });
          }}
          className="z-50 flex items-center justify-center w-20 h-20 rounded-full bg-secondary hover:bg-border text-secondary-foreground transition-colors focus:outline-none focus:ring-0 opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
      </header>

      <div 
        className="flex-1 flex flex-col justify-center w-full"
      >
        <main
          className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden -mt-20 md:-mt-44"
        >
          <div
            className="w-full flex justify-center items-center"
            style={{ perspective: "1000px" }}
          >
            <div
              className="card"
              style={{ width: "100%", height: "clamp(300px, 80vw, 600px)" }}
            >
              <div className="card-face card-face-front relative overflow-hidden">
                {/* Background Image Layer */}
                <div 
                  key={currentIndex}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${isImageVisible ? 'opacity-100' : 'opacity-0'}`}
                >
                   <img
                    src={currentItem.image}
                    alt={currentItem.name}
                    className="w-full h-full object-contain p-8 opacity-40" 
                    draggable="false"
                    onLoad={() => { imageLoadedRef.current = true; }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>

                {/* Text Layer - z-index ensures it stays on top */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  {/* Use key to force remount on index change -> Fixes FOUC and resets animation */}
                  {!isShuffling && (
                    <AnimatedWord
                      key={currentIndex}
                      text={currentItem.name}
                      ttsText={currentItem.tts || currentItem.name}
                      voice={femaleVoice ?? null}
                      onComplete={handleSequenceComplete}
                      isAnimatingRef={isAnimatingRef}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VocabApp;
