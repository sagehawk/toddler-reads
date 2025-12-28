import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Shuffle, Volume2, VolumeX } from 'lucide-react';
import { getLetterColors } from '../lib/colorUtils';
import { vocabData, VocabItem } from '../data/vocabData';
import useLocalStorage from '@/hooks/useLocalStorage';
import { AnimalsVocab } from './AnimalsVocab';
import confetti from 'canvas-confetti';
import { useSwipe } from '@/hooks/useSwipe';

const categoryOrder = ['Animals', 'Things', 'Nature', 'Vehicles', 'People'];

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
const SLOW_RATE = isAndroid ? 0.2 : 0.5;

// Extracted component to handle animation isolation
const AnimatedWord = ({ 
    text, 
    ttsText, 
    onComplete, 
    voice, 
    isAnimatingRef 
}: { 
    text: string, 
    ttsText: string, 
    onComplete: () => void, 
    voice: SpeechSynthesisVoice | null,
    isAnimatingRef: React.MutableRefObject<boolean>
}) => {
    const [visibleCount, setVisibleCount] = useState(0);
    const { speak, stop } = useSpeechSynthesis();
    const wordRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        let isCancelled = false;
        let animationInterval: NodeJS.Timeout;

        const animateLetters = async () => {
            setVisibleCount(0);
            const totalLetters = text.length;
            let current = 0;
            const letterDelay = 300; 

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
            
            // --- ROUND 1 ---
            // 1. Slow TTS + Animation
            const animPromise1 = animateLetters();
            const speechPromise1 = speak(ttsText, { voice: voice, rate: SLOW_RATE });
            
            await Promise.all([animPromise1, speechPromise1]);
            if (isCancelled) return;

            // Ensure full word visible
            setVisibleCount(text.length);
            clearInterval(animationInterval);

            await new Promise(r => setTimeout(r, 200));
            if (isCancelled) return;

            // 2. Fast TTS
            await speak(ttsText, { voice: voice, rate: 1.0 });
            if (isCancelled) return;

            await new Promise(r => setTimeout(r, 500));
            if (isCancelled) return;

            // --- ROUND 2 ---
            // 3. Slow TTS + Animation (Start Over)
            const animPromise2 = animateLetters();
            const speechPromise2 = speak(ttsText, { voice: voice, rate: SLOW_RATE });

            await Promise.all([animPromise2, speechPromise2]);
            if (isCancelled) return;

            setVisibleCount(text.length);
            clearInterval(animationInterval);

            await new Promise(r => setTimeout(r, 200));
            if (isCancelled) return;

            // 4. Fast TTS
            await speak(ttsText, { voice: voice, rate: 1.0 });

            if (!isCancelled) {
                isAnimatingRef.current = false;
                onComplete();
            }
        };

        runSequence();

        return () => {
            isCancelled = true;
            stop();
            clearInterval(animationInterval);
            isAnimatingRef.current = false;
        };
    }, [text, ttsText, voice, speak, stop, isAnimatingRef, onComplete]);

    useLayoutEffect(() => {
        if (wordRef.current) {
            const container = wordRef.current.parentElement;
            if (container) {
                const containerWidth = container.clientWidth;
                wordRef.current.style.fontSize = '100px';
                const wordWidth = wordRef.current.scrollWidth;
                const targetWidth = containerWidth * 0.9;
                let newFontSize = (targetWidth / wordWidth) * 100;
                const maxFontSize = 12 * 16; 
                const minFontSize = 3 * 16; 
                newFontSize = Math.max(minFontSize, Math.min(newFontSize, maxFontSize));
                wordRef.current.style.fontSize = `${newFontSize}px`;
            }
        }
    }, [text]);

    return (
        <h2 ref={wordRef} className="font-bold break-words">
            {text.split('').map((char, index) => (
                <span 
                    key={index} 
                    className={`transition-opacity duration-300 ${index < visibleCount ? 'opacity-100' : 'opacity-0'} ${index === 0 ? getLetterColors(char).text : 'text-gray-600 dark:text-gray-400'}`}
                >
                    {char}
                </span>
            ))}
        </h2>
    );
};

