import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { getLetterColors } from '../lib/colorUtils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

import { Shuffle } from 'lucide-react';

export interface PhonicsLetter {
  letter: string;
  sound: string;
}

export interface LearningModule {
  id: string;
  name: string;
  type: 'letters' | 'cvc';
  letters?: PhonicsLetter[];
}

export const learningModules: LearningModule[] = [
  {
    id: 'letters-full',
    name: 'Full Alphabet',
    type: 'letters',
    letters: [
      { letter: 'A', sound: '/sounds/Phonics/Sound 01.mp3' },
      { letter: 'B', sound: '/sounds/Phonics/Sound 02.mp3' },
      { letter: 'C', sound: '/sounds/Phonics/Sound 03.mp3' },
      { letter: 'D', sound: '/sounds/Phonics/Sound 04.mp3' },
      { letter: 'E', sound: '/sounds/Phonics/Sound 05.mp3' },
      { letter: 'F', sound: '/sounds/Phonics/Sound 06.mp3' },
      { letter: 'G', sound: '/sounds/Phonics/Sound 07.mp3' },
      { letter: 'H', sound: '/sounds/Phonics/Sound 08.mp3' },
      { letter: 'I', sound: '/sounds/Phonics/Sound 09.mp3' },
      { letter: 'J', sound: '/sounds/Phonics/Sound 10.mp3' },
      { letter: 'K', sound: '/sounds/Phonics/Sound 11.mp3' },
      { letter: 'L', sound: '/sounds/Phonics/Sound 12.mp3' },
      { letter: 'M', sound: '/sounds/Phonics/Sound 13.mp3' },
      { letter: 'N', sound: '/sounds/Phonics/Sound 14.mp3' },
      { letter: 'O', sound: '/sounds/Phonics/Sound 15.mp3' },
      { letter: 'P', sound: '/sounds/Phonics/Sound 16.mp3' },
      { letter: 'Q', sound: '/sounds/Phonics/Sound 17.mp3' },
      { letter: 'R', sound: '/sounds/Phonics/Sound 18.mp3' },
      { letter: 'S', sound: '/sounds/Phonics/Sound 19.mp3' },
      { letter: 'T', sound: '/sounds/Phonics/Sound 20.mp3' },
      { letter: 'U', sound: '/sounds/Phonics/Sound 21.mp3' },
      { letter: 'V', sound: '/sounds/Phonics/Sound 22.mp3' },
      { letter: 'W', sound: '/sounds/Phonics/Sound 23.mp3' },
      { letter: 'X', sound: '/sounds/Phonics/Sound 24.mp3' },
      { letter: 'Y', sound: '/sounds/Phonics/Sound 25.mp3' },
      { letter: 'Z', sound: '/sounds/Phonics/Sound 26.mp3' },
    ]
  },
];

export default function PhonicsApp() {
  
  const [, navigate] = useLocation();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { speak, stop, voices } = useSpeechSynthesis();
  const [femaleVoice, setFemaleVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const loopShouldContinue = useRef(false);
  const isSoundPlayingRef = useRef(false);

  const selectedModule = learningModules[0];

  const stopAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const stopAllSounds = useCallback(() => {
    loopShouldContinue.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stop(); // Stop TTS
    stopAllTimers();
    isSoundPlayingRef.current = false;
  }, [stop, stopAllTimers]);

  const handleLetterClick = useCallback((index: number) => {
    stopAllSounds();
    
    const letterInfo = selectedModule.letters?.[index];
    if (!letterInfo) return;

    setCurrentIndex(index);
    setIsPlaying(true);
  }, [selectedModule.letters, stopAllSounds]);

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

  useEffect(() => {
    if (voices && voices.length > 0) {
        const foundVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices.find(v => v.lang.startsWith('en'));
        setFemaleVoice(foundVoice || null);
    }
  }, [voices]);

  const playSoundOnce = useCallback(async (soundFile: string) => {
      if (isSoundPlayingRef.current) return;
      stopAllSounds();
      isSoundPlayingRef.current = true;
      await new Promise(res => setTimeout(res, 300));
      return new Promise<void>(resolve => {
          const audio = new Audio(soundFile);
          audioRef.current = audio;
          audio.onended = () => {
            isSoundPlayingRef.current = false;
            resolve();
          };
          audio.onerror = () => {
            isSoundPlayingRef.current = false;
            resolve();
          };
          audio.play();
      });
  }, [stopAllSounds]);

  useEffect(() => {
    if (currentIndex === null || !isPlaying) {
      loopShouldContinue.current = false;
      return;
    }

    const letterInfo = selectedModule.letters?.[currentIndex];
    if (!letterInfo) return;

    const runAsync = async () => {
        loopShouldContinue.current = true;
        while (loopShouldContinue.current) {
            await playSoundOnce(letterInfo.sound);
            if (!loopShouldContinue.current) break;
            await new Promise(res => setTimeout(res, 4000));
        }
    }

    runAsync();

    return () => {
        loopShouldContinue.current = false;
        stopAllSounds();
    };
  }, [currentIndex, isPlaying, selectedModule.letters, playSoundOnce, stopAllSounds]);


  const handleShuffle = useCallback(() => {
    if (shuffledIndex >= shuffledIndices.length - 1) {
      shuffleLetters();
    } else {
      const nextShuffledIndex = shuffledIndex + 1;
      setShuffledIndex(nextShuffledIndex);
      handleLetterClick(shuffledIndices[nextShuffledIndex]);
    }
  }, [shuffledIndex, shuffledIndices, shuffleLetters, handleLetterClick]);

  const handleNext = useCallback(() => {
    if (currentIndex === null) return;
    const nextIndex = (currentIndex + 1) % (selectedModule.letters?.length || 1);
    handleLetterClick(nextIndex);
  }, [currentIndex, selectedModule.letters, handleLetterClick]);

  const handlePrevious = useCallback(() => {
    if (currentIndex === null) return;
    const prevIndex = (currentIndex - 1 + (selectedModule.letters?.length || 1)) % (selectedModule.letters?.length || 1);
    handleLetterClick(prevIndex);
  }, [currentIndex, selectedModule.letters, handleLetterClick]);

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying) return;
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
  
  const replaySound = async () => {
    if (currentIndex === null) return;
    const letterInfo = selectedModule.letters?.[currentIndex];
    if (!letterInfo) return;

    stopAllSounds();
    
    loopShouldContinue.current = true;
    while (loopShouldContinue.current) {
        await playSoundOnce(letterInfo.sound);
        if (!loopShouldContinue.current) break;
        await new Promise(res => setTimeout(res, 4000));
    }
  };

  useEffect(() => {
    // Start with the first shuffled letter
    if (shuffledIndices.length > 0) {
      handleLetterClick(shuffledIndices[0]);
      setShuffledIndex(1);
    }
  }, [shuffledIndices, handleLetterClick]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ') {
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
  }, [currentIndex, handlePrevious, handleNext, handleShuffle, handleLetterClick, selectedModule.letters]);


  if (!selectedModule) {
    return <div>Error: Letter module not found.</div>;
  }

  const currentDisplayData = currentIndex !== null ? selectedModule.letters?.[currentIndex] : null;

  return (
    <div className="h-screen bg-background select-none flex flex-col overflow-hidden" onClick={handleScreenClick}>
      <header className="flex items-center p-4 flex-shrink-0 w-full">
        <Link href="/" onClick={(e) => e.stopPropagation()} className="z-50 flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center">
        <main className="relative z-10 flex flex-col items-center px-4 sm:px-8 md:px-12 min-h-0" style={{ transform: 'translateY(-25%)' }}>
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

          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative">
              <div className="text-center">
                {currentIndex !== null && currentDisplayData && (
                  <span className={`font-semibold ${getLetterColors(currentDisplayData.letter).text} text-[15rem] sm:text-[11rem] md:text-[20rem] lg:text-[17rem] xl:text-[19rem]`}>
                    <span>{currentDisplayData.letter}</span>
                    <span className="text-8xl sm:text-[6rem] md:text-[10rem] lg:text-[9rem] xl:text-[10rem] align-baseline">{currentDisplayData.letter.toLowerCase()}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 w-full mb-8" data-testid="container-item-tray">
          <div className="flex justify-center items-center p-6 max-w-5xl mx-auto">
          <button
            onClick={(e) => { e.stopPropagation(); voices.length > 0 && handleShuffle(); }}
            disabled={voices.length === 0}
            className={`touch-target rounded-2xl py-6 px-12 transition-all bg-gray-200 hover:bg-gray-300 text-gray-800 ${voices.length === 0 && 'opacity-50 cursor-not-allowed'}`}
          >
            <Shuffle className="w-8 h-8 md:w-16 md:h-16" />
          </button>          </div>
        </div>
      </div>
    </div>
  );
}