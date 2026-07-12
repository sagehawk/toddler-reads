import { useState, useEffect, useCallback, useRef } from 'react';
import { TrayMenu } from '@/components/TrayMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { numbersData } from '../data/numbersData';
import { getLetterColors } from '../lib/colorUtils';
import confetti from 'canvas-confetti';
import { useSwipe } from '@/hooks/useSwipe';
import { motion, AnimatePresence } from 'framer-motion';

import { getSharedAudioContext as getAudioCtx } from '../lib/sharedAudioContext';

// ----- Real-time Bubbly Sound Synthesis for Tactile Toddler Interactions -----
const playVocabTapPop = () => {
  const ctx = getAudioCtx();
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
  const ctx = getAudioCtx();
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

const playDotPop = () => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
};

// Actual CSS color values for dots (Tailwind classes don't work in inline styles)
const dotColors: { [key: number]: string } = {
  1: '#f87171', // red-400
  2: '#60a5fa', // blue-400
  3: '#facc15', // yellow-400
  4: '#22d3ee', // cyan-400
  5: '#a78bfa', // purple-400
  6: '#a3e635', // lime-400
  7: '#38bdf8', // sky-400
  8: '#f472b6', // pink-400
  9: '#4ade80', // green-400
  10: '#8b5cf6', // violet-400
};

const Dot = ({
  color,
  visible,
  onPop,
  sizeClass,
}: {
  color: string;
  visible: boolean;
  onPop: () => void;
  sizeClass: string;
}) => (
  // Outer wrapper adds an invisible tap halo so near-miss taps still land,
  // and fires on pointer-down: the instant the finger touches, before the
  // press animation can shrink the dot out from under an edge tap, and
  // immune to the finger slop that cancels synthetic click events.
  <motion.div
    onPointerDown={(e) => {
      e.stopPropagation();
      onPop();
    }}
    onClick={(e) => e.stopPropagation()}
    className="p-3 sm:p-4 -m-3 sm:-m-4 rounded-full cursor-pointer pointer-events-auto"
    style={{ touchAction: 'none' }}
    whileTap={{ scale: 0.9 }}
  >
    <motion.div
      className={`${sizeClass} rounded-full flex items-center justify-center relative`}
      style={{
        backgroundColor: visible ? color : 'rgba(156, 163, 175, 0.1)',
        border: `4px dashed ${visible ? 'transparent' : color}`,
        boxShadow: visible ? `0 4px 12px ${color}55` : 'none',
        // Beat the global 1s theme transition so the fill lands instantly.
        transition:
          'background-color 120ms ease-out, border-color 120ms ease-out, box-shadow 120ms ease-out',
      }}
      animate={{
        scale: visible ? [0.8, 1.25, 1.2] : 1,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 10 }}
    />
  </motion.div>
);

const DieFace = ({
  count,
  color,
  poppedSet,
  onPopCircle,
}: {
  count: number;
  color: string;
  poppedSet: Set<number>;
  onPopCircle: (index: number) => void;
}) => {
  // Dynamically size dots based on count to utilize screen space fully
  const getDotSizeClass = (num: number) => {
    if (num <= 4) {
      return "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28";
    }
    if (num <= 7) {
      return "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24";
    }
    // High numbers (8, 9, 10) get w-14 (56px) on mobile which is very large and super easy to tap!
    return "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20";
  };

  // Adjust gap sizes based on dot density to maximize mathematical spacing
  const getGapClass = (num: number) => {
    if (num <= 3) return "gap-8 sm:gap-12";
    if (num <= 6) return "gap-6 sm:gap-10";
    return "gap-4 sm:gap-6";
  };

  const sizeClass = getDotSizeClass(count);
  const gapClass = getGapClass(count);

  const renderDot = (index: number) => (
    <Dot
      key={index}
      color={color}
      visible={poppedSet.has(index)}
      onPop={() => onPopCircle(index)}
      sizeClass={sizeClass}
    />
  );

  const patterns: { [key: number]: React.ReactNode } = {
    1: (
      <div className="flex justify-center items-center w-full h-full">
        {renderDot(1)}
      </div>
    ),
    2: (
      <div className={`grid grid-cols-2 grid-rows-2 ${gapClass} w-full h-full p-4 place-items-center`}>
        <div className="col-start-1 row-start-1">{renderDot(1)}</div>
        <div className="col-start-2 row-start-2">{renderDot(2)}</div>
      </div>
    ),
    3: (
      <div className={`grid grid-cols-3 grid-rows-3 ${gapClass} w-full h-full p-4 place-items-center`}>
        <div className="col-start-1 row-start-1">{renderDot(1)}</div>
        <div className="col-start-2 row-start-2">{renderDot(2)}</div>
        <div className="col-start-3 row-start-3">{renderDot(3)}</div>
      </div>
    ),
    4: (
      <div className={`grid grid-cols-2 grid-rows-2 ${gapClass} w-full h-full p-4 place-items-center`}>
        {renderDot(1)}
        {renderDot(2)}
        {renderDot(3)}
        {renderDot(4)}
      </div>
    ),
    5: (
      <div className={`grid grid-cols-3 grid-rows-3 ${gapClass} w-full h-full p-4 place-items-center`}>
        <div className="col-start-1 row-start-1">{renderDot(1)}</div>
        <div className="col-start-3 row-start-1">{renderDot(2)}</div>
        <div className="col-start-2 row-start-2">{renderDot(3)}</div>
        <div className="col-start-1 row-start-3">{renderDot(4)}</div>
        <div className="col-start-3 row-start-3">{renderDot(5)}</div>
      </div>
    ),
    6: (
      <div className={`grid grid-cols-2 grid-rows-3 ${gapClass} w-full h-full p-4 place-items-center`}>
        {renderDot(1)}
        {renderDot(2)}
        {renderDot(3)}
        {renderDot(4)}
        {renderDot(5)}
        {renderDot(6)}
      </div>
    ),
    7: (
      <div className={`grid grid-cols-3 grid-rows-3 ${gapClass} w-full h-full p-4 place-items-center`}>
        <div className="col-start-1 row-start-1">{renderDot(1)}</div>
        <div className="col-start-3 row-start-1">{renderDot(2)}</div>
        <div className="col-start-2 row-start-2">{renderDot(3)}</div>
        <div className="col-start-1 row-start-3">{renderDot(4)}</div>
        <div className="col-start-3 row-start-3">{renderDot(5)}</div>
        <div className="col-start-2 row-start-1">{renderDot(6)}</div>
        <div className="col-start-2 row-start-3">{renderDot(7)}</div>
      </div>
    ),
    8: (
      <div className={`grid grid-cols-2 grid-rows-4 ${gapClass} w-full h-full p-4 place-items-center`}>
        {renderDot(1)}
        {renderDot(2)}
        {renderDot(3)}
        {renderDot(4)}
        {renderDot(5)}
        {renderDot(6)}
        {renderDot(7)}
        {renderDot(8)}
      </div>
    ),
    9: (
      <div className={`grid grid-cols-3 grid-rows-3 ${gapClass} w-full h-full p-4 place-items-center`}>
        {renderDot(1)}
        {renderDot(2)}
        {renderDot(3)}
        {renderDot(4)}
        {renderDot(5)}
        {renderDot(6)}
        {renderDot(7)}
        {renderDot(8)}
        {renderDot(9)}
      </div>
    ),
    10: (
      <div className={`grid grid-cols-2 grid-rows-5 ${gapClass} w-full h-full p-4 place-items-center`}>
        {renderDot(1)}
        {renderDot(2)}
        {renderDot(3)}
        {renderDot(4)}
        {renderDot(5)}
        {renderDot(6)}
        {renderDot(7)}
        {renderDot(8)}
        {renderDot(9)}
        {renderDot(10)}
      </div>
    ),
  };
  return (
    <div className="w-full h-full p-4 sm:p-8 flex justify-center items-center">
      {patterns[count]}
    </div>
  );
};

// Component to handle interactive counting popping game
const AnimatedDots = ({ count, color, onComplete, voice }: { count: number, color: string, onComplete: () => void, voice: SpeechSynthesisVoice | null }) => {
  const [poppedSet, setPoppedSet] = useState<Set<number>>(new Set());
  const { speak, stop } = useSpeechSynthesis();

  const handlePopCircle = useCallback((index: number) => {
    if (poppedSet.has(index)) return; // Already popped

    // Play a satisfying pop sound using shared AudioContext
    playDotPop();
    if (navigator.vibrate) navigator.vibrate(8);

    const newSet = new Set(poppedSet);
    newSet.add(index);
    setPoppedSet(newSet);

    // Speak the next incremental number
    const currentPopCount = newSet.size;
    stop();
    speak(currentPopCount.toString(), { voice, rate: 1.0 });

    if (currentPopCount === count) {
      // All popped! Small delay, then trigger success
      setTimeout(() => {
        onComplete();
      }, 600);
    }
  }, [poppedSet, count, voice, speak, stop, onComplete]);

  return <DieFace count={count} color={color} poppedSet={poppedSet} onPopCircle={handlePopCircle} />;
};

import { usePreventBackExit } from '@/hooks/usePreventBackExit';

// Short, rotating praise lines spoken when the child finishes counting a number.
const PRAISE_LINES = ['Great job!', 'Hooray!', 'You did it!', 'Amazing!', 'Well done!'];

const NumbersApp = () => {
  usePreventBackExit();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const { speak, stop, preferredVoice } = useSpeechSynthesis();

  const currentNumber = numbersData[currentIndex];

  // Mirror of currentIndex so async handlers can tell if the card changed under them
  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const shuffleItems = useCallback((shouldSetFirst = false) => {
    const indices = numbersData.map((_, i) => i);
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
  }, []);

  useEffect(() => {
    shuffleItems(true);
  }, [shuffleItems]);

  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    stop();
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % numbersData.length);
  }, [stop]);

  const handlePrevious = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    stop();
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + numbersData.length) % numbersData.length);
  }, [stop]);

  // Advance to the next number in the shuffle bag, re-shuffling a fresh bag
  // (never repeating the current number back-to-back) when it runs out.
  const advanceShuffled = useCallback(() => {
    if (shuffledIndex >= shuffledIndices.length) {
      const indices = numbersData.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      if (indices[0] === currentIndex && indices.length > 1) {
        [indices[0], indices[1]] = [indices[1], indices[0]];
      }
      setShuffledIndices(indices);
      setCurrentIndex(indices[0]);
      setShuffledIndex(1);
    } else {
      setCurrentIndex(shuffledIndices[shuffledIndex]);
      setShuffledIndex(shuffledIndex + 1);
    }
  }, [shuffledIndex, shuffledIndices, currentIndex]);

  const handleShuffle = useCallback(() => {
    if (isFlipped) return; // Safeguard: Prevent background misclicks from shuffling the card while the board is flipped open!
    if (navigator.vibrate) navigator.vibrate(10);
    stop();
    playCardTransitionChime();
    setIsFlipped(false);
    advanceShuffled();
  }, [isFlipped, stop, advanceShuffled]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    // While the counting board is open, sloppy dot-taps must never turn the page.
    // Parents can still switch via the menu or keyboard.
    enabled: !isFlipped,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        const number = parseInt(e.key, 10);
        const index = numbersData.indexOf(number === 0 ? 10 : number);
        if (index !== -1) {
          stop();
          setIsFlipped(false);
          setCurrentIndex(index);
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleShuffle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrevious, handleNext, handleShuffle, stop]);

  const triggerCelebration = (num: number) => {
    // Proportional duration: 400ms base + 200ms per number magnitude (from 600ms to 2400ms)
    const duration = 400 + num * 200;
    const end = Date.now() + duration;
    
    // Proportional intensity (number of particles spawned per frame, from 1 to 7 per side)
    const particleCount = Math.max(1, Math.round(num * 0.7));
    
    // Proportional spread (from 44 degrees to 80 degrees)
    const spread = 40 + num * 4;

    const frame = () => {
      confetti({
        particleCount: particleCount,
        angle: 60,
        spread: spread,
        origin: { x: 0, y: 0.8 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#a78bfa']
      });
      confetti({
        particleCount: particleCount,
        angle: 120,
        spread: spread,
        origin: { x: 1, y: 0.8 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#a78bfa']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Forgiving tap detection for the big number. Pointer events get implicit
  // capture on touch, so the release still lands here even if the finger
  // drifts or the press animation shrinks the element — the two ways toddler
  // taps get dropped by synthetic click events.
  const numberTapStartRef = useRef<{ x: number; y: number } | null>(null);
  const isRevealingRef = useRef(false);

  const handleNumberPointerDown = (e: React.PointerEvent) => {
    numberTapStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleNumberPointerUp = async (e: React.PointerEvent) => {
    const start = numberTapStartRef.current;
    numberTapStartRef.current = null;
    if (!start) return;
    // Anything under 40px of drift still counts as a tap; bigger movements
    // are drags/swipes and are left to the swipe handler.
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 40) return;
    if (isRevealingRef.current) return;

    isRevealingRef.current = true;
    const tappedIndex = currentIndexRef.current;
    try {
      playVocabTapPop();
      stop();
      // Await the TTS speak promise to fully finish pronouncing the number first!
      await speak(String(currentNumber), { voice: preferredVoice ?? null });
      // Natural 150ms beat to allow natural audio decay before transitioning
      await new Promise(r => setTimeout(r, 150));
      // Only flip if we are still on the number that was tapped
      if (currentIndexRef.current === tappedIndex) {
        setIsFlipped(true);
      }
    } finally {
      isRevealingRef.current = false;
    }
  };

  if (currentNumber === undefined) {
    return <div>Loading...</div>;
  }

  const numberColor = getLetterColors(String(currentNumber === 10 ? 0 : currentNumber));

  // No background-tap shuffle on this page: little palms brush the screen
  // while aiming for the number and the dots. Swipe, arrows, space, and
  // finishing the dot board are the ways to move on.
  return (
    <div
      className="fixed inset-0 select-none flex flex-col justify-between overflow-hidden touchable-area bg-[#FFFDF9] dark:bg-[#000000]"
      onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
      onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
      onTouchEnd={(e) => swipeHandlers.onTouchEnd()}
    >

      <header className="absolute top-0 left-0 w-full p-4 z-50 flex items-center justify-between pointer-events-none">
        <TrayMenu currentPageId="numbers" />
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </header>

      <main
        className="flex-1 flex flex-col items-center justify-center text-center px-4 overflow-hidden w-full relative"
      >
        <div className="w-full flex justify-center items-center" style={{ perspective: '1000px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentIndex}-${isFlipped}`}
              className="flex items-center justify-center w-[95%] max-w-[600px] h-[clamp(420px,75vh,600px)]"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {!isFlipped ? (
                <motion.h2
                  onPointerDown={handleNumberPointerDown}
                  onPointerUp={handleNumberPointerUp}
                  onClick={(e) => e.stopPropagation()}
                  className={`font-black tracking-widest cursor-pointer pointer-events-auto ${numberColor.text}`}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  whileTap={{ scale: 0.93 }}
                  style={{
                    fontSize: 'clamp(15rem, 75vmin, 28rem)',
                    fontFamily: "'Nunito', sans-serif",
                    textShadow: '2px 4px 8px rgba(0,0,0,0.08)',
                    lineHeight: 1,
                  }}
                >
                  {currentNumber}
                </motion.h2>
              ) : (
                <AnimatedDots
                  key={currentIndex}
                  count={currentNumber}
                  color={dotColors[currentNumber] || '#60a5fa'}
                  voice={preferredVoice ?? null}
                  onComplete={() => {
                    const celebrationDuration = 400 + currentNumber * 200; // ms
                    triggerCelebration(currentNumber);
                    // A little spoken praise makes finishing feel like a win
                    const praise = PRAISE_LINES[Math.floor(Math.random() * PRAISE_LINES.length)];
                    setTimeout(() => {
                      speak(praise, { voice: preferredVoice ?? null });
                    }, 500);
                    setTimeout(() => {
                      playCardTransitionChime();
                      setIsFlipped(false);
                      // Advance to the next shuffled number instead of showing the same one
                      advanceShuffled();
                    }, celebrationDuration + 900); // buffer to let the confetti fall and praise finish
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default NumbersApp;