import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Shuffle } from 'lucide-react';
import { getLetterColors } from '../lib/colorUtils';
import { vocabData } from '../data/vocabData';

const VocabApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const { speak, voices } = useSpeechSynthesis();
  const femaleVoice = voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices?.find(v => v.lang.startsWith('en'));

  const shuffleItems = useCallback(() => {
    const indices = vocabData.map((_, i) => i);
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
    setCurrentIndex(indices[0]);
  }, [currentIndex]);

  useEffect(() => {
    shuffleItems();
  }, []);

  const handleNext = useCallback(() => {
    const nextShuffledIndex = (shuffledIndex + 1) % shuffledIndices.length;
    setShuffledIndex(nextShuffledIndex);
    setCurrentIndex(shuffledIndices[nextShuffledIndex]);
  }, [shuffledIndex, shuffledIndices]);

  const handlePrevious = useCallback(() => {
    const prevShuffledIndex = (shuffledIndex - 1 + shuffledIndices.length) % shuffledIndices.length;
    setShuffledIndex(prevShuffledIndex);
    setCurrentIndex(shuffledIndices[prevShuffledIndex]);
  }, [shuffledIndex, shuffledIndices]);

  const handleShuffle = () => {
    if (shuffledIndex >= shuffledIndices.length - 1) {
      shuffleItems();
    } else {
      handleNext();
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
      const currentItem = vocabData[currentIndex];
      if (currentItem) {
        speak(currentItem.tts || currentItem.name, { voice: femaleVoice ?? null });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrevious, handleNext]);

  useEffect(() => {
    const currentItem = vocabData[currentIndex];
    if (currentItem) {
      speak(currentItem.tts || currentItem.name, { voice: femaleVoice ?? null });
    }
  }, [currentIndex, femaleVoice, speak]);

  const currentItem = vocabData[currentIndex];

  if (!currentItem) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-background select-none flex flex-col overflow-hidden relative" onClick={handleScreenClick}>
      <header className="flex items-center p-4 flex-shrink-0 w-full">
        <Link href="/" onClick={(e) => e.stopPropagation()} className="z-50 flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-around overflow-y-auto">
        <main className="relative flex flex-col items-center justify-start text-center px-4">
          <div className="absolute left-0 top-0 h-full w-1/4 flex items-center justify-center opacity-80 md:opacity-20 md:hover:opacity-80 transition-opacity">
            <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/4 flex items-center justify-center opacity-80 md:opacity-20 md:hover:opacity-80 transition-opacity">
            <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div className="flex flex-col items-center justify-center gap-y-8 animate-fade-in">
            <h2 className="text-8xl md:text-8xl font-bold tracking-widest">
              <span className={getLetterColors(currentItem.name.charAt(0)).text}>{currentItem.name.charAt(0)}</span>
              <span className="text-gray-600">{currentItem.name.slice(1)}</span>
            </h2>
            <img
              src={currentItem.image}
              alt={currentItem.name}
              className="w-52 h-52 md:w-52 md:h-52 object-contain"
            />
          </div>
        </main>

        <div className="w-full p-4 pb-8">
          <div className="w-full max-w-2xl mx-auto">
            <div className="flex justify-center items-center p-4 max-w-4xl mx-auto">
              <button
                onClick={(e) => { e.stopPropagation(); handleShuffle(); }}
                className={`touch-target rounded-2xl py-6 px-8 transition-all bg-gray-200 hover:bg-gray-300 text-gray-800`}
              >
                <Shuffle className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default VocabApp;
