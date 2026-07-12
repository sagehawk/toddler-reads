import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import confetti from "canvas-confetti";
import { useRoute, useLocation } from "wouter";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { getLetterColors } from "../lib/colorUtils";
import { vocabData, VocabItem } from "../data/vocabData";
import useLocalStorage from "@/hooks/useLocalStorage";
import { AnimalsVocab } from "./AnimalsVocab";
import { useSwipe } from "@/hooks/useSwipe";
import { motion } from 'framer-motion';
import { TrayMenu } from '@/components/TrayMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getSharedAudioContext } from '../lib/sharedAudioContext';
import { playWrongTapThud, randomPraise, sleep } from '../lib/uiSounds';
import { useAutoFitFont } from '@/hooks/useAutoFitFont';

// ----- Real-time Bubbly Sound Synthesis for Tactile Toddler Interactions -----
const playVocabTapPop = () => {
  const ctx = getSharedAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {}
};

const playCardTransitionChime = () => {
  const ctx = getSharedAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.22);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {}
};

const categoryOrder = ["Animals", "Things", "Nature", "Vehicles", "People"];

const sortedVocabData = [...vocabData].sort((a, b) => {
  const categoryA = categoryOrder.indexOf(a.category);
  const categoryB = categoryOrder.indexOf(b.category);
  if (categoryA !== categoryB) {
    return categoryA - categoryB;
  }
  return a.name.localeCompare(b.name);
});

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

// Play a real human-recorded phonics MP3 letter sound; resolves when it ends
const makeLetterSoundPlayer = (activeAudiosRef: React.MutableRefObject<Set<HTMLAudioElement>>) =>
  (char: string): Promise<void> =>
    new Promise<void>((resolve) => {
      const soundFile = getLetterSoundFile(char);
      if (!soundFile) {
        resolve();
        return;
      }
      const audio = new Audio(soundFile);
      activeAudiosRef.current.add(audio);
      const finish = () => {
        activeAudiosRef.current.delete(audio);
        resolve();
      };
      audio.onended = finish;
      audio.onerror = finish;
      // Safety backup timeout of 1.2s to prevent getting stuck
      const timeout = setTimeout(finish, 1200);
      audio.play().catch((err) => {
        // AbortError just means a newer tap cancelled this sound — normal use
        if (err?.name !== "AbortError" && err?.name !== "NotAllowedError") {
          console.error("Audio playback error:", err);
        }
        clearTimeout(timeout);
        finish();
      });
    });

/**
 * DECODE MODE — the child sounds the word out *themselves*, in order.
 *
 * Each letter gets a "sound button" beneath it, exactly like the Numbers
 * dots. Only the leftmost un-tapped button glows; tapping it (or its letter)
 * says that letter's sound and lights the letter. Out-of-order taps nudge the
 * child back to the glowing button — the left-to-right order IS the game.
 * After the last sound, a line sweeps under the word while the voice blends
 * it whole ("now say it fast!"), then the picture confirms the meaning.
 */