const VocabApp = () => {
  const [match, params] = useRoute("/vocab/:category?");
  const category = params?.category;

  const filteredVocab = (category && category !== 'all')
    ? sortedVocabData.filter(item => item.category.toLowerCase().replace(/[\s/]+/g, '-') === category)
    : sortedVocabData;

  // New Animals Flow Integration
  if (category === 'animals') {
      return <AnimalsVocab items={filteredVocab} onExit={() => window.location.href = '/app'} />;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasListened, setHasListened] = useState(false); 
  
  const { speak, stop, voices } = useSpeechSynthesis();
  const femaleVoice = voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices?.find(v => v.lang.startsWith('en'));
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref to track animation status across the extracted component
  const isAnimatingRef = useRef(false);

  const currentItem = filteredVocab[currentIndex];

  const shuffleItems = useCallback((shouldSetFirst = false) => {
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
  }, [filteredVocab]);

  useEffect(() => {
    shuffleItems(true);
  }, [category]);

  // Reset listened state when index changes
  useEffect(() => {
      setHasListened(false);
  }, [currentIndex]);

  const handleSequenceComplete = useCallback(() => {
      setHasListened(true);
      // Auto confetti at the end of the sequence
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 }
      });
  }, []);

  const handleNext = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredVocab.length);
    }, 150);
  }, [filteredVocab.length]);

  const handlePrevious = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredVocab.length) % filteredVocab.length);
    }, 150);
  }, [filteredVocab.length]);

  const handleShuffle = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    
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

  const handleInteraction = () => {
    if (navigator.vibrate) navigator.vibrate(5);
    
    if (isFlipped) {
        setIsFlipped(false);
    } else {
        stop(); // Stop any current speech
        setIsFlipped(true);
    }
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= 'a' && e.key <= 'z') {
        const newIndex = filteredVocab.findIndex(item => item.name.toLowerCase().startsWith(e.key));
        if (newIndex !== -1) {
          setCurrentIndex(newIndex);
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
  }, [handlePrevious, handleNext, filteredVocab, handleShuffle]);

  if (!currentItem) {
    return <div>Loading...</div>;
  }

  return (
    <div 
        className="fixed inset-0 select-none flex flex-col overflow-hidden pb-48 md:pb-24 touchable-area" 
        onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
        onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
        onTouchEnd={(e) => swipeHandlers.onTouchEnd()}
    >
      <header className="flex items-center justify-between p-4 flex-shrink-0 w-full">
        <Link href="/" onClick={(e) => e.stopPropagation()} className="z-50 flex items-center justify-center w-20 h-20 rounded-full bg-secondary hover:bg-border text-secondary-foreground transition-colors focus:outline-none focus:ring-0 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        <main 
            className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden"
            onClick={handleInteraction}
        >
          <div className="w-full flex justify-center items-center" style={{ perspective: '1000px' }}>
            <div className={`card ${isFlipped ? 'is-flipped' : ''}`} style={{ width: '100%', height: 'clamp(300px, 80vw, 600px)' }}>
              <div className="card-face card-face-front">
                {/* Use key to force remount on index change -> Fixes FOUC and resets animation */}
                {!isFlipped && (
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
              <div className="card-face card-face-back flex items-center justify-center">
                <img
                  src={currentItem.image}
                  alt={currentItem.name}
                  className="w-full h-full object-contain md:w-3/5 md:h-3/5 noselect"
                  draggable="false"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="h-48 md:h-24 flex-shrink-0" />
      <div className="fixed bottom-0 left-0 right-0 h-48 md:h-32 z-50 flex items-center justify-center">
        <button
          onPointerDown={(e) => { e.stopPropagation(); handleShuffle(); e.currentTarget.blur(); }}
          className="w-full h-full flex items-center justify-center transition-transform active:scale-95 text-secondary-foreground/50 hover:text-secondary-foreground"
        >
          <Shuffle className="w-16 h-16 md:w-20 md:h-20" />
        </button>
      </div>
    </div>
  )
};

export default VocabApp;