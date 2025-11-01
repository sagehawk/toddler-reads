import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useRoute } from 'wouter';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Shuffle, Volume2, VolumeX } from 'lucide-react';
import { getLetterColors } from '../lib/colorUtils';
import { vocabData, VocabItem } from '../data/vocabData';
import useLocalStorage from '@/hooks/useLocalStorage';

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const [isQuietMode, setIsQuietMode] = useLocalStorage('vocabQuietMode', false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [wordTapped, setWordTapped] = useState(false);
  const { speak, voices } = useSpeechSynthesis();
  const femaleVoice = voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices?.find(v => v.lang.startsWith('en'));
  const wordContainerRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);

  const currentItem = filteredVocab[currentIndex];

  const shuffleItems = useCallback(() => {
    const indices = filteredVocab.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledIndices(indices);
    setShuffledIndex(0);
  }, [filteredVocab]);

  useEffect(() => {
    shuffleItems();
  }, [category]);



  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredVocab.length);
    setWordTapped(false);
  }, [filteredVocab.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredVocab.length) % filteredVocab.length);
    setWordTapped(false);
  }, [filteredVocab.length]);

  const handleShuffle = () => {
    if (shuffledIndex >= shuffledIndices.length) {
      shuffleItems();
      setCurrentIndex(shuffledIndices[0]);
      setShuffledIndex(1);
    } else {
      setCurrentIndex(shuffledIndices[shuffledIndex]);
      setShuffledIndex(shuffledIndex + 1);
    }
    setWordTapped(false);
  };

  const replaySound = () => {
    if (currentItem) {
      speak(currentItem.tts || currentItem.name, { voice: femaleVoice ?? null });
    }
  };

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;

    if (clickX < screenWidth / 4) {
      handlePrevious();
    } else if (clickX > screenWidth * 3 / 4) {
      handleNext();
    } else {
      replaySound();
    }
  };



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
    setIsImageVisible(false);
    setWordTapped(false);
    if (currentItem && !isQuietMode) {
      speak(currentItem.tts || currentItem.name, { voice: femaleVoice ?? null, onEnd: () => {
        setIsImageVisible(true);
      }});
    }
  }, [currentIndex, femaleVoice, speak, currentItem, isQuietMode]);

  if (!currentItem) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen-svh bg-background select-none flex flex-col overflow-hidden relative" onClick={handleScreenClick}>
      <header className="flex items-center justify-between p-4 flex-shrink-0 w-full">
        <Link href="/" onClick={(e) => e.stopPropagation()} className="z-50 flex items-center justify-center w-20 h-20 rounded-full bg-secondary hover:bg-border text-secondary-foreground transition-colors focus:outline-none focus:ring-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </Link>
        <button onClick={(e) => { e.stopPropagation(); setIsQuietMode(!isQuietMode); }} className="z-50 flex items-center justify-center w-20 h-20 rounded-full bg-secondary hover:bg-border text-secondary-foreground transition-colors focus:outline-none focus:ring-0">
          {isQuietMode ? <VolumeX className="w-12 h-12" /> : <Volume2 className="w-12 h-12" />}
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-evenly">
        <main className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1/4 flex items-center justify-center opacity-80 md:opacity-20 md:hover:opacity-80 transition-opacity">
            <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/4 flex items-center justify-center opacity-80 md:opacity-20 md:hover:opacity-80 transition-opacity">
            <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div ref={wordContainerRef} className="w-full flex justify-center">
            <div className="flex flex-col items-center justify-center gap-y-4 animate-fade-in">
              <h2 ref={wordRef} style={{ fontSize: 'clamp(5rem, 15vw, 8rem)' }} className="font-bold tracking-widest cursor-pointer" onClick={(e) => { e.stopPropagation(); setWordTapped(true); replaySound(); }}>
                <span className={getLetterColors(currentItem.name.charAt(0)).text}>{currentItem.name.charAt(0)}</span>
                <span className="text-gray-600 dark:text-gray-400">{currentItem.name.slice(1)}</span>
              </h2>
              <div className="h-52 md:h-48">
              {(isImageVisible || wordTapped) && (
                <img
                  src={currentItem.image}
                  alt={currentItem.name}
                  className="w-52 h-52 md:w-48 md:h-48 object-contain"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="h-32">
        <button
          onClick={(e) => { e.stopPropagation(); handleShuffle(); e.currentTarget.blur(); }}
          className="w-full h-full flex items-center justify-center transition-colors bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent text-secondary-foreground"
        >
          <Shuffle className="w-10 h-10 md:w-12 md:h-12" />
        </button>
      </div>
    </div>
  )
};

export default VocabApp;