import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { TrayMenu } from "@/components/TrayMenu";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import useLocalStorage from "@/hooks/useLocalStorage";
import { usePreventBackExit } from "@/hooks/usePreventBackExit";
import { useSwipe } from "@/hooks/useSwipe";
import { useTheme } from "@/hooks/useTheme";
import { getSharedAudioContext } from "../lib/sharedAudioContext";
import { playWrongTapThud, randomPraise } from "../lib/uiSounds";
import { signWords, SignWord, FADE_STEPS, LAST_STEP } from "../data/signsData";

// ----- Real-time Bubbly Sound Synthesis for Tactile Toddler Interactions -----
const playTapPop = () => {
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

// Two bright rising notes as a clue melts away — the "level up" grown-ups hear
const playMeltChime = () => {
  const ctx = getSharedAudioContext();
  if (!ctx) return;
  try {
    [659.25, 987.77].forEach((freq, idx) => {
      const t = ctx.currentTime + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.04, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch (e) {}
};

// The word shows alone for this long so the child gets to SAY it before the
// answer pictures arrive.
const LOOK_BEAT_MS = 1500;
// Celebration + the melt animation, then on to the next card
const ADVANCE_MS = 2600;
// Clean reads of the plain lowercase word before it counts as known (⭐)
const KNOWN_AFTER = 2;

const SHAPE_EASE = "700ms ease-in-out";

const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

const wordForStep = (word: string, step: number) =>
  step <= 4 ? word.toUpperCase() : step === 5 ? capitalize(word) : word;

// Full size of the word once the shape is gone (240 box) — longer words shrink to fit
const plainWordSize = (word: string) => Math.min(92, 190 / (0.7 * word.length));

const shuffle = <T,>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Weighted shuffle bag: words not yet known by sight come up twice per pass,
// and never the same word twice in a row (including across bags).
const buildBag = (known: Record<string, number>, previous?: number): number[] => {
  const bag: number[] = [];
  signWords.forEach((sign, i) => {
    bag.push(i);
    if ((known[sign.word] ?? 0) < KNOWN_AFTER) bag.push(i);
  });
  shuffle(bag);
  for (let i = 0; i < bag.length; i++) {
    const prev = i === 0 ? previous : bag[i - 1];
    if (bag[i] === prev) {
      const k = bag.findIndex((v, idx) => idx > i && v !== prev);
      if (k !== -1) [bag[i], bag[k]] = [bag[k], bag[i]];
    }
  }
  return bag;
};

const useViewport = () => {
  const [viewport, setViewport] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return viewport;
};

/**
 * The shape behind the word. Every clue fades with a CSS transition, so a
 * step change "melts" the sign in place: the fill drains away (0→1), the
 * outline loses its color (1→2), then the outline disappears (2→3).
 */
const EmblemArt = ({ sign, step }: { sign: SignWord; step: number }) => {
  const { isDarkMode } = useTheme();
  const solid = step === 0;
  const outline = step === 2 ? (isDarkMode ? "#52525b" : "#94a3b8") : sign.color;

  return (
    <>
      {sign.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          strokeWidth={12}
          strokeLinejoin="round"
          style={{
            fill: p.fill ?? sign.color,
            fillOpacity: solid ? 1 : 0,
            // On the full sign the edge matches the fill: soft rounded corners
            stroke: solid ? p.fill ?? sign.color : outline,
            strokeOpacity: step <= 2 ? 1 : 0,
            transition: `fill-opacity ${SHAPE_EASE}, stroke ${SHAPE_EASE}, stroke-opacity ${SHAPE_EASE}`,
          }}
        />
      ))}
      {sign.decor?.map((d, i) => (
        <path
          key={`decor-${i}`}
          d={d.d}
          strokeWidth={d.width ?? 0}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            fill: d.fill ?? "none",
            stroke: d.stroke ?? "none",
            opacity: solid ? 1 : 0,
            transition: `opacity ${SHAPE_EASE}`,
          }}
        />
      ))}
    </>
  );
};

/**
 * The emblem with its word. The word rides ON the shape while there is one;
 * once the shape is gone it glides to the middle and grows to full size,
 * then sheds its color, then its capitals.
 */