const TapDecodeWord = ({
  text,
  ttsText,
  voice,
  onComplete,
}: {
  text: string;
  ttsText: string;
  voice: SpeechSynthesisVoice | null;
  onComplete: () => void;
}) => {
  const [tappedCount, setTappedCount] = useState(0);
  const [isBlending, setIsBlending] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [nudge, setNudge] = useState(0);
  const { speak, stop } = useSpeechSynthesis();
  const wordRef = useRef<HTMLHeadingElement>(null);
  const activeAudiosRef = useRef<Set<HTMLAudioElement>>(new Set());
  const tappedRef = useRef(0);
  const blendingRef = useRef(false);
  const doneRef = useRef(false);
  const cancelledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useAutoFitFont(wordRef, text, 14 * 16, 6 * 16);

  const playLetterSound = makeLetterSoundPlayer(activeAudiosRef);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      stop();
      activeAudiosRef.current.forEach((audio) => {
        try {
          audio.pause();
        } catch (e) {
          // Ignore
        }
      });
      activeAudiosRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beginBlend = async (lastLetterSound: Promise<void>) => {
    blendingRef.current = true;
    await lastLetterSound;
    if (cancelledRef.current) return;
    await sleep(350);
    if (cancelledRef.current) return;
    setIsBlending(true); // sweep line + letter cascade start now
    await speak(ttsText, { voice, rate: 0.95 });
    if (cancelledRef.current) return;
    doneRef.current = true;
    blendingRef.current = false;
    setIsDone(true);
    onCompleteRef.current();
  };

  const handleLetterTap = (index: number) => {
    if (doneRef.current) {
      // Finished — tapping the word repeats it whole (fast recognition practice)
      playVocabTapPop();
      stop();
      speak(ttsText, { voice, rate: 1.0 });
      return;
    }
    if (blendingRef.current) return;

    if (index < tappedRef.current) {
      // Revisiting an already-sounded letter is always allowed
      playLetterSound(text[index]);
      return;
    }
    if (index > tappedRef.current) {
      // Skipped ahead — nudge them back to the glowing button
      playWrongTapThud();
      setNudge((n) => n + 1);
      return;
    }
    // The correct next letter, left to right
    if (navigator.vibrate) navigator.vibrate(8);
    tappedRef.current += 1;
    setTappedCount(tappedRef.current);
    const soundPromise = playLetterSound(text[index]);
    if (tappedRef.current === text.length) {
      beginBlend(soundPromise);
    }
  };

  return (
    <div className="relative w-full flex justify-center">
      <h2
        ref={wordRef}
        className="relative font-black text-center tracking-wide select-none leading-none inline-block whitespace-nowrap"
      >
        {text.split("").map((char, index) => {
          const colors = getLetterColors(char);
          const isLit = index < tappedCount;
          const isActive = index === tappedCount && !isDone;
          const dotColorVar = colors.background.replace("bg-", "");

          return (
            <span
              key={index}
              className="relative inline-flex flex-col items-center cursor-pointer pointer-events-auto"
              onPointerDown={(e) => {
                e.stopPropagation();
                handleLetterTap(index);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.span
                className={`transition-colors duration-200 ${
                  isLit ? colors.text : "text-slate-700 dark:text-slate-200"
                }`}
                animate={
                  isBlending
                    ? { scale: [1, 1.18, 1] }
                    : isLit && index === tappedCount - 1
                    ? { scale: [1, 1.15, 1] }
                    : { scale: 1 }
                }
                transition={
                  isBlending
                    ? { duration: 0.45, delay: index * 0.09 }
                    : { duration: 0.35 }
                }
              >
                {char}
              </motion.span>

              {/* Sound button under the letter — same language as the Numbers dots.
                  Outer span replays a one-shot wiggle whenever a wrong-order tap
                  bumps `nudge`; inner span holds the steady active pulse. */}
              <motion.span
                key={`wiggle-${nudge}`}
                className="block"
                initial={false}
                animate={
                  isActive && nudge > 0
                    ? { x: [0, "-0.07em", "0.07em", "-0.045em", "0.045em", 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.4 }}
              >
                <motion.span
                  className={`block rounded-full ${isLit ? colors.background : isActive ? colors.text : ""}`}
                  style={{
                    width: "0.26em",
                    height: "0.26em",
                    marginTop: "0.14em",
                    border: isActive
                      ? "0.035em dashed currentColor"
                      : isLit
                      ? "0.035em solid transparent"
                      : "0.035em solid rgba(156, 163, 175, 0.35)",
                    backgroundColor: isLit ? undefined : "rgba(156, 163, 175, 0.12)",
                    transition: "background-color 120ms ease-out, border-color 120ms ease-out",
                  }}
                  animate={isActive ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={
                    isActive
                      ? { repeat: Infinity, duration: 1.1, ease: "easeInOut" }
                      : { duration: 0.2 }
                  }
                />
              </motion.span>

              {/* Bouncing finger on the very first sound button */}
              {isActive && tappedCount === 0 && (
                <motion.span
                  className="absolute top-full pointer-events-none select-none"
                  style={{ fontSize: "0.4em", marginTop: "0.05em" }}
                  animate={{ y: [0, "-0.25em", 0] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                  aria-hidden
                >
                  👆
                </motion.span>
              )}
            </span>
          );
        })}

        {/* Blend sweep: a line travels left→right under the letters as the word is said whole */}
        {isBlending && (
          <motion.span
            className="absolute left-0 right-0 rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-500"
            style={{ top: "1.02em", height: "0.08em", transformOrigin: "left center" }}
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            aria-hidden
          />
        )}
      </h2>
    </div>
  );
};

/**
 * SIGHT MODE — fast whole-word recognition for words the child has already
 * decoded several times. The word appears alone, fully colored, with a quiet
 * beat for the child to say it first; then the voice confirms it and the
 * picture appears. Tapping the word repeats it.
 */
const SightWord = ({
  text,
  ttsText,
  voice,
  onComplete,
}: {
  text: string;
  ttsText: string;
  voice: SpeechSynthesisVoice | null;
  onComplete: () => void;
}) => {
  const { speak, stop } = useSpeechSynthesis();
  const wordRef = useRef<HTMLHeadingElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useAutoFitFont(wordRef, text, 14 * 16, 6 * 16);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // The beat where the child gets to say it first — the whole point
      await sleep(1400);
      if (cancelled) return;
      await speak(ttsText, { voice, rate: 1.0 });
      if (cancelled) return;
      onCompleteRef.current();
    })();
    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="relative w-full flex justify-center">
      <motion.div
        className="relative cursor-pointer pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          playVocabTapPop();
          stop();
          speak(ttsText, { voice, rate: 1.0 });
        }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Mastered-word star so parents can see this is a quick flash round */}
        <span className="absolute -top-6 -right-6 text-3xl select-none" aria-hidden>
          ⭐
        </span>
        <h2
          ref={wordRef}
          className="font-black text-center tracking-wide select-none leading-none inline-block whitespace-nowrap"
        >
          {text.split("").map((char, index) => (
            <span key={index} className={getLetterColors(char).text}>
              {char}
            </span>
          ))}
        </h2>
      </motion.div>
    </div>
  );
};

import { usePreventBackExit } from "@/hooks/usePreventBackExit";

// Thin router wrapper. All flashcard state lives in VocabFlashcards below so the
// early return for the animals flow never changes this component's hook order
// (returning before hooks crashed React when switching between categories).
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

  // Key by category so switching categories remounts with fresh state
  return <VocabFlashcards key={category ?? "all"} items={filteredVocab} />;
};

// After this many completed decodes, a word starts appearing as a fast
// "sight word" flash card (word alone → child says it → voice confirms).
const SIGHT_THRESHOLD = 3;
// Even mastered words still get an occasional full decode round to stay sharp.
const SIGHT_MODE_CHANCE = 0.75;

// Each card plays like the Numbers page the little ones love:
// picture first → tap it → build the word → confetti + praise → next card.
type CardStage = "image" | "word" | "done";

const VocabFlashcards = ({ items }: { items: VocabItem[] }) => {
  const filteredVocab = items;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const [stage, setStage] = useState<CardStage>("image");
  const [isShuffling, setIsShuffling] = useState(false);

  // Per-word progress, persisted on the device: how many times each word has
  // been fully sounded out. Drives sight-mode graduation and shuffle weighting.
  const [wordMastery, setWordMastery] = useLocalStorage<Record<string, number>>(
    "wordMastery",
    {},
  );

  const { speak, stop, preferredVoice } = useSpeechSynthesis();

  // Pending auto-advance to the next card after a celebration
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const currentItem = filteredVocab[currentIndex];

  // Decide how this card plays, once per card (stable across re-renders)
  const cardMode = useMemo<"decode" | "sight">(() => {
    const name = filteredVocab[currentIndex]?.name;
    const mastery = name ? wordMastery[name] ?? 0 : 0;
    return mastery >= SIGHT_THRESHOLD && Math.random() < SIGHT_MODE_CHANCE
      ? "sight"
      : "decode";
    // Intentionally keyed to the card only — mode must not flip mid-card
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const shuffleItems = useCallback(
    (shouldSetFirst = false) => {
      // Weighted bag: words not yet mastered appear twice per cycle so the
      // child gets more practice exactly where recognition is weakest.
      const bag: number[] = [];
      filteredVocab.forEach((item, i) => {
        bag.push(i);
        if ((wordMastery[item.name] ?? 0) < SIGHT_THRESHOLD) {
          bag.push(i);
        }
      });
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      // Never show the same word twice in a row
      for (let i = 1; i < bag.length; i++) {
        if (bag[i] === bag[i - 1]) {
          const k = bag.findIndex((v, idx) => idx > i && v !== bag[i]);
          if (k !== -1) [bag[i], bag[k]] = [bag[k], bag[i]];
        }
      }
      setShuffledIndices(bag);
      if (shouldSetFirst && bag.length > 0) {
        setCurrentIndex(bag[0]);
        setShuffledIndex(1);
      } else {
        setShuffledIndex(0);
      }
    },
    [filteredVocab, wordMastery],
  );

  useEffect(() => {
    shuffleItems(true);
    // Mount-only: the parent remounts this component (via key) when the category changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fresh card: back to the inviting picture
  useEffect(() => {
    setStage("image");
    clearAdvanceTimer();
  }, [currentIndex, clearAdvanceTimer]);

  // Never leave a stray auto-advance behind on unmount
  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer]);

  const handleShuffle = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    clearAdvanceTimer();
    stop();
    playCardTransitionChime();
    setIsShuffling(true);

    setTimeout(() => {
      let nextIndex = shuffledIndex;
      if (nextIndex >= shuffledIndices.length) {
        shuffleItems(true);
      } else {
        setStage("image"); // Reset immediately
        setCurrentIndex(shuffledIndices[nextIndex]);
        setShuffledIndex((prev) => prev + 1);
      }
      setIsShuffling(false);
    }, 150);
  }, [shuffledIndex, shuffledIndices, shuffleItems, stop, clearAdvanceTimer]);

  // The auto-advance timer must always fire the freshest handleShuffle
  const handleShuffleRef = useRef(handleShuffle);
  handleShuffleRef.current = handleShuffle;

  const handleInteraction = useCallback(() => {
    // Little palms brush the background while tapping the sound buttons —
    // background taps only advance once the word's job is done.
    // Swipes and arrow keys still work as the grown-up escape hatch.
    if (stage !== "done") return;
    handleShuffle();
  }, [handleShuffle, stage]);

  // Picture tapped! Decode cards hear the word first (the model to build);
  // sight cards keep it quiet so the child reads the word themselves.
  const handleImageTap = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    playVocabTapPop();
    if (cardMode === "decode" && currentItem) {
      stop();
      speak(currentItem.tts || currentItem.name, { voice: preferredVoice ?? null });
    }
    setStage("word");
  }, [cardMode, currentItem, speak, stop, preferredVoice]);

  const handleSequenceComplete = useCallback(() => {
    setStage("done");
    // The Numbers-page payoff the little ones love: confetti, spoken
    // praise, then on to the next card by itself.
    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#FF9F1C", "#a78bfa"],
    });
    speak(randomPraise(), { voice: preferredVoice ?? null });
    // Only full decodes build mastery; sight rounds maintain it
    if (cardMode === "decode" && currentItem) {
      setWordMastery((prev) => ({
        ...prev,
        [currentItem.name]: (prev[currentItem.name] ?? 0) + 1,
      }));
    }
    clearAdvanceTimer();
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      handleShuffleRef.current();
    }, 2100);
  }, [cardMode, currentItem, setWordMastery, speak, preferredVoice, clearAdvanceTimer]);

  const handleNext = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    clearAdvanceTimer();
    stop();
    setTimeout(() => {
      setStage("image"); // Reset immediately
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredVocab.length);
    }, 150);
  }, [filteredVocab.length, stop, clearAdvanceTimer]);

  const handlePrevious = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    clearAdvanceTimer();
    stop();
    setTimeout(() => {
      setStage("image"); // Reset immediately
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredVocab.length) % filteredVocab.length,
      );
    }, 150);
  }, [filteredVocab.length, stop, clearAdvanceTimer]);

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
          setStage("image"); // Reset immediately
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
              {/* Stage 1 — the picture is the star: big, breathing, tap me!
                  (No opacity in this entrance: if animation frames ever
                  stall, a frozen first frame must still be visible.) */}
              {!isShuffling && stage === "image" && (
                <motion.div
                  key={`peek-${currentIndex}`}
                  className="relative flex flex-col items-center justify-center gap-6"
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <div
                    className="animate-breathe cursor-pointer pointer-events-auto"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleImageTap();
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={currentItem.image}
                      alt=""
                      className="max-h-[42vh] max-w-[82vw] object-contain drop-shadow-xl"
                      draggable="false"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                  <motion.div
                    className="text-5xl pointer-events-none select-none"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    aria-hidden
                  >
                    👆
                  </motion.div>
                </motion.div>
              )}

              {/* Stage 2 — picture docks up top, the word gets built below */}
              {!isShuffling && stage !== "image" && (
                <div className="flex flex-col items-center justify-center gap-4 sm:gap-8 w-full">
                  <motion.div
                    key={`dock-${currentIndex}`}
                    className="h-32 sm:h-44 flex items-center justify-center"
                    initial={{ scale: 1.6, y: 40 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  >
                    <img
                      src={currentItem.image}
                      alt={currentItem.name}
                      className="max-h-full max-w-[60vw] object-contain drop-shadow-lg"
                      draggable="false"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </motion.div>
                  <div className="relative z-10 w-full flex items-center justify-center">
                    {cardMode === "sight" ? (
                      <SightWord
                        key={currentIndex}
                        text={currentItem.name}
                        ttsText={currentItem.tts || currentItem.name}
                        voice={preferredVoice ?? null}
                        onComplete={handleSequenceComplete}
                      />
                    ) : (
                      <TapDecodeWord
                        key={currentIndex}
                        text={currentItem.name}
                        ttsText={currentItem.tts || currentItem.name}
                        voice={preferredVoice ?? null}
                        onComplete={handleSequenceComplete}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VocabApp;
