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
  const wordRef = useRef<HTMLHeadingElement>(null);
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTextVisible, setIsTextVisible] = useState(true); // Default true to ensure visibility

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
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    stop();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredVocab.length);
    }, 150);
  }, [filteredVocab.length, stop]);

  const handlePrevious = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(5);
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    stop();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredVocab.length) % filteredVocab.length);
    }, 150);
  }, [filteredVocab.length, stop]);

  const handleShuffle = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 }
    });
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

  const handleInteraction = () => {
    if (navigator.vibrate) navigator.vibrate(5);
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    stop();
    audioTimeoutRef.current = setTimeout(() => {
      speak(currentItem.tts || currentItem.name, { voice: femaleVoice ?? null });
    }, 1000);
    setIsFlipped(!isFlipped);
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

  useEffect(() => {
    if (currentItem) {
      speak(currentItem.tts || currentItem.name, { voice: femaleVoice ?? null });
    }
  }, [currentIndex, femaleVoice, speak, currentItem]);

  useLayoutEffect(() => {
    // setIsTextVisible(false); // Removed to ensure default visibility
    if (wordRef.current) {
      const container = wordRef.current.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        
        // Reset font size for measurement
        wordRef.current.style.fontSize = '100px';
        const wordWidth = wordRef.current.scrollWidth;
        
        const targetWidth = containerWidth * 0.9; // Use 90% of container width
        
        let newFontSize = (targetWidth / wordWidth) * 100;
        
        // Set max and min font size
        const maxFontSize = 12 * 16; // 12rem
        const minFontSize = 3 * 16; // 3rem
        newFontSize = Math.max(minFontSize, Math.min(newFontSize, maxFontSize));

        wordRef.current.style.fontSize = `${newFontSize}px`;
        // setIsTextVisible(true);
      }
    }
  }, [currentItem]);

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
          {/* Removed arrow indicators */}

          <div className="w-full flex justify-center items-center" style={{ perspective: '1000px' }}>
            <div className={`card ${isFlipped ? 'is-flipped' : ''}`} style={{ width: '100%', height: 'clamp(300px, 80vw, 600px)' }}>
              <div className="card-face card-face-front">
                <h2 
                  ref={wordRef} 
                  style={{ visibility: isTextVisible ? 'visible' : 'visible' }} // Force visible
                  className="font-bold break-words"
                >
                  <span className={getLetterColors(currentItem.name.charAt(0)).text}>{currentItem.name.charAt(0)}</span>
                  <span className="text-gray-600 dark:text-gray-400">{currentItem.name.slice(1)}</span>
                </h2>
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
