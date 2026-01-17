import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { getLetterColors } from '../lib/colorUtils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useSwipe } from '@/hooks/useSwipe';

// Interfaces are now imported from data file or defined there, but we need to import or redefine if not exported.
import { learningModules } from '../data/phonicsDecks';

// We need to update the local interface definition to match the data file we just edited
export interface PhonicsLetter {
  letter: string;
  sound: string;
  phoneticText: string;
}

export interface LearningModule {
  id: string;
  name: string;
  type: 'letters' | 'cvc';
  letters?: PhonicsLetter[];
}

import { usePreventBackExit } from '@/hooks/usePreventBackExit';

export default function PhonicsApp() {
  usePreventBackExit();
  
  const [, navigate] = useLocation();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { speak, stop, voices } = useSpeechSynthesis();
  const [femaleVoice, setFemaleVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useLocalStorage('phonicsAutoplay', true);
  
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
          audioRef.current.play().catch(() => {
            isSoundPlayingRef.current = false;
            resolve();
          });
      });
  }, []);

  // Main Sequence Effect
  useEffect(() => {
    if (currentIndex === null || !isPlaying) {
      return;
    }

    const letterInfo = selectedModule.letters?.[currentIndex];
    if (!letterInfo) return;

    let isCancelled = false;

    const runSequence = async () => {
      // 1. TTS Letter Name
      if (isAutoplayEnabled) {
        const textToSpeak = letterInfo.letter.toUpperCase() === 'Z' ? 'Zee' : letterInfo.letter;
        speak(textToSpeak, { voice: femaleVoice, rate: 1.0 });
      }

      // 2. Wait 1 second (approx)
      await new Promise(r => setTimeout(r, 1000));
      if (isCancelled) return;

      // 3. Play Sound File
      if (isAutoplayEnabled) {
        await playSoundOnce(letterInfo.sound);
      }
      
      if (isCancelled) return;
    };

    runSequence();

    return () => {
      isCancelled = true;
      stopAllSounds();
    };
  }, [currentIndex, isPlaying, selectedModule.letters, playSoundOnce, stopAllSounds, isAutoplayEnabled, speak, femaleVoice]);


  const handleShuffle = useCallback(() => {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10);
    
    stopAllSounds();

    setTimeout(() => {
      if (shuffledIndex >= shuffledIndices.length - 1) {
        shuffleLetters();
      } else {
        const nextShuffledIndex = shuffledIndex + 1;
        setShuffledIndex(nextShuffledIndex);
        handleLetterClick(shuffledIndices[nextShuffledIndex]);
      }
    }, 150);
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
    handleShuffle();
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
        className="fixed inset-0 select-none flex flex-col overflow-hidden touchable-area bg-[#FFFAF0] dark:bg-background" 
        onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
        onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
        onTouchEnd={(e) => swipeHandlers.onTouchEnd()}
        onClick={handleInteraction}
    >
      <header className="absolute top-0 left-0 w-full p-4 z-50 flex items-center justify-between">
        <button 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={(e) => {
            e.stopPropagation();
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
            navigate('/app', { replace: true });
          }} 
          className="flex items-center justify-center w-16 h-16 rounded-full bg-white/50 hover:bg-white/80 text-secondary-foreground transition-colors focus:outline-none focus:ring-0 shadow-sm backdrop-blur-sm"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </button>
      </header>

      <div 
        className="flex-1 flex flex-col justify-center relative overflow-hidden w-full"
      >
        <main 
            className="flex flex-col items-center justify-center w-full h-full"
        >
          {currentIndex !== null && currentDisplayData && (
            <div className="w-full flex justify-center items-center">
              <div key={currentIndex} className="card" style={{ width: 'clamp(300px, 95vmin, 600px)', height: 'clamp(300px, 95vmin, 600px)' }}>
                <div className="card-face card-face-front">
                  <h2 className={`font-semibold ${getLetterColors(currentDisplayData.letter).text}`} style={{ fontSize: 'clamp(12rem, 64vmin, 24rem)' }}>
                    {currentDisplayData.letter}
                  </h2>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}