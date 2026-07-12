import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { getLetterColors } from "../lib/colorUtils";
import { playWrongTapThud, sleep } from "../lib/uiSounds";
import { useAutoFitFont } from "@/hooks/useAutoFitFont";

// Pace of the karaoke-style highlight while the full sentence is read
const WORD_BEAT_MS = 340;

/**
 * READ MODE — finger-point reading, one word at a time.
 *
 * All words start gray with a small bar underneath (the sentence-sized
 * version of the Words page's sound buttons). Only the leftmost unread word
 * glows; tapping it speaks that word and colors it in. Skipping ahead nudges
 * the child back — sentence-level left-to-right tracking is the game.
 * After the last word, the voice reads the whole sentence fluently while the
 * highlight sweeps across.
 *
 * FLUENT MODE — for sentences already read a couple of times: an automatic
 * "read along with me" pass where words light up in time with the voice.
 *
 * Used by the Sentences page and the Stories reader.
 */
export const TapReadSentence = ({
  text,
  voice,
  mode,
  onComplete,
  maxFontPx = 6 * 16,
  minFontPx = 2 * 16,
}: {
  text: string;
  voice: SpeechSynthesisVoice | null;
  mode: "read" | "fluent";
  onComplete: () => void;
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
  const sweepingRef = useRef(false);
  const doneRef = useRef(false);
  const cancelledRef = useRef(false);
  const sweepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useAutoFitFont(sentenceRef, text, maxFontPx, minFontPx);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (sweepIntervalRef.current) clearInterval(sweepIntervalRef.current);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advanceHighlight = () => {
    readRef.current = Math.min(readRef.current + 1, words.length);
    setReadCount(readRef.current);
  };

  // Read the full sentence fluently while the highlight sweeps left→right
  const fluentSweep = async () => {
    sweepingRef.current = true;
    await sleep(mode === "fluent" ? 0 : 450);
    if (cancelledRef.current) return;
    if (readRef.current < words.length) {
      // Fluent mode starts uncolored: light words up on the beat
      sweepIntervalRef.current = setInterval(() => {
        advanceHighlight();
        if (readRef.current >= words.length && sweepIntervalRef.current) {
          clearInterval(sweepIntervalRef.current);
        }
      }, WORD_BEAT_MS);
      advanceHighlight();
    }
    await speak(text, { voice, rate: 0.95 });
    if (cancelledRef.current) return;
    if (sweepIntervalRef.current) clearInterval(sweepIntervalRef.current);
    readRef.current = words.length;
    setReadCount(words.length);
    sweepingRef.current = false;
    doneRef.current = true;
    setIsDone(true);
    onCompleteRef.current();
  };

  // Fluent mode: auto "read along" after a short settling beat
  useEffect(() => {
    if (mode !== "fluent") return;
    const timer = setTimeout(() => {
      if (!cancelledRef.current) fluentSweep();
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const speakSingleWord = (word: string) => {
    stop();
    speak(word.replace(/[.,!?]/g, ""), { voice, rate: 1.0 });
  };

  const handleWordTap = (index: number) => {
    if (doneRef.current) {
      // Finished — tapping any word replays the whole sentence fluently
      stop();
      speak(text, { voice, rate: 1.0 });
      return;
    }
    if (sweepingRef.current || mode === "fluent") return;

    if (index < readRef.current) {
      // Revisiting an already-read word is always allowed
      speakSingleWord(words[index]);
      return;
    }
    if (index > readRef.current) {
      // Skipped ahead — nudge back to the glowing word
      playWrongTapThud();
      setNudge((n) => n + 1);
      return;
    }
    // The correct next word, left to right
    if (navigator.vibrate) navigator.vibrate(8);
    speakSingleWord(words[index]);
    advanceHighlight();
    if (readRef.current === words.length) {
      fluentSweep();
    }
  };

  return (
    <h2
      ref={sentenceRef}
      className="font-bold text-center break-words leading-tight select-none"
    >
      {words.map((word, index) => {
        const colors = getLetterColors(word.charAt(0));
        const isRead = index < readCount;
        const isActive = mode === "read" && !isDone && index === readCount;

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

            {/* Word bar — the sentence-sized version of the sound buttons.
                Outer span replays a one-shot wiggle on wrong-order taps. */}
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
