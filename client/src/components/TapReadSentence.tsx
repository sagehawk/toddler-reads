import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { getLetterColors, getLetterHex } from "../lib/colorUtils";
import { playWrongTapThud, playDotPop } from "../lib/uiSounds";
import { useAutoFitFont } from "@/hooks/useAutoFitFont";

/**
 * Finger-point reading, one word at a time. Every word starts gray with a
 * small bar under it; only the next unread word glows. Tapping it speaks that
 * word and colors it in; skipping ahead nudges the child back — left-to-right
 * tracking is the game.
 *
 * The LAST word is the payoff, Numbers-style: onComplete fires the instant
 * it's tapped (confetti / picture live in the parent), then the whole sentence
 * is read once as the "you read it!" reward, and onAdvance fires only after
 * that read finishes so the parent never cuts it off.
 *
 * Audio uses a depth-1 queue (see speakWord): the current word always finishes,
 * rapid taps collapse to the latest word, so nothing is ever cut mid-syllable
 * and audio never lags more than one word behind the finger.
 *
 * Used by the Sentences page and the Stories reader.
 */
export const TapReadSentence = ({
  text,
  voice,
  onComplete,
  onAdvance,
  bigDots = false,
  maxFontPx = 6 * 16,
  minFontPx = 2 * 16,
}: {
  text: string;
  voice: SpeechSynthesisVoice | null;
  onComplete: () => void;
  onAdvance?: () => void;
  // Big Numbers-style dots as the press target, no wrong-order nudge (used by
  // the Sentences page). Default off = the Stories reader's word-tap style.
  bigDots?: boolean;
  maxFontPx?: number;
  minFontPx?: number;
}) => {
  const words = text.split(" ");
  const [readCount, setReadCount] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [nudge, setNudge] = useState(0);
  const { speak, stop } = useSpeechSynthesis();
  const sentenceRef = useRef<HTMLHeadingElement>(null);
  const readRef = useRef(0);
  const doneRef = useRef(false);
  const cancelledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onAdvanceRef = useRef(onAdvance);

  // Depth-1 speech queue state
  const speakingRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const onDrainRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onAdvanceRef.current = onAdvance;
  }, [onComplete, onAdvance]);

  useAutoFitFont(sentenceRef, text, maxFontPx, minFontPx);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advanceHighlight = () => {
    readRef.current = Math.min(readRef.current + 1, words.length);
    setReadCount(readRef.current);
  };

  // Play `word` now; when it ends, play the most-recent word tapped while it
  // was speaking (rapid taps collapse to the latest — audio never lags more
  // than one word and no word is cut mid-syllable). When the queue fully
  // drains, run any onDrain callback (the closing sentence read).
  const playNow = (word: string, rate: number) => {
    speakingRef.current = true;
    speak(word, {
      voice,
      rate,
      interrupt: false,
      onEnd: () => {
        if (cancelledRef.current) {
          speakingRef.current = false;
          return;
        }
        const next = pendingRef.current;
        pendingRef.current = null;
        if (next != null) {
          playNow(next, 1.0);
        } else {
          speakingRef.current = false;
          const drain = onDrainRef.current;
          onDrainRef.current = null;
          drain?.();
        }
      },
    });
  };

  const speakWord = (word: string) => {
    const w = word.replace(/[.,!?]/g, "");
    if (speakingRef.current) pendingRef.current = w; // will play after the current one
    else playNow(w, 1.0);
  };

  const finishReading = () => {
    // Reward lands the instant the last word is tapped — parent fires
    // confetti + reveals the picture. The full-sentence "you did it!" read
    // waits for the word queue to drain (so the last word is never cut), and
    // only when THAT read ends do we tell the parent it may advance.
    doneRef.current = true;
    setIsDone(true);
    onCompleteRef.current();

    const readWholeSentence = () => {
      if (cancelledRef.current) return;
      speakingRef.current = true;
      speak(text, {
        voice,
        rate: 0.95,
        interrupt: false,
        onEnd: () => {
          speakingRef.current = false;
          if (!cancelledRef.current) onAdvanceRef.current?.();
        },
      });
    };

    if (speakingRef.current) onDrainRef.current = readWholeSentence;
    else readWholeSentence();
  };

  const handleWordTap = (index: number) => {
    if (doneRef.current) {
      // Finished — tap anything to hear the whole sentence again
      speak(text, { voice, rate: 1.0 });
      return;
    }

    if (index < readRef.current) {
      // Revisiting an already-read word is always allowed
      if (bigDots) playDotPop();
      speakWord(words[index]);
      return;
    }
    if (index > readRef.current) {
      // Tapped ahead. In big-dots mode only the next dot is meant to be
      // pressed, so just ignore stray presses (no nudge/thud). In word mode
      // nudge the child back to the glowing word.
      if (!bigDots) {
        playWrongTapThud();
        setNudge((n) => n + 1);
      }
      return;
    }
    // The correct next word/dot, left to right — pop + haptic like Numbers
    if (navigator.vibrate) navigator.vibrate(8);
    if (bigDots) playDotPop();
    speakWord(words[index]);
    advanceHighlight();
    if (readRef.current === words.length) {
      finishReading();
    }
  };

  return (
    <h2
      ref={sentenceRef}
      className="font-bold text-center break-words leading-tight select-none"
    >
      {words.map((word, index) => {
        const colors = getLetterColors(word.charAt(0));
        const wordHex = getLetterHex(word.charAt(0));
        const isRead = index < readCount;
        const isActive = !isDone && index === readCount;

        return (
          <span
            key={index}
            className="relative inline-flex flex-col items-center cursor-pointer pointer-events-auto"
            style={{ margin: "0 0.14em" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              handleWordTap(index);
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.span
              className={`transition-colors duration-200 ${
                isRead ? colors.text : "text-slate-700 dark:text-slate-200"
              }`}
              animate={
                isRead && index === readCount - 1
                  ? { scale: [1, 1.12, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.35 }}
            >
              {word}
            </motion.span>

            {bigDots ? (
              /* Big Numbers-style dot under each word — the thing to press.
                 Inline hex fill paints instantly (the global 1s color
                 transition in index.css would otherwise read as unfilled). */
              <motion.span
                className="block rounded-full"
                style={{
                  width: "0.72em",
                  height: "0.72em",
                  marginTop: "0.18em",
                  backgroundColor: isRead ? wordHex : "rgba(156, 163, 175, 0.12)",
                  border: isActive
                    ? `0.05em dashed ${wordHex}`
                    : isRead
                    ? "0.05em solid transparent"
                    : "0.05em solid rgba(156, 163, 175, 0.35)",
                  boxShadow: isRead ? `0 0.03em 0.12em ${wordHex}77` : "none",
                  transition: "background-color 150ms ease-out, border-color 150ms ease-out",
                }}
                animate={isActive ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                transition={
                  isActive
                    ? { repeat: Infinity, duration: 1.1, ease: "easeInOut" }
                    : { duration: 0.2 }
                }
              />
            ) : (
              /* Thin word bar (Stories reader). Outer span replays a one-shot
                 wiggle on wrong-order taps. */
              <motion.span
                key={`wiggle-${nudge}`}
                className="block w-full"
                initial={false}
                animate={
                  isActive && nudge > 0
                    ? { x: [0, "-0.07em", "0.07em", "-0.045em", "0.045em", 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.4 }}
              >
                <motion.span
                  className={`block rounded-full ${
                    isRead ? colors.background : isActive ? colors.background : ""
                  }`}
                  style={{
                    height: "0.09em",
                    marginTop: "0.1em",
                    backgroundColor: isRead || isActive ? undefined : "rgba(156, 163, 175, 0.25)",
                    transition: "background-color 120ms ease-out",
                  }}
                  animate={
                    isActive
                      ? { opacity: [0.35, 1, 0.35], scaleY: [1, 1.4, 1] }
                      : { opacity: 1, scaleY: 1 }
                  }
                  transition={
                    isActive
                      ? { repeat: Infinity, duration: 1.1, ease: "easeInOut" }
                      : { duration: 0.2 }
                  }
                />
              </motion.span>
            )}

            {/* Bouncing finger on the very first word */}
            {isActive && readCount === 0 && (
              <motion.span
                className="absolute top-full pointer-events-none select-none"
                style={{ fontSize: "0.55em", marginTop: "0.1em" }}
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
  );
};