const SignEmblem = ({ sign, step }: { sign: SignWord; step: number }) => {
  const { isDarkMode } = useTheme();
  const plain = plainWordSize(sign.word);
  const onShape = step <= 2;
  const x = onShape ? sign.wordAt.x : 120;
  const y = onShape ? sign.wordAt.y : 120;
  const scale = onShape ? sign.wordAt.size / plain : 1;
  const color =
    step === 0
      ? sign.onSign
      : step <= 3
      ? sign.color
      : isDarkMode
      ? "#e2e8f0"
      : "#334155";
  const text = wordForStep(sign.word, step);

  return (
    <svg viewBox="0 0 240 240" className="w-full h-full overflow-visible" role="img" aria-label={sign.word}>
      <EmblemArt sign={sign} step={step} />
      <g
        style={{
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          transformOrigin: "0 0",
          transformBox: "view-box",
          transition: "transform 650ms cubic-bezier(0.34, 1.3, 0.64, 1)",
        }}
      >
        {/* Case changes (STOP → Stop → stop) cross-fade in place */}
        <AnimatePresence initial={false}>
          <motion.g
            key={text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <text
              x={0}
              y={plain * 0.35}
              textAnchor="middle"
              fontSize={plain}
              fontWeight={900}
              style={{
                fontFamily: "'Nunito', sans-serif",
                fill: color,
                transition: `fill ${SHAPE_EASE}`,
              }}
            >
              {text}
            </text>
          </motion.g>
        </AnimatePresence>
      </g>
    </svg>
  );
};

const TrafficLight = () => (
  <svg viewBox="0 0 240 240" className="w-full h-full">
    <rect x="76" y="10" width="88" height="220" rx="26" fill="#1f2937" stroke="#4b5563" strokeWidth="4" />
    <circle cx="120" cy="54" r="27" fill="#7f1d1d" />
    <circle cx="120" cy="120" r="27" fill="#713f12" />
    <circle cx="120" cy="186" r="38" fill="#22c55e" opacity="0.3" />
    <circle cx="120" cy="186" r="27" fill="#22c55e" />
  </svg>
);

/** An answer card: the thing the word means, with no letters on it. */
const SignPicture = ({ sign }: { sign: SignWord }) => {
  if ("image" in sign.picture) {
    return (
      <img
        src={sign.picture.image}
        alt=""
        className="max-w-full max-h-full object-contain rounded-xl"
        draggable="false"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    );
  }
  if (sign.picture.drawn === "trafficLight") return <TrafficLight />;
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <EmblemArt sign={sign} step={0} />
    </svg>
  );
};

// Where this word is on its fade ladder — neutral on purpose, so the dots
// never hand back the color clue the word just lost.
const StepPips = ({ step }: { step: number }) => (
  <div className="flex items-center gap-2 pointer-events-none" aria-hidden>
    {Array.from({ length: FADE_STEPS }, (_, i) => (
      <span
        key={i}
        className={`block w-2.5 h-2.5 rounded-full ${
          i <= step ? "bg-slate-400 dark:bg-zinc-400" : "bg-slate-200 dark:bg-zinc-800"
        }`}
      />
    ))}
  </div>
);

type Phase = "look" | "choose" | "done";

/**
 * One card. The word appears alone at its current step and stays quiet for a
 * beat (the child says it), then three pictures pop in and the child taps the
 * one it means. The voice only says the word AFTER the right pick.
 *
 *  - clean win: one clue melts away on screen, and the word starts there
 *    next time
 *  - wrong pick: thud, the picture dims, and the sign takes one clue BACK on
 *    the spot (errorless backup) — unlimited tries, no fail state
 */
const SignRound = ({
  sign,
  startStep,
  choices,
  mastered,
  voice,
  lookSize,
  smallSize,
  cardSize,
  onSolved,
  onMiss,
}: {
  sign: SignWord;
  startStep: number;
  choices: SignWord[];
  mastered: boolean;
  voice: SpeechSynthesisVoice | null;
  lookSize: number;
  smallSize: number;
  cardSize: number;
  onSolved: (result: { step: number; readPlain: boolean }) => void;
  onMiss: () => void;
}) => {
  const [phase, setPhase] = useState<Phase>("look");
  const [step, setStep] = useState(startStep);
  const [wrongPicks, setWrongPicks] = useState<Set<string>>(new Set());
  const { speak, stop } = useSpeechSynthesis();
  const [wiggleScope, animateWiggle] = useAnimate<HTMLDivElement>();
  const phaseRef = useRef<Phase>("look");
  const stepRef = useRef(startStep);
  const missedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  const goTo = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  useEffect(() => {
    later(() => {
      if (phaseRef.current === "look") goTo("choose");
    }, LOOK_BEAT_MS);
    return () => {
      timersRef.current.forEach(clearTimeout);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignTap = () => {
    playTapPop();
    if (phaseRef.current === "done") {
      // Finished — tapping the word repeats it (quick recognition practice)
      speak(capitalize(sign.word), { voice });
      return;
    }
    // Before the answer the sign never says its own name — that would hand
    // the child the answer. It wiggles, and skips the quiet beat.
    if (wiggleScope.current) {
      animateWiggle(wiggleScope.current, { rotate: [0, -5, 5, -3, 3, 0] }, { duration: 0.4 });
    }
    if (phaseRef.current === "look") goTo("choose");
  };

  const handlePick = (choice: SignWord) => {
    if (phaseRef.current !== "choose") return;

    if (choice.word !== sign.word) {
      if (wrongPicks.has(choice.word)) return;
      playWrongTapThud();
      setWrongPicks((prev) => new Set(prev).add(choice.word));
      if (!missedRef.current) {
        missedRef.current = true;
        onMiss();
      }
      // Errorless backup: hand one clue back so the next try is easier
      if (stepRef.current > 0) {
        stepRef.current -= 1;
        setStep(stepRef.current);
      }
      return;
    }

    goTo("done");
    if (navigator.vibrate) navigator.vibrate(15);
    speak(`${capitalize(sign.word)}! ${randomPraise()}`, { voice });
    const from = stepRef.current;
    const clean = !missedRef.current;
    const next = clean ? Math.min(from + 1, LAST_STEP) : from;
    onSolved({ step: next, readPlain: clean && from === LAST_STEP });
    if (next !== from) {
      // The reward grown-ups can SEE: one clue melts away right now
      later(() => {
        stepRef.current = next;
        setStep(next);
        playMeltChime();
      }, 650);
    }
  };

  const emblemSize = phase === "look" ? lookSize : smallSize;

  return (
    <div className="flex flex-col items-center justify-center gap-5 sm:gap-8 w-full">
      {/* No opacity in this entrance: if animation frames ever stall, a
          frozen first frame must still show the word. */}
      <motion.div
        className="relative cursor-pointer pointer-events-auto"
        initial={{ width: lookSize, height: lookSize, scale: 0.85 }}
        animate={{ width: emblemSize, height: emblemSize, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        onPointerDown={(e) => {
          e.stopPropagation();
          handleSignTap();
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={wiggleScope} className="w-full h-full">
          <div className={`w-full h-full ${phase === "look" ? "animate-breathe" : ""}`}>
            <SignEmblem sign={sign} step={step} />
          </div>
        </div>
        {mastered && (
          <motion.span
            className="absolute -top-3 -right-3 text-3xl sm:text-4xl select-none pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            aria-hidden
          >
            ⭐
          </motion.span>
        )}
      </motion.div>

      {phase !== "look" && (
        <div className="flex flex-row items-center justify-center gap-3 sm:gap-6">
          {choices.map((choice, i) => {
            const isWrong = wrongPicks.has(choice.word);
            const isWinner = phase === "done" && choice.word === sign.word;

            return (
              <motion.button
                key={choice.word}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handlePick(choice);
                }}
                onClick={(e) => e.stopPropagation()}
                disabled={isWrong}
                aria-label={choice.word}
                className={`flex items-center justify-center rounded-[1.75rem] bg-white dark:bg-zinc-900 shadow-xl border-4 border-slate-200 dark:border-zinc-700 p-2 sm:p-3 focus:outline-none pointer-events-auto select-none ${
                  isWrong ? "grayscale" : ""
                }`}
                style={{ width: cardSize, height: cardSize }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={
                  isWinner
                    ? { scale: [1, 1.2, 1.1], opacity: 1 }
                    : { scale: 1, opacity: isWrong ? 0.25 : 1 }
                }
                transition={
                  isWinner
                    ? { duration: 0.5 }
                    : { type: "spring", stiffness: 300, damping: 20, delay: isWrong ? 0 : i * 0.06 }
                }
                whileTap={phase === "done" || isWrong ? {} : { scale: 0.92 }}
              >
                <SignPicture sign={choice} />
              </motion.button>
            );
          })}
        </div>
      )}

      <StepPips step={step} />
    </div>
  );
};

const SignsApp = () => {
  usePreventBackExit();
  // Per-word place on the fade ladder (0 = full sign … 6 = lowercase word),
  // and clean reads of the plain lowercase word. Both persist on the device.
  const [steps, setSteps] = useLocalStorage<Record<string, number>>("signSteps", {});
  const [known, setKnown] = useLocalStorage<Record<string, number>>("signKnown", {});
  const { stop, preferredVoice } = useSpeechSynthesis();
  const viewport = useViewport();

  const [deck, setDeck] = useState(() => {
    const bag = buildBag(known);
    return { bag, pos: 1, index: bag[0] };
  });
  const [roundId, setRoundId] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const knownRef = useRef(known);
  knownRef.current = known;

  const currentSign = signWords[deck.index];
  const isMastered = (known[currentSign.word] ?? 0) >= KNOWN_AFTER;

  // Pending auto-advance to the next card after a celebration
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);
  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer]);

  // The right answer plus two others, shuffled — fixed for the whole card
  const choices = useMemo(() => {
    const others = shuffle(signWords.filter((_, i) => i !== deck.index));
    return shuffle([signWords[deck.index], others[0], others[1]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId]);

  const showCard = useCallback(
    (pickNext: (d: typeof deck) => typeof deck) => {
      if (navigator.vibrate) navigator.vibrate(5);
      clearAdvanceTimer();
      stop();
      setIsShuffling(true);
      setTimeout(() => {
        setDeck(pickNext);
        setRoundId((r) => r + 1);
        setIsDone(false);
        setIsShuffling(false);
      }, 150);
    },
    [clearAdvanceTimer, stop],
  );

  // Next card from the shuffle bag; a fresh bag when it runs out
  const handleAdvance = useCallback(() => {
    playCardTransitionChime();
    showCard((d) => {
      if (d.pos < d.bag.length) return { ...d, pos: d.pos + 1, index: d.bag[d.pos] };
      const bag = buildBag(knownRef.current, d.index);
      return { bag, pos: 1, index: bag[0] };
    });
  }, [showCard]);

  const handleAdvanceRef = useRef(handleAdvance);
  handleAdvanceRef.current = handleAdvance;

  // Grown-up controls (swipe / arrows) step through the words in order
  const handleNext = useCallback(() => {
    showCard((d) => ({ ...d, index: (d.index + 1) % signWords.length }));
  }, [showCard]);

  const handlePrevious = useCallback(() => {
    showCard((d) => ({ ...d, index: (d.index - 1 + signWords.length) % signWords.length }));
  }, [showCard]);

  const handleSolved = useCallback(
    ({ step, readPlain }: { step: number; readPlain: boolean }) => {
      const word = currentSign.word;
      setIsDone(true);
      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#FF9F1C", "#a78bfa"],
      });
      setSteps((prev) => ({ ...prev, [word]: step }));
      if (readPlain) {
        setKnown((prev) => ({ ...prev, [word]: (prev[word] ?? 0) + 1 }));
      }
      clearAdvanceTimer();
      advanceTimerRef.current = setTimeout(() => {
        advanceTimerRef.current = null;
        handleAdvanceRef.current();
      }, ADVANCE_MS);
    },
    [currentSign.word, setSteps, setKnown, clearAdvanceTimer],
  );

  // First wrong pick: the word comes back around in a couple of cards
  const handleMiss = useCallback(() => {
    setDeck((d) => {
      const bag = [...d.bag];
      bag.splice(Math.min(d.pos + 2, bag.length), 0, d.index);
      return { ...d, bag };
    });
  }, []);

  // Little palms brush the background while aiming for the pictures —
  // background taps only move on once the card is finished.
  const handleBackgroundTap = useCallback(() => {
    if (isDone) handleAdvance();
  }, [isDone, handleAdvance]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= String(FADE_STEPS)) {
        // Grown-up preview: put this word straight onto step 1–7
        const step = Number(e.key) - 1;
        setSteps((prev) => ({ ...prev, [currentSign.word]: step }));
        showCard((d) => d);
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSign.word, setSteps, showCard, handlePrevious, handleNext, handleAdvance]);

  const lookSize = Math.round(Math.min(viewport.w * 0.78, viewport.h * 0.56, 520));
  const smallSize = Math.round(Math.min(viewport.w * 0.62, viewport.h * 0.4, 400));
  const cardSize = Math.round(Math.max(84, Math.min(viewport.w * 0.27, viewport.h * 0.22, 170)));

  return (
    <div
      className="fixed inset-0 select-none flex flex-col overflow-hidden touchable-area bg-[#FFFDF9] dark:bg-[#000000]"
      onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
      onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
      onTouchEnd={() => swipeHandlers.onTouchEnd()}
      onClick={handleBackgroundTap}
    >
      <header className="absolute top-0 left-0 w-full p-4 z-50 flex items-center justify-between pointer-events-none">
        <TrayMenu currentPageId="signs" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 w-full h-full">
        {!isShuffling && (
          <SignRound
            key={roundId}
            sign={currentSign}
            startStep={steps[currentSign.word] ?? 0}
            choices={choices}
            mastered={isMastered}
            voice={preferredVoice ?? null}
            lookSize={lookSize}
            smallSize={smallSize}
            cardSize={cardSize}
            onSolved={handleSolved}
            onMiss={handleMiss}
          />
        )}
      </main>
    </div>
  );
};

export default SignsApp;
