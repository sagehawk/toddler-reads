import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { getLetterColors } from '../lib/colorUtils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import useLocalStorage from '@/hooks/useLocalStorage';
import confetti from 'canvas-confetti';
import { useSwipe } from '@/hooks/useSwipe';

import { Shuffle, Volume2, VolumeX } from 'lucide-react';

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
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useLocalStorage('phonicsAutoplay', true);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isSoundPlayingRef = useRef(false);

  const selectedModule = learningModules[0];

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
  }, [stop, stopAllTimers]);

  const handleLetterClick = useCallback((index: number) => {
    console.log(`handleLetterClick called with index: ${index}`);
    stopAllSounds();
    setIsFlipped(false);
    
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
      isSoundPlayingRef.current = true;
      return new Promise<void>(resolve => {
          audioRef.current.src = soundFile;
          audioRef.current.onended = () => {
            isSoundPlayingRef.current = false;
            resolve();
          };
          audioRef.current.onerror = () => {
            isSoundPlayingRef.current = false;
            resolve();
          };
          audioRef.current.play();
      });
  }, []);

  useEffect(() => {
    if (currentIndex === null || !isPlaying) {
      return;
    }

    const letterInfo = selectedModule.letters?.[currentIndex];
    if (!letterInfo) return;

    const runAsync = async () => {
        await playSoundOnce(letterInfo.sound);
    }

    if (isAutoplayEnabled) {
      runAsync();
    }

    return () => {
        stopAllSounds();
    };
  }, [currentIndex, isPlaying, selectedModule.letters, playSoundOnce, stopAllSounds, isAutoplayEnabled]);


  const handleShuffle = useCallback(() => {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
    
    stopAllSounds();
    setIsFlipped(false);

    setTimeout(() => {
      if (shuffledIndex >= shuffledIndices.length - 1) {
        shuffleLetters();
      } else {
        const nextShuffledIndex = shuffledIndex + 1;
        setShuffledIndex(nextShuffledIndex);
        handleLetterClick(shuffledIndices[nextShuffledIndex]);
      }
    }, 600);
  }, [shuffledIndex, shuffledIndices, shuffleLetters, handleLetterClick, stopAllSounds]);

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
    if (!isPlaying) return;
    if (navigator.vibrate) navigator.vibrate(5);
    setIsFlipped(prev => !prev);
    replaySound();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      // If the user taps (not swipes), we treat it as an interaction (flip)
      // The swipe hook handles the start/move/end logic.
      // We need to integrate tap detection safely.
      // For simplicity in this hybrid approach:
      // 1. Pass events to swipe handler
      // 2. If it's a click (short duration, small movement), trigger interaction.
      swipeHandlers.onTouchStart(e as unknown as React.TouchEvent);
  };
  
  // Custom wrapper to handle both swipe and tap
  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
      swipeHandlers.onTouchEnd();
      // Simple tap detection fallback if needed, but let's rely on the swipe hook's handlers.
      // If no swipe triggered, we can assume it's a tap if it was short?
      // Actually, for React, onClick is better for "Tap" if we ensure swipe doesn't trigger it.
      // But we have a full screen touch area.
  };

  // Improved interaction handler that distinguishes tap from swipe
  const containerRef = useRef<HTMLDivElement>(null);
  
  const onPointerUp = (e: React.PointerEvent) => {
       // We can use a simple ref to track if a swipe happened
       // But let's simplify: 
       // We'll use the useSwipe hook for swipes.
       // We'll use a simple onClick for the flip, but we need to ensure swipe doesn't trigger click.
       // A common pattern is to check distance in onPointerUp
       swipeHandlers.onTouchEnd();
  }

  const replaySound = async () => {
    if (currentIndex === null) return;
    const letterInfo = selectedModule.letters?.[currentIndex];
    if (!letterInfo) return;

    await playSoundOnce(letterInfo.sound);
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
        className="fixed inset-0 select-none flex flex-col overflow-hidden pb-48 md:pb-24 touchable-area" 
        onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
        onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
        onTouchEnd={(e) => swipeHandlers.onTouchEnd()}
        onClick={handleInteraction}
    >
      <header className="flex items-center justify-between p-4 flex-shrink-0 w-full">
        <Link href="/" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} className="z-50 flex items-center justify-center w-20 h-20 rounded-full bg-secondary hover:bg-border text-secondary-foreground transition-colors focus:outline-none focus:ring-0 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </Link>
      </header>

      <div 
        className="flex-1 flex flex-col justify-center relative overflow-hidden"
      >
        {/* Swipe Indicators (Visual Only) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1/6 flex items-center justify-center opacity-0 pointer-events-none">
             {/* Removed click handlers, just visual now if we wanted, or kept hidden */}
        </div>
        
        <main 
            className="flex flex-col items-center justify-center mt-[2vh] md:-mt-24 w-full h-full"
        >
          {currentIndex !== null && currentDisplayData && (
            <div className="w-full flex justify-center items-center" style={{ perspective: '1000px' }}>
              <div key={currentIndex} className={`card ${isFlipped ? 'is-flipped' : ''}`} style={{ width: 'clamp(300px, 95vmin, 600px)', height: 'clamp(300px, 95vmin, 600px)' }}>
                <div className="card-face card-face-front">
                  <h2 className={`font-semibold ${getLetterColors(currentDisplayData.letter).text}`} style={{ fontSize: 'clamp(15rem, 80vmin, 30rem)' }}>
                    {currentDisplayData.letter}
                  </h2>
                </div>
                <div className="card-face card-face-back">
                  <h2 className={`font-semibold ${getLetterColors(currentDisplayData.letter).text}`} style={{ fontSize: 'clamp(12rem, 70vmin, 25rem)' }}>
                    {currentDisplayData.letter.toLowerCase()}
                  </h2>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <div className="h-48 md:h-24 flex-shrink-0" />
      <div className="fixed bottom-6 left-0 right-0 h-48 md:h-32 z-50 flex items-center justify-center">
        <button
          onPointerDown={(e) => { e.stopPropagation(); if (voices.length > 0) { handleShuffle(); } e.currentTarget.blur(); }}
          onClick={(e) => e.stopPropagation()}
          disabled={voices.length === 0}
          className={`w-full h-full flex items-center justify-center transition-transform active:scale-95 text-secondary-foreground opacity-30 hover:opacity-30 ${voices.length === 0 && 'opacity-50 cursor-not-allowed'}`}
        >
          <Shuffle className="w-16 h-16 md:w-20 md:h-20" />
        </button>
      </div>
    </div>
  );
}