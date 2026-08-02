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
import { getLetterColors, getLetterHex } from "../lib/colorUtils";
import { vocabData, VocabItem } from "../data/vocabData";
import useLocalStorage from "@/hooks/useLocalStorage";
import { AnimalsVocab } from "./AnimalsVocab";
import { useSwipe } from "@/hooks/useSwipe";
import { motion } from 'framer-motion';
import { TrayMenu } from '@/components/TrayMenu';
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
 * The LAST tap is the payoff, Numbers-style: confetti fires immediately
 * (via onComplete) and the voice says the whole word plus praise — no sweep
 * animation, no ceremony between the child's action and the reward.
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
  const [isDone, setIsDone] = useState(false);
  const [nudge, setNudge] = useState(0);
  const { speak, stop } = useSpeechSynthesis();
  const wordRef = useRef<HTMLHeadingElement>(null);
  const activeAudiosRef = useRef<Set<HTMLAudioElement>>(new Set());
  const tappedRef = useRef(0);
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

  const finishWord = async (lastLetterSound: Promise<void>) => {
    // Reward hits ON the last tap, like the Numbers dots: confetti and the
    // advance timer start now (parent), while the voice wraps up the audio.
    doneRef.current = true;
    setIsDone(true);
    onCompleteRef.current();
    await lastLetterSound;
    if (cancelledRef.current) return;
    stop();
    speak(`${ttsText}! ${randomPraise()}`, { voice, rate: 1.0 });
  };

  const handleLetterTap = (index: number) => {
    if (doneRef.current) {
      // Finished — tapping the word repeats it whole (fast recognition practice)
      playVocabTapPop();
      stop();
      speak(ttsText, { voice, rate: 1.0 });
      return;
    }

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
      finishWord(soundPromise);
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
              {/* The letter ITSELF is the press target — no dots underneath.
                  Outer span replays a one-shot wiggle whenever a wrong-order
                  tap bumps `nudge`; the next letter pulses with a soft glow
                  in its own color as the invitation. */}
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
                  className={`block transition-colors duration-200 ${
                    isLit ? colors.text : "text-slate-700 dark:text-slate-200"
                  }`}
                  style={
                    isActive
                      ? { textShadow: `0 0 0.3em ${getLetterHex(char)}66` }
                      : undefined
                  }
                  animate={
                    isLit && index === tappedCount - 1
                      ? { scale: [1, 1.15, 1] }
                      : isActive
                      ? { scale: [1, 1.08, 1] }
                      : { scale: 1 }
                  }
                  transition={
                    isActive
                      ? { repeat: Infinity, duration: 1.1, ease: "easeInOut" }
                      : { duration: 0.35 }
                  }
                >
                  {char}
                </motion.span>
              </motion.span>

              {/* Bouncing finger on the very first letter */}
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
      // Confetti + advance timer (parent) land WITH the confirming voice
      onCompleteRef.current();
      speak(`${ttsText}! ${randomPraise()}`, { voice, rate: 1.0 });
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
// A word counts as KNOWN BY SIGHT after this many silent-quiz wins — rounds
// where the print alone was the question and the child answered unaided.
const SIGHT_KNOWN = 3;

/**
 * FIND-THE-PICTURE MODE — the word appears fully colored; three pictures show
 * up; the child taps the one it names. Wrong picks thud and dim — unlimited
 * tries, no fail state.
 *
 * Two flavors:
 *  - spoken (silent=false): the word is also said aloud — a gentle on-ramp
 *    that teaches the game shape and builds listening vocabulary.
 *  - SILENT (silent=true): nothing is spoken until the child answers. The
 *    PRINT is the question — this is the actual sight-reading rep, the one
 *    that earns "known by sight" credit. The voice confirms only on success.
 */
const PictureQuiz = ({
  item,
  choices,
  voice,
  silent = false,
  onSolved,
  onMiss,
}: {
  item: VocabItem;
  choices: VocabItem[];
  voice: SpeechSynthesisVoice | null;
  silent?: boolean;
  onSolved: () => void;
  onMiss?: () => void;
}) => {
  const [wrongPicks, setWrongPicks] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState(false);
  const { speak, stop } = useSpeechSynthesis();
  const wordRef = useRef<HTMLHeadingElement>(null);
  const solvedRef = useRef(false);
  const cancelledRef = useRef(false);

  useAutoFitFont(wordRef, item.name, 9 * 16, 4 * 16);

  const sayWord = useCallback(() => {
    stop();
    speak(item.tts || item.name, { voice, rate: 1.0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, voice]);

  useEffect(() => {
    // Silent rounds never give the answer away up front
    const timer = silent
      ? null
      : setTimeout(() => {
          if (!cancelledRef.current) sayWord();
        }, 600);
    return () => {
      cancelledRef.current = true;
      if (timer) clearTimeout(timer);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = (choice: VocabItem) => {
    if (solvedRef.current) return;
    if (choice.name === item.name) {
      solvedRef.current = true;
      setSolved(true);
      if (navigator.vibrate) navigator.vibrate(15);
      stop();
      // Silent rounds confirm the word itself — that's the feedback moment
      speak(silent ? `${item.tts || item.name}! ${randomPraise()}` : randomPraise(), { voice });
      onSolved(); // parent: confetti + auto-advance
    } else {
      if (wrongPicks.has(choice.name)) return;
      playWrongTapThud();
      setWrongPicks((prev) => new Set(prev).add(choice.name));
      onMiss?.();
      // Spoken rounds re-say the word for fresh ears; silent rounds stay
      // quiet — the child re-reads and tries again
      if (!silent) {
        setTimeout(() => {
          if (!cancelledRef.current) sayWord();
        }, 450);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 sm:gap-10 w-full">
      {/* The word — tap to hear it again */}
      <div
        className="w-full flex justify-center cursor-pointer pointer-events-auto"
        onPointerDown={(e) => {
          e.stopPropagation();
          playVocabTapPop();
          sayWord();
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          ref={wordRef}
          className="font-black text-center tracking-wide select-none leading-none inline-block whitespace-nowrap"
        >
          {item.name.split("").map((char, index) => (
            <span key={index} className={getLetterColors(char).text}>
              {char}
            </span>
          ))}
        </h2>
      </div>

      {/* The picture choices */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-4 sm:gap-8">
        {choices.map((choice) => {
          const isWrong = wrongPicks.has(choice.name);
          const isWinner = solved && choice.name === item.name;

          return (
            <motion.button
              key={choice.name}
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePick(choice);
              }}
              onClick={(e) => e.stopPropagation()}
              disabled={isWrong}
              className={`flex items-center justify-center w-28 h-28 sm:w-44 sm:h-44 rounded-[2rem] bg-white dark:bg-zinc-900 shadow-xl border-4 border-slate-200 dark:border-zinc-700 p-2 sm:p-3 focus:outline-none pointer-events-auto select-none ${
                isWrong ? "opacity-25 grayscale" : ""
              }`}
              style={{ transition: "opacity 250ms ease-out, filter 250ms ease-out" }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={isWinner ? { scale: [1, 1.2, 1.1], opacity: 1 } : { scale: 1, opacity: 1 }}
              transition={
                isWinner
                  ? { duration: 0.5 }
                  : { type: "spring", stiffness: 300, damping: 20 }
              }
              whileTap={solved || isWrong ? {} : { scale: 0.92 }}
            >
              <img
                src={choice.image}
                alt=""
                className="max-w-full max-h-full object-contain"
                draggable="false"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * FIND-THE-WORD MODE — the strongest sight-reading builder: a picture asks
 * the question, three WRITTEN words are the answers, and the distractors are
 * lookalikes (cat / bat / rat) so only actually processing the letters works.
 *
 * The word cards render in a NEUTRAL color on purpose: everywhere else the
 * app colors letters by identity, and colored choices here would let the
 * child match by color instead of reading. The letter colors come back on
 * the winning card as the reward.
 */
const WordQuiz = ({
  item,
  choices,
  voice,
  onSolved,
  onMiss,
}: {
  item: VocabItem;
  choices: VocabItem[];
  voice: SpeechSynthesisVoice | null;
  onSolved: () => void;
  onMiss?: () => void;
}) => {
  const [wrongPicks, setWrongPicks] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState(false);
  const { speak, stop } = useSpeechSynthesis();
  const solvedRef = useRef(false);

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = (choice: VocabItem) => {
    if (solvedRef.current) return;
    if (choice.name === item.name) {
      solvedRef.current = true;
      setSolved(true);
      if (navigator.vibrate) navigator.vibrate(15);
      stop();
      speak(`${item.tts || item.name}! ${randomPraise()}`, { voice });
      onSolved(); // parent: confetti + auto-advance
    } else {
      if (wrongPicks.has(choice.name)) return;
      playWrongTapThud();
      setWrongPicks((prev) => new Set(prev).add(choice.name));
      onMiss?.();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 sm:gap-10 w-full">
      {/* The picture is the question */}
      <div className="h-40 sm:h-56 flex items-center justify-center">
        <img
          src={item.image}
          alt=""
          className="max-h-full max-w-[70vw] object-contain drop-shadow-xl"
          draggable="false"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>

      {/* The written answers */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-4 sm:gap-6">
        {choices.map((choice) => {
          const isWrong = wrongPicks.has(choice.name);
          const isWinner = solved && choice.name === item.name;

          return (
            <motion.button
              key={choice.name}
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePick(choice);
              }}
              onClick={(e) => e.stopPropagation()}
              disabled={isWrong}
              className={`px-5 py-4 sm:px-8 sm:py-6 rounded-[1.5rem] bg-white dark:bg-zinc-900 shadow-xl border-4 border-slate-200 dark:border-zinc-700 focus:outline-none pointer-events-auto select-none ${
                isWrong ? "opacity-25 grayscale" : ""
              }`}
              style={{ transition: "opacity 250ms ease-out, filter 250ms ease-out" }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={isWinner ? { scale: [1, 1.2, 1.1], opacity: 1 } : { scale: 1, opacity: 1 }}
              transition={
                isWinner
                  ? { duration: 0.5 }
                  : { type: "spring", stiffness: 300, damping: 20 }
              }
              whileTap={solved || isWrong ? {} : { scale: 0.92 }}
            >
              <span
                className="font-black tracking-wide text-4xl sm:text-6xl leading-none"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {choice.name.split("").map((char, i) => (
                  <span
                    key={i}
                    className={
                      isWinner
                        ? getLetterColors(char).text
                        : "text-slate-700 dark:text-slate-200"
                    }
                  >
                    {char}
                  </span>
                ))}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

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

  // Per-word progress, persisted on the device. Two separate ladders:
  //  - wordMastery: completed decodes (the word was TAUGHT)
  //  - wordSight: silent-quiz wins — print alone was the question and the
  //    child answered unaided (the word is KNOWN). This is the number that
  //    actually measures sight recognition, so it drives shuffle weighting.
  const [wordMastery, setWordMastery] = useLocalStorage<Record<string, number>>(
    "wordMastery",
    {},
  );
  const [wordSight, setWordSight] = useLocalStorage<Record<string, number>>(
    "wordSightMastery",
    {},
  );

  // A wrong pick on this card means "practiced, not proven" — no sight credit
  const missedRef = useRef(false);

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

  // Decide how this card plays, once per card (stable across re-renders).
  // The ladder climbs from being TOLD the word to READING it unaided:
  //  - decode: build the word from its sound buttons (teaches)
  //  - pickImage: word shown AND spoken → tap its picture (game on-ramp)
  //  - pickImageSilent: word shown, NOTHING spoken → tap its picture
  //    (print→meaning retrieval — earns sight credit)
  //  - pickWord: picture shown → tap the right WRITTEN word among
  //    lookalikes (letter-level reading — earns sight credit)
  //  - sight: word alone, beat to say it, voice confirms (quick flash)
  const cardPlan = useMemo<{
    mode: "decode" | "sight" | "pickImage" | "pickImageSilent" | "pickWord";
    quizChoices: VocabItem[];
  }>(() => {
    const item = filteredVocab[currentIndex];
    if (!item) return { mode: "decode", quizChoices: [] };
    const decodes = wordMastery[item.name] ?? 0;
    const sightWins = wordSight[item.name] ?? 0;
    const r = Math.random();

    let mode: "decode" | "sight" | "pickImage" | "pickImageSilent" | "pickWord" =
      "decode";
    if (filteredVocab.length >= 3) {
      if (sightWins >= SIGHT_KNOWN) {
        // Proven by sight: quick flashes + maintenance quizzes
        mode = r < 0.35 ? "sight" : r < 0.6 ? "pickWord" : r < 0.85 ? "pickImageSilent" : "decode";
      } else if (decodes >= 2) {
        // The learning zone: silent retrieval carries the load
        mode = r < 0.4 ? "pickImageSilent" : r < 0.7 ? "pickWord" : "decode";
      } else if (decodes >= 1) {
        // Gentle on-ramp: the same game WITH the voice helping
        mode = r < 0.35 ? "pickImage" : "decode";
      }
    } else if (sightWins >= SIGHT_KNOWN && r < SIGHT_MODE_CHANCE) {
      mode = "sight";
    }
    if (mode === "decode" || mode === "sight") return { mode, quizChoices: [] };

    // Distractors. Picture rounds take random others; the find-the-word
    // round picks LOOKALIKES (shared first letter / length / rime — cat,
    // bat, rat) so color, shape or first-letter guessing can't solve it.
    const others = filteredVocab.filter((v) => v.name !== item.name);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    if (mode === "pickWord") {
      const a = item.name.toLowerCase();
      const sim = (b: string) => {
        let s = 0;
        if (a[0] === b[0]) s += 2;
        if (a.length === b.length) s += 1;
        if (a.slice(-2) === b.slice(-2)) s += 2;
        return s;
      };
      others.sort((x, y) => sim(y.name.toLowerCase()) - sim(x.name.toLowerCase()));
    }
    const quizChoices = [item, others[0], others[1]];
    for (let i = quizChoices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [quizChoices[i], quizChoices[j]] = [quizChoices[j], quizChoices[i]];
    }
    return { mode, quizChoices };
    // Intentionally keyed to the card only — mode must not flip mid-card
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);
  const cardMode = cardPlan.mode;
  const isQuizRound =
    cardMode === "pickImage" || cardMode === "pickImageSilent" || cardMode === "pickWord";

  const shuffleItems = useCallback(
    (shouldSetFirst = false) => {
      // Weighted bag: words not yet KNOWN BY SIGHT appear twice per cycle so
      // practice concentrates exactly where recognition is weakest.
      const bag: number[] = [];
      filteredVocab.forEach((item, i) => {
        bag.push(i);
        if ((wordSight[item.name] ?? 0) < SIGHT_KNOWN) {
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
    [filteredVocab, wordSight],
  );

  useEffect(() => {
    shuffleItems(true);
    // Mount-only: the parent remounts this component (via key) when the category changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fresh card: back to the inviting picture — except quiz rounds, which
  // must not show the answer first
  useEffect(() => {
    setStage(isQuizRound ? "word" : "image");
    missedRef.current = false;
    clearAdvanceTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // First wrong pick on a quiz card: no sight credit this round, and the
  // word comes back around in a couple of cards for another try.
  const handleQuizMiss = useCallback(() => {
    if (missedRef.current) return;
    missedRef.current = true;
    setShuffledIndices((prev) => {
      const at = Math.min(shuffledIndex + 2, prev.length);
      const next = [...prev];
      next.splice(at, 0, currentIndex);
      return next;
    });
  }, [shuffledIndex, currentIndex]);

  const handleSequenceComplete = useCallback(() => {
    setStage("done");
    // The Numbers-page payoff, the instant the child earns it: confetti NOW
    // (each round component speaks its own word + praise concurrently).
    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#FF9F1C", "#a78bfa"],
    });
    if (currentItem) {
      if (cardMode === "decode") {
        // Decodes build the taught ladder
        setWordMastery((prev) => ({
          ...prev,
          [currentItem.name]: (prev[currentItem.name] ?? 0) + 1,
        }));
      } else if (
        (cardMode === "pickImageSilent" || cardMode === "pickWord") &&
        !missedRef.current
      ) {
        // Clean silent-quiz win: the print alone was read correctly —
        // THIS is what "knows the word by sight" means
        setWordSight((prev) => ({
          ...prev,
          [currentItem.name]: (prev[currentItem.name] ?? 0) + 1,
        }));
      }
    }
    clearAdvanceTimer();
    // Decode fires completion at the last tap, so its word+praise audio is
    // still ahead of it; silent wins say word+praise; spoken rounds are shorter.
    const advanceDelay =
      cardMode === "decode" ? 2600
      : cardMode === "pickImageSilent" || cardMode === "pickWord" ? 2200
      : 1800;
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      handleShuffleRef.current();
    }, advanceDelay);
  }, [cardMode, currentItem, setWordMastery, setWordSight, clearAdvanceTimer]);

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



      </header>

      <div className="flex-1 flex flex-col justify-center w-full overflow-hidden relative">
        <main className="flex flex-col items-center justify-center text-center px-4 w-full h-full">
          <div className="w-full flex justify-center items-center">
            <div
              className="relative flex flex-col items-center justify-center gap-6 sm:gap-10 w-[95%] max-w-[800px] pointer-events-auto"
              style={{ minHeight: "clamp(300px, 75vh, 600px)" }}
            >
              {/* Quiz rounds skip the stages entirely — showing the answer
                  first would defeat the retrieval practice */}
              {!isShuffling && (cardMode === "pickImage" || cardMode === "pickImageSilent") && (
                <PictureQuiz
                  key={currentIndex}
                  item={currentItem}
                  choices={cardPlan.quizChoices}
                  voice={preferredVoice ?? null}
                  silent={cardMode === "pickImageSilent"}
                  onSolved={handleSequenceComplete}
                  onMiss={handleQuizMiss}
                />
              )}

              {!isShuffling && cardMode === "pickWord" && (
                <WordQuiz
                  key={currentIndex}
                  item={currentItem}
                  choices={cardPlan.quizChoices}
                  voice={preferredVoice ?? null}
                  onSolved={handleSequenceComplete}
                  onMiss={handleQuizMiss}
                />
              )}

              {/* Stage 1 — the picture is the star: big, breathing, tap me!
                  (No opacity in this entrance: if animation frames ever
                  stall, a frozen first frame must still be visible.) */}
              {!isShuffling && !isQuizRound && stage === "image" && (
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
              {!isShuffling && !isQuizRound && stage !== "image" && (
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
