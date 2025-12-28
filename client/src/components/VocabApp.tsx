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

                const runSequence = async () => {
                    isAnimatingRef.current = true;
                    setVisibleCount(0);
        
                    // 1. Start Animate letters IMMEDIATELY
                    const totalLetters = text.length;
                    let current = 0;
                    const letterDelay = 300; 
        
                                animationInterval = setInterval(() => {
                                    if (isCancelled) return;
                                    current++;
                                    setVisibleCount(current);
                                    if (current >= totalLetters) {
                                        clearInterval(animationInterval);
                                    }
                                }, letterDelay);
                    
                                // 3. Slow TTS
                                const slowSpeechPromise = speak(ttsText, { 
                                    voice: voice, 
                                    rate: 0.5 
                                });        
                    await slowSpeechPromise;
                    if (isCancelled) return;
        
                    // Ensure we clear interval if speech finished first (unlikely with delay)
                                clearInterval(animationInterval);
                                setVisibleCount(totalLetters);
                    
                                await new Promise(r => setTimeout(r, 200));
                                if (isCancelled) return;
                    
                                // 4. Normal TTS
                                await speak(ttsText, { 
                                    voice: voice, 
                                    rate: 1.0 
                                });
                    
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
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 }
    });
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
    
    // If still animating letters, we might want to skip? 
    // Or simpler: normal click behavior just flips.
    // The AnimatedWord handles its own mounting/unmounting.
    // When we flip, we might want to replay sound if on front side?
    
    if (isFlipped) {
        // Flipping back to front -> Re-mount AnimatedWord to replay?
        // Or just show full word? Usually flipping back just shows static.
        // Let's just flip.
        setIsFlipped(false);
    } else {
        // Flipping to back (image)
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
        className="fixed inset-0 bg-background select-none flex flex-col overflow-hidden pb-48 md:pb-24 touchable-area" 
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
            className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden -mt-32"
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
                        onComplete={() => {}}
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
      <div className="fixed bottom-0 left-0 right-0 h-48 md:h-24 z-50 bg-background opacity-50">
        <button
          onPointerDown={(e) => { e.stopPropagation(); handleShuffle(); e.currentTarget.blur(); }}
          className="w-full h-full flex items-center justify-center transition-colors text-secondary-foreground"
        >
          <Shuffle className="w-16 h-16" />
        </button>
      </div>
    </div>
  )
};

export default VocabApp;