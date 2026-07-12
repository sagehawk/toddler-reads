import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import confetti from 'canvas-confetti';
import { getLetterColors } from '../lib/colorUtils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useSwipe } from '@/hooks/useSwipe';
import { motion } from 'framer-motion';
import { TrayMenu } from '@/components/TrayMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getSharedAudioContext } from '../lib/sharedAudioContext';
import { playWrongTapThud, randomPraise } from '../lib/uiSounds';

// ----- Real-time Bubbly Sound Synthesis for Tactile Toddler Interactions -----
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

// Interfaces are now imported from data file or defined there, but we need to import or redefine if not exported.
import { learningModules } from '../data/phonicsDecks';

// We need to update the local interface definition to match the data file we just edited
export interface PhonicsLetter {
  letter: string;
  sound: string;
  phoneticText: string;
}

export interface LearningModule {
  id: string;
  name: string;
  type: 'letters' | 'cvc';
  letters?: PhonicsLetter[];
}

// After this many full listens, a letter starts appearing as a
// "find the sound" quiz round instead of a plain flashcard.
// One listen is enough — the quiz IS the fun part.
const QUIZ_THRESHOLD = 1;
// Even known letters still get an occasional plain listen.
const QUIZ_CHANCE = 0.75;

/**
 * "FIND THE SOUND" — sound→symbol recognition, the skill that feeds directly
 * into decoding words. The voice plays a phonic sound; three big letter cards
 * appear; the child taps the letter that makes it. Wrong picks thud, dim, and
 * replay the sound — unlimited tries, no fail state. The right pick
 * celebrates and moves on.
 */
const LetterQuiz = ({
  target,
  choices,
  voice,
  onSolved,
}: {
  target: PhonicsLetter;
  choices: PhonicsLetter[];
  voice: SpeechSynthesisVoice | null;
  onSolved: () => void;
}) => {
  const [wrongPicks, setWrongPicks] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState(false);
  const [lastWrong, setLastWrong] = useState<string | null>(null);
  const [nudge, setNudge] = useState(0);
  const { speak, stop } = useSpeechSynthesis();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const solvedRef = useRef(false);
  const cancelledRef = useRef(false);

  const playTargetSound = useCallback(() => {
    try {
      audioRef.current?.pause();
    } catch (e) {}
    const audio = new Audio(target.sound);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, [target.sound]);

  useEffect(() => {
    const timer = setTimeout(playTargetSound, 600);
    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
      try {
        audioRef.current?.pause();
      } catch (e) {}
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = (choice: PhonicsLetter) => {
    if (solvedRef.current) return;

    if (choice.letter === target.letter) {
      solvedRef.current = true;
      setSolved(true);
      if (navigator.vibrate) navigator.vibrate(15);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#a78bfa'],
      });
      stop();
      speak(randomPraise(), { voice });
      setTimeout(() => {
        if (!cancelledRef.current) onSolved();
      }, 1600);
    } else {
      if (wrongPicks.has(choice.letter)) return;
      playWrongTapThud();
      setWrongPicks((prev) => new Set(prev).add(choice.letter));
      setLastWrong(choice.letter);
      setNudge((n) => n + 1);
      // Replay the target sound so the child can try again with fresh ears
      setTimeout(() => {
        if (!cancelledRef.current) playTargetSound();
      }, 450);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-10 sm:gap-14 w-full px-4">
      {/* Big replay speaker — tap to hear the sound again */}
      <motion.button
        onPointerDown={(e) => {
          e.stopPropagation();
          playTargetSound();
        }}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center justify-center gap-2 focus:outline-none pointer-events-auto"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="text-7xl sm:text-8xl select-none drop-shadow-md" aria-hidden>
          🔊
        </span>
        <span className="text-sm sm:text-base font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 select-none">
          Find the sound!
        </span>
      </motion.button>

      {/* The letter choices */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-6 sm:gap-10">
        {choices.map((choice) => {
          const colors = getLetterColors(choice.letter);
          const isWrong = wrongPicks.has(choice.letter);
          const isWinner = solved && choice.letter === target.letter;

          return (
            <motion.button
              key={`${choice.letter}-${lastWrong === choice.letter ? nudge : 0}`}
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePick(choice);
              }}
              onClick={(e) => e.stopPropagation()}
              disabled={isWrong}
              className={`flex items-baseline justify-center w-32 h-32 sm:w-44 sm:h-44 rounded-[2rem] bg-white dark:bg-zinc-900 shadow-xl border-4 focus:outline-none pointer-events-auto select-none ${colors.text} ${
                isWrong ? 'opacity-25 grayscale' : ''
              }`}
              style={{
                borderColor: 'currentColor',
                transition: 'opacity 250ms ease-out, filter 250ms ease-out',
              }}
              initial={lastWrong === choice.letter ? { x: 0 } : { scale: 0.6, opacity: 0 }}
              animate={
                isWinner
                  ? { scale: [1, 1.25, 1.15], opacity: 1 }
                  : lastWrong === choice.letter
                  ? { x: [0, -10, 10, -6, 6, 0], scale: 1, opacity: 1 }
                  : { scale: 1, opacity: 1 }
              }
              transition={
                isWinner
                  ? { duration: 0.5 }
                  : lastWrong === choice.letter
                  ? { duration: 0.4 }
                  : { type: 'spring', stiffness: 300, damping: 20 }
              }
              whileTap={solved || isWrong ? {} : { scale: 0.92 }}
            >
              <span className={`font-black leading-none ${colors.text}`} style={{ fontSize: 'clamp(3.5rem, 12vmin, 6rem)', fontFamily: "'Nunito', sans-serif" }}>
                {choice.letter}
              </span>
              <span className={`font-black leading-none ${colors.text}`} style={{ fontSize: 'clamp(2.6rem, 9vmin, 4.5rem)', fontFamily: "'Nunito', sans-serif" }}>
                {choice.letter.toLowerCase()}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

import { usePreventBackExit } from '@/hooks/usePreventBackExit';

export default function PhonicsApp() {
  usePreventBackExit();

  const [, navigate] = useLocation();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const { speak, stop, preferredVoice } = useSpeechSynthesis();
  const [isAutoplayEnabled] = useLocalStorage('phonicsAutoplay', true);
  const [isPulsing, setIsPulsing] = useState(false);
  const [soundToggle, setSoundToggle] = useState<'phonic' | 'name'>('phonic');

  // Per-letter progress, persisted on the device: how many times each letter
  // has been fully heard (sound + name). Drives "find the sound" quiz rounds.
  const [letterMastery, setLetterMastery] = useLocalStorage<Record<string, number>>(
    'letterMastery',
    {},
  );
  // Guards double-counting a letter's listen within one card view
  const listenCountedRef = useRef(false);

  // The learn card is a two-dot game: hear the SOUND, hear the NAME —
  // both heard (by narration or by taps) → confetti + praise + auto-advance.
  // Refs are the source of truth (state only drives the dot visuals):
  // celebrating from an effect that watched the state raced the per-card
  // reset — the new card's effect pass saw the OLD card's true/true flags
  // with a cleared guard and celebrated instantly, machine-gunning through
  // every card ("phonics keeps skipping everything").
  const [heardSound, setHeardSound] = useState(false);
  const [heardName, setHeardName] = useState(false);
  const heardSoundRef = useRef(false);
  const heardNameRef = useRef(false);
  const celebratedRef = useRef(false);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Assigned below once advanceToNextCard exists; declared early so the
  // celebration path can be defined before the handlers that use it.
  const advanceToNextCardRef = useRef<() => void>(() => {});
  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  // Latest card index, for guarding async continuations that outlive a card
  const currentIndexRef = useRef<number | null>(currentIndex);
  currentIndexRef.current = currentIndex;

  // Always reset the card's progress when entering a new letter
  useEffect(() => {
    setSoundToggle('phonic');
    listenCountedRef.current = false;
    heardSoundRef.current = false;
    heardNameRef.current = false;
    setHeardSound(false);
    setHeardName(false);
    celebratedRef.current = false;
  }, [currentIndex]);

  const markLetterHeard = useCallback((letter: string) => {
    if (listenCountedRef.current) return;
    listenCountedRef.current = true;
    setLetterMastery((prev) => ({ ...prev, [letter]: (prev[letter] ?? 0) + 1 }));
  }, [setLetterMastery]);

  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isSoundPlayingRef = useRef(false);

  // Each new letter (or a manual tap) bumps the token, which silently cancels
  // any in-flight autoplay narration without tearing down fresh audio.
  const sequenceTokenRef = useRef(0);

  // True while a letter's sound+name narration is playing — background taps
  // must not skip the letter mid-listen (little palms brush the screen).
  const isNarratingRef = useRef(false);

  // Latest voice without retriggering the narration effect when voices load
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  voiceRef.current = preferredVoice ?? null;

  // Marking a dot heard and celebrating happen in ONE synchronous call path —
  // never via an effect watching the heard state (see the race note above).
  const markPartHeard = useCallback((part: 'sound' | 'name', letterInfo: PhonicsLetter) => {
    if (part === 'sound') {
      heardSoundRef.current = true;
      setHeardSound(true);
    } else {
      heardNameRef.current = true;
      setHeardName(true);
    }
    if (!heardSoundRef.current || !heardNameRef.current || celebratedRef.current) return;

    // Both dots filled — the card's job is done: celebrate Numbers-style
    // and move on by itself (no reason to linger, no dead end).
    celebratedRef.current = true;
    isNarratingRef.current = false;
    markLetterHeard(letterInfo.letter);
    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#a78bfa'],
    });
    speak(randomPraise(), { voice: voiceRef.current });
    clearAdvanceTimer();
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      advanceToNextCardRef.current();
    }, 1800);
  }, [markLetterHeard, speak, clearAdvanceTimer]);

  const selectedModule = learningModules[0];

  // Decide once per card whether this letter appears as a plain flashcard or
  // a "find the sound" quiz (known letters quiz 75% of the time).
  const quizData = useMemo(() => {
    if (currentIndex === null) return null;
    const letters = selectedModule.letters;
    if (!letters || letters.length < 3) return null;
    const target = letters[currentIndex];
    if (!target) return null;
    const mastery = letterMastery[target.letter] ?? 0;
    if (mastery < QUIZ_THRESHOLD || Math.random() >= QUIZ_CHANCE) return null;

    // Two distractor letters, then shuffle the three choices
    const others = letters.filter((_, i) => i !== currentIndex);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    const choices = [target, others[0], others[1]];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return { target, choices };
    // Intentionally keyed to the card only — mode must not flip mid-card
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const stopAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const stopAllSounds = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stop(); // Stop TTS
    stopAllTimers();
    isSoundPlayingRef.current = false;
    setIsPulsing(false);
  }, [stop, stopAllTimers]);

  const handleLetterClick = useCallback((index: number) => {
    clearAdvanceTimer();
    stopAllSounds();

    const letterInfo = selectedModule.letters?.[index];
    if (!letterInfo) return;

    setCurrentIndex(index);
  }, [selectedModule.letters, stopAllSounds, clearAdvanceTimer]);

  const shuffleLetters = useCallback(() => {
    const indices = selectedModule.letters?.map((_, i) => i) || [];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    if (indices[0] === currentIndex && indices.length > 1) {
      const secondElement = indices[1];
      indices[1] = indices[0];
      indices[0] = secondElement;
    }

    setShuffledIndices(indices);
    setShuffledIndex(0);
    if (indices.length > 0) {
      handleLetterClick(indices[0]);
    }
  }, [currentIndex, selectedModule.letters, handleLetterClick]);

  useEffect(() => {
    shuffleLetters();
    return () => {
      stopAllSounds();
    };
  }, []);

  const playSoundOnce = useCallback(async (soundFile: string) => {
    if (isSoundPlayingRef.current) return;
    isSoundPlayingRef.current = true;
    setIsPulsing(true);
    return new Promise<void>(resolve => {
      audioRef.current.src = soundFile;
      audioRef.current.onended = () => {
        isSoundPlayingRef.current = false;
        setIsPulsing(false);
        resolve();
      };
      audioRef.current.onerror = () => {
        isSoundPlayingRef.current = false;
        setIsPulsing(false);
        resolve();
      };
      audioRef.current.play().catch(() => {
        isSoundPlayingRef.current = false;
        setIsPulsing(false);
        resolve();
      });
    });
  }, []);

  const replaySound = useCallback(async (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    if (isPulsing) return; // Block taps while the letter is still enlarged from the previous sound
    if (currentIndex === null) return;
    const letterInfo = selectedModule.letters?.[currentIndex];
    if (!letterInfo) return;
    const cardIndex = currentIndex;
    // Bail if the card changed while our audio was playing — a stale
    // continuation must never mark dots (or celebrate) on the next card
    const cardChanged = () => currentIndexRef.current !== cardIndex;

    sequenceTokenRef.current++; // Cancel any pending autoplay narration
    // The child took over — the narration gate must never stay stuck closed
    isNarratingRef.current = false;
    stopAllSounds();

    if (soundToggle === 'phonic') {
      // Tap 1: Play phonic MP3 sound, and animate a pulse
      setIsPulsing(true);
      await playSoundOnce(letterInfo.sound);
      setIsPulsing(false);
      if (cardChanged()) return;
      setSoundToggle('name'); // Toggle to TTS letter name next
      markPartHeard('sound', letterInfo);
    } else {
      // Tap 2: Speak TTS letter name, and animate a pulse
      const textToSpeak = letterInfo.letter.toUpperCase() === 'Z' ? 'Zee' : letterInfo.letter;
      setIsPulsing(true);
      await speak(textToSpeak, {
        voice: voiceRef.current,
        rate: 1.0,
        onEnd: () => setIsPulsing(false)
      });
      setIsPulsing(false);
      if (cardChanged()) return;
      setSoundToggle('phonic'); // Toggle back to phonic sound next
      markPartHeard('name', letterInfo);
    }
  }, [currentIndex, selectedModule.letters, playSoundOnce, stopAllSounds, speak, soundToggle, isPulsing, markPartHeard]);

  // Autoplay narration: when a new letter appears, give the child a moment to
  // recognize it (and say it themselves), then play the phonic sound, pause,
  // and finally speak the letter name. Quiz rounds narrate nothing — the
  // sound IS the question.
  useEffect(() => {
    if (currentIndex === null || !isAutoplayEnabled || quizData) {
      return;
    }

    const letterInfo = selectedModule.letters?.[currentIndex];
    if (!letterInfo) return;

    const token = ++sequenceTokenRef.current;
    const isLive = () => sequenceTokenRef.current === token;

    const runSequence = async () => {
      // Letter fade-in (~400ms) plus a recognition beat before any sound
      await new Promise(r => setTimeout(r, 1400));
      if (!isLive()) return;

      // 1. Play the phonic MP3 first
      await playSoundOnce(letterInfo.sound);
      if (!isLive()) return;
      markPartHeard('sound', letterInfo);
      setSoundToggle('name'); // A letter tap now continues where narration got to

      // 2. Brief pause so the sound and the name read as two separate ideas
      await new Promise(r => setTimeout(r, 1600));
      if (!isLive()) return;

      // 3. Speak the TTS letter name second
      const textToSpeak = letterInfo.letter.toUpperCase() === 'Z' ? 'Zee' : letterInfo.letter;
      setIsPulsing(true);
      await speak(textToSpeak, {
        voice: voiceRef.current,
        rate: 1.0,
        onEnd: () => setIsPulsing(false)
      });
      setIsPulsing(false);
      if (!isLive()) return;
      markPartHeard('name', letterInfo); // Both parts heard → celebration fires inside
    };

    isNarratingRef.current = true;
    runSequence().finally(() => {
      // Token check: don't let a stale, cancelled run unlock the next card's narration
      if (isLive()) {
        isNarratingRef.current = false;
      }
    });

    return () => {
      // Invalidate this run and silence anything it left playing. The gate
      // must reset here too — a cancelled run's token check above would
      // otherwise leave it stuck closed forever (the "page never advances"
      // bug when a child tapped the letter mid-narration).
      if (sequenceTokenRef.current === token) {
        sequenceTokenRef.current++;
      }
      isNarratingRef.current = false;
      stopAllSounds();
    };
  }, [currentIndex, isAutoplayEnabled, quizData, selectedModule.letters, playSoundOnce, speak, stopAllSounds, markPartHeard]);


  const advanceToNextCard = useCallback(() => {
    clearAdvanceTimer();
    stopAllSounds();
    playCardTransitionChime();

    setTimeout(() => {
      if (shuffledIndex >= shuffledIndices.length - 1) {
        shuffleLetters();
      } else {
        const nextShuffledIndex = shuffledIndex + 1;
        setShuffledIndex(nextShuffledIndex);
        handleLetterClick(shuffledIndices[nextShuffledIndex]);
      }
    }, 150);
  }, [shuffledIndex, shuffledIndices, shuffleLetters, handleLetterClick, stopAllSounds, clearAdvanceTimer]);

  // The auto-advance timer must always fire the freshest advance
  advanceToNextCardRef.current = advanceToNextCard;

  // Never leave a stray auto-advance behind on unmount
  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer]);

  const handleShuffle = useCallback(() => {
    // During a quiz, stray background taps must not skip the question —
    // parents can still swipe or use the arrow keys to move on.
    if (quizData) return;
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
    advanceToNextCard();
  }, [quizData, advanceToNextCard]);

  const handleQuizSolved = useCallback(() => {
    if (quizData) {
      setLetterMastery((prev) => ({
        ...prev,
        [quizData.target.letter]: (prev[quizData.target.letter] ?? 0) + 1,
      }));
    }
    advanceToNextCard();
  }, [quizData, setLetterMastery, advanceToNextCard]);

  const handleNext = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    if (currentIndex === null) return;
    const nextIndex = (currentIndex + 1) % (selectedModule.letters?.length || 1);
    handleLetterClick(nextIndex);
  }, [currentIndex, selectedModule.letters, handleLetterClick]);

  const handlePrevious = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    if (currentIndex === null) return;
    const prevIndex = (currentIndex - 1 + (selectedModule.letters?.length || 1)) % (selectedModule.letters?.length || 1);
    handleLetterClick(prevIndex);
  }, [currentIndex, selectedModule.letters, handleLetterClick]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });

  const handleInteraction = () => {
    // Card's job isn't done until the narration has played out — stray palm
    // taps on the background must not skip the letter mid-listen.
    if (isNarratingRef.current) return;
    handleShuffle();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleShuffle();
      } else if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        const letterIndex = selectedModule.letters?.findIndex(l => l.letter.toLowerCase() === e.key.toLowerCase());
        if (letterIndex !== undefined && letterIndex !== -1) {
          handleLetterClick(letterIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, handlePrevious, handleNext, handleShuffle, handleLetterClick, selectedModule.letters, navigate]);


  if (!selectedModule) {
    return <div>Error: Letter module not found.</div>;
  }

  const currentDisplayData = currentIndex !== null ? selectedModule.letters?.[currentIndex] : null;

  return (
    <div
      className="fixed inset-0 select-none flex flex-col overflow-hidden touchable-area bg-[#FFFDF9] dark:bg-[#000000]"
      onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
      onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
      onTouchEnd={(e) => swipeHandlers.onTouchEnd()}
      onClick={handleInteraction}
    >
      <header className="absolute top-0 left-0 w-full p-4 z-50 flex items-center justify-between pointer-events-none">
        <TrayMenu currentPageId="phonics" />

        {/* Rainbow Pop-It progress tracker */}
        <div className="flex-1 mx-4 max-w-[280px] flex items-center justify-center pointer-events-auto">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {shuffledIndices.map((letterIdx, idx) => {
              const isCompleted = idx < shuffledIndex;
              const isCurrent = idx === shuffledIndex;
              
              // Generate a cute rainbow color based on the index
              const hue = (idx * 360 / Math.max(shuffledIndices.length, 1)) % 360;
              
              return (
                <motion.div
                  key={idx}
                  className="w-3.5 h-3.5 rounded-full border shadow-sm relative flex items-center justify-center"
                  style={{
                    borderColor: isCompleted 
                      ? `hsl(${hue}, 70%, 45%)` 
                      : isCurrent 
                      ? `hsl(${hue}, 80%, 50%)` 
                      : 'rgba(156, 163, 175, 0.3)',
                    backgroundColor: isCompleted
                      ? `hsl(${hue}, 65%, 55%)`
                      : isCurrent
                      ? `hsl(${hue}, 80%, 65%)`
                      : 'rgba(156, 163, 175, 0.1)',
                  }}
                  animate={
                    isCurrent 
                      ? { scale: [1, 1.3, 1.25], boxShadow: `0 0 10px hsl(${hue}, 80%, 60%)` } 
                      : isCompleted 
                      ? { scale: [1, 1.15, 1], opacity: 1 } 
                      : { scale: 1, opacity: 0.4 }
                  }
                  transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                />
              );
            })}
          </div>
        </div>

        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center relative overflow-hidden w-full">
        <main className="flex flex-col items-center justify-center w-full h-full">
          {/* Keyed remount with enter-only animation. Deliberately NOT
              AnimatePresence mode="wait": this page re-renders mid-transition
              (narration state), which interrupted the exit animation and left
              orphaned cards wedged at opacity 0, freezing the whole page. */}
          {currentIndex !== null && currentDisplayData && (
              <motion.div
                key={`${currentIndex}-${quizData ? 'quiz' : 'learn'}`}
                className="w-full flex justify-center items-center"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {quizData ? (
                  <LetterQuiz
                    target={quizData.target}
                    choices={quizData.choices}
                    voice={preferredVoice ?? null}
                    onSolved={handleQuizSolved}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-6 sm:gap-8" style={{ width: 'clamp(300px, 85vmin, 550px)', height: 'clamp(300px, 85vmin, 550px)' }}>
                    <motion.h2
                      onPointerDown={replaySound}
                      onClick={(e) => e.stopPropagation()}
                      className={`font-black cursor-pointer pointer-events-auto select-none flex items-baseline ${
                        isPulsing ? '' : 'animate-breathe'
                      } ${getLetterColors(currentDisplayData.letter).text}`}
                      animate={isPulsing ? { scale: 1.25 } : { scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        fontSize: 'clamp(9rem, 40vmin, 16rem)',
                        fontFamily: "'Nunito', sans-serif",
                        textShadow: '2px 4px 8px rgba(0,0,0,0.08)',
                        lineHeight: 1,
                      }}
                    >
                      {currentDisplayData.letter}
                      {/* Lowercase companion — the shape the child meets in real words */}
                      <span style={{ fontSize: '0.72em', marginLeft: '0.08em' }}>
                        {currentDisplayData.letter.toLowerCase()}
                      </span>
                    </motion.h2>

                    {/* Two sound buttons, same language as the Numbers dots:
                        fill the SOUND dot, then the NAME dot, and the card
                        celebrates + moves on by itself */}
                    <div className="flex items-center justify-center gap-8 sm:gap-10 pointer-events-auto">
                      {([['sound', heardSound], ['name', heardName]] as const).map(([part, filled]) => {
                        const isNext = !filled && (part === 'sound' || heardSound);
                        const colors = getLetterColors(currentDisplayData.letter);
                        return (
                          <motion.button
                            key={part}
                            aria-label={part === 'sound' ? "Hear the letter's sound" : "Hear the letter's name"}
                            onPointerDown={(e) => replaySound(e)}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full focus:outline-none ${
                              filled ? colors.background : isNext ? colors.text : ''
                            }`}
                            style={{
                              border: isNext
                                ? '3px dashed currentColor'
                                : filled
                                ? '3px solid transparent'
                                : '3px solid rgba(156, 163, 175, 0.35)',
                              backgroundColor: filled ? undefined : 'rgba(156, 163, 175, 0.12)',
                              transition: 'background-color 150ms ease-out, border-color 150ms ease-out',
                            }}
                            animate={isNext ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                            transition={
                              isNext
                                ? { repeat: Infinity, duration: 1.1, ease: 'easeInOut' }
                                : { duration: 0.2 }
                            }
                            whileTap={{ scale: 0.85 }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
        </main>
      </div>
    </div>
  );
}