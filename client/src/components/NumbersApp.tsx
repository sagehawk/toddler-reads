import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Shuffle, Volume2, VolumeX } from 'lucide-react';
import { numbersData } from '../data/numbersData';
import { getLetterColors } from '../lib/colorUtils';
import useLocalStorage from '@/hooks/useLocalStorage';

const NumbersApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const [isQuietMode, setIsQuietMode] = useLocalStorage('numbersQuietMode', false);
  const { speak, voices } = useSpeechSynthesis();
  const femaleVoice = voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices?.find(v => v.lang.startsWith('en'));

  const currentNumber = numbersData[currentIndex];

  const shuffleItems = useCallback(() => {
    const indices = numbersData.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledIndices(indices);
    setShuffledIndex(0);
  }, []);

  useEffect(() => {
    shuffleItems();
  }, [shuffleItems]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % numbersData.length);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + numbersData.length) % numbersData.length);
  }, []);

  const handleShuffle = () => {
    if (shuffledIndex >= shuffledIndices.length) {
      shuffleItems();
      setCurrentIndex(shuffledIndices[0]);
      setShuffledIndex(1);
    } else {
      setCurrentIndex(shuffledIndices[shuffledIndex]);
      setShuffledIndex(shuffledIndex + 1);
    }
  };

  const replaySound = () => {
    if (currentNumber) {
      speak(String(currentNumber), { voice: femaleVoice ?? null });
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

  useEffect(() => {
    if (currentNumber && !isQuietMode) {
      speak(String(currentNumber), { voice: femaleVoice ?? null });
    }
  }, [currentIndex, femaleVoice, speak, currentNumber, isQuietMode]);

  if (currentNumber === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen-svh bg-background select-none flex flex-col justify-between overflow-hidden relative" onClick={handleScreenClick}>
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

        <div className="w-full flex justify-center">
          <div className="flex flex-col items-center justify-center gap-y-4 animate-fade-in">
            <h2 className={`text-[15rem] lg:text-[20rem] xl:text-[25rem] font-bold tracking-widest cursor-pointer ${getLetterColors(String(currentNumber === 10 ? 0 : currentNumber)).text}`} onClick={(e) => { e.stopPropagation(); replaySound(); }}>
              {currentNumber}
            </h2>
          </div>
        </div>
      </main>

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

export default NumbersApp;
