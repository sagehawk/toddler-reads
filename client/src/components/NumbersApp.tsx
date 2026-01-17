import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { numbersData } from '../data/numbersData';
import { getLetterColors } from '../lib/colorUtils';
import useLocalStorage from '@/hooks/useLocalStorage';
import confetti from 'canvas-confetti';
import { useSwipe } from '@/hooks/useSwipe';

// Helper to detect Android
const isAndroid = /Android/i.test(navigator.userAgent);

const Dot = ({ color, visible }: { color: string, visible: boolean }) => (
  <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ${color} rounded-full transition-opacity duration-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
);

const DieFace = ({ count, color, visibleCount }: { count: number, color: string, visibleCount: number }) => {
  // Helper to determine if a dot at specific index (1-based) is visible
  const isVisible = (index: number) => index <= visibleCount;

  const renderDot = (index: number) => <Dot color={color} visible={isVisible(index)} />;

  const patterns: { [key: number]: React.ReactNode } = {
      1: <div className="flex justify-center items-center w-full h-full">{renderDot(1)}</div>,
      2: <div className="grid grid-cols-2 gap-8 w-full h-full p-4 place-items-center"><div className="self-start justify-self-start">{renderDot(1)}</div><div className="self-end justify-self-end">{renderDot(2)}</div></div>,
      3: <div className="grid grid-cols-3 grid-rows-3 gap-8 w-full h-full p-4 place-items-center"><div className="self-start justify-self-start">{renderDot(1)}</div><div>{renderDot(2)}</div><div className="self-end justify-self-end">{renderDot(3)}</div></div>,
      4: <div className="grid grid-cols-2 grid-rows-2 gap-8 w-full h-full p-4 place-items-center">{renderDot(1)}{renderDot(2)}{renderDot(3)}{renderDot(4)}</div>,
      5: <div className="grid grid-cols-3 grid-rows-3 gap-8 w-full h-full p-4 place-items-center"><div className="col-start-1 row-start-1">{renderDot(1)}</div><div className="col-start-3 row-start-1">{renderDot(2)}</div><div className="col-start-2 row-start-2">{renderDot(3)}</div><div className="col-start-1 row-start-3">{renderDot(4)}</div><div className="col-start-3 row-start-3">{renderDot(5)}</div></div>,
      6: <div className="grid grid-cols-2 grid-rows-3 gap-8 w-full h-full p-4 place-items-center">{renderDot(1)}{renderDot(2)}{renderDot(3)}{renderDot(4)}{renderDot(5)}{renderDot(6)}</div>,
      7: <div className="grid grid-cols-3 grid-rows-3 gap-8 w-full h-full p-4 place-items-center"><div className="col-start-1 row-start-1">{renderDot(1)}</div><div className="col-start-3 row-start-1">{renderDot(2)}</div><div className="col-start-2 row-start-2">{renderDot(3)}</div><div className="col-start-1 row-start-3">{renderDot(4)}</div><div className="col-start-3 row-start-3">{renderDot(5)}</div><div className="col-start-2 row-start-1">{renderDot(6)}</div><div className="col-start-2 row-start-3">{renderDot(7)}</div></div>,
      8: <div className="grid grid-cols-2 grid-rows-4 gap-8 w-full h-full p-4 place-items-center">{renderDot(1)}{renderDot(2)}{renderDot(3)}{renderDot(4)}{renderDot(5)}{renderDot(6)}{renderDot(7)}{renderDot(8)}</div>,
      9: <div className="grid grid-cols-3 grid-rows-3 gap-8 w-full h-full p-4 place-items-center">{renderDot(1)}{renderDot(2)}{renderDot(3)}{renderDot(4)}{renderDot(5)}{renderDot(6)}{renderDot(7)}{renderDot(8)}{renderDot(9)}</div>,
      10: <div className="grid grid-cols-2 grid-rows-5 gap-8 w-full h-full p-4 place-items-center">{renderDot(1)}{renderDot(2)}{renderDot(3)}{renderDot(4)}{renderDot(5)}{renderDot(6)}{renderDot(7)}{renderDot(8)}{renderDot(9)}{renderDot(10)}</div>,
  };
  return <div className="w-full h-full p-8 flex justify-center items-center">{patterns[count]}</div>;
};

// Component to handle counting animation
const AnimatedDots = ({ count, color, onComplete, voice }: { count: number, color: string, onComplete: () => void, voice: SpeechSynthesisVoice | null }) => {
    const [visibleCount, setVisibleCount] = useState(0);
    const { speak, stop } = useSpeechSynthesis();

    useEffect(() => {
        let isCancelled = false;

        const runSequence = async () => {
            setVisibleCount(0);
            await new Promise(r => setTimeout(r, 500)); // Small initial pause
            if (isCancelled) return;

            // The higher the total count, the shorter the delay between dots
            // This ensures counting to 10 doesn't take too long.
            const baseDelay = Math.max(30, 250 - (count * 20));

            for (let i = 1; i <= count; i++) {
                if (isCancelled) return;
                
                // Show dot
                setVisibleCount(i);
                
                // Speak number as it appears at normal rate
                await speak(i.toString(), { voice, rate: 1.0 });
                
                // Pause between numbers
                await new Promise(r => setTimeout(r, baseDelay));
            }

            if (!isCancelled) {
                onComplete();
            }
        };

        runSequence();

        return () => {
            isCancelled = true;
            stop();
        };
    }, [count, voice, speak, stop, onComplete]);

    return <DieFace count={count} color={color} visibleCount={visibleCount} />;
};

import { usePreventBackExit } from '@/hooks/usePreventBackExit';

const NumbersApp = () => {
  usePreventBackExit();
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const [isQuietMode, setIsQuietMode] = useLocalStorage('numbersQuietMode', false);
  const { speak, stop, voices } = useSpeechSynthesis();
  const femaleVoice = voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices?.find(v => v.lang.startsWith('en'));
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentNumber = numbersData[currentIndex];

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
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    stop();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % numbersData.length);
    }, 150);
  }, [numbersData.length, stop]);

  const handlePrevious = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    stop();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + numbersData.length) % numbersData.length);
    }, 150);
  }, [numbersData.length, stop]);

  const handleShuffle = () => {
    // Haptic
    if (navigator.vibrate) navigator.vibrate(10);

    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    stop();
    setIsFlipped(false);
    setTimeout(() => {
      if (shuffledIndex >= shuffledIndices.length) {
        shuffleItems();
        setCurrentIndex(shuffledIndices[0]);
        setShuffledIndex(1);
      } else {
        setCurrentIndex(shuffledIndices[shuffledIndex]);
        setShuffledIndex(shuffledIndex + 1);
      }
    }, 150);
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });

  const handleInteraction = () => {
      handleShuffle();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        const number = parseInt(e.key, 10);
        const index = numbersData.indexOf(number === 0 ? 10 : number);
        if (index !== -1) {
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
  }, [handlePrevious, handleNext, handleShuffle]);

  // Main Auto-Play Sequence
  useEffect(() => {
    if (currentNumber === undefined || isQuietMode) return;

    let isCancelled = false;

    const runSequence = async () => {
      setIsFlipped(false);
      
      // 1. Speak Number Name
      speak(String(currentNumber), { voice: femaleVoice ?? null });

      // 2. Wait 2 seconds
      await new Promise(r => setTimeout(r, 2000));
      if (isCancelled) return;

      // 3. Flip to trigger counting animation
      setIsFlipped(true);
    };

    runSequence();

    return () => {
      isCancelled = true;
      stop();
    };
  }, [currentIndex, currentNumber, femaleVoice, speak, isQuietMode, stop]);

  if (currentNumber === undefined) {
    return <div>Loading...</div>;
  }

  const numberColor = getLetterColors(String(currentNumber === 10 ? 0 : currentNumber));

  return (
    <div 
        className="fixed inset-0 select-none flex flex-col justify-between overflow-hidden" 
        onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
        onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
        onTouchEnd={(e) => swipeHandlers.onTouchEnd()}
        onClick={handleShuffle}
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </button>
      </header>

      <main 
          className="relative flex flex-1 flex-col items-center justify-center text-center px-4 overflow-hidden pb-48 md:pb-24"
      >
        <div className="absolute left-0 top-0 h-full w-1/4 flex items-center justify-center opacity-80 md:opacity-20 md:hover:opacity-80 transition-opacity pointer-events-none">
        </div>
        <div className="absolute right-0 top-0 h-full w-1/4 flex items-center justify-center opacity-80 md:opacity-20 md:hover:opacity-80 transition-opacity pointer-events-none">
        </div>

        <div className="w-full flex justify-center items-center" style={{ perspective: '1000px' }}>
            <div className={`card ${isFlipped ? 'is-flipped' : ''}`} style={{ width: 'clamp(300px, 95vmin, 600px)', height: 'clamp(300px, 95vmin, 600px)' }}>
              <div className="card-face card-face-front">
                <h2 className={`font-bold tracking-widest cursor-pointer ${numberColor.text}`} style={{ fontSize: 'clamp(15rem, 80vmin, 30rem)' }}>
                  {currentNumber}
                </h2>
              </div>
              <div className="card-face card-face-back">
                {isFlipped && (
                    <AnimatedDots 
                        key={currentIndex}
                        count={currentNumber} 
                        color={numberColor.background} 
                        voice={femaleVoice ?? null}
                        onComplete={() => {
                            confetti({
                                particleCount: 30,
                                spread: 50,
                                origin: { y: 0.6 }
                            });
                            // Flip back to number after a short delay
                            setTimeout(() => {
                                setIsFlipped(false);
                            }, 2000);
                        }}
                    />
                )}
              </div>
            </div>
          </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-48 md:h-32 z-50 flex items-center justify-center pointer-events-none">
        {/* Shuffle button removed */}
      </div>
    </div>
  )
};

export default NumbersApp;