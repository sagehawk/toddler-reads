import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { getLetterColors } from '../lib/colorUtils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useSwipe } from '@/hooks/useSwipe';
import { motion, AnimatePresence } from 'framer-motion';
import { TrayMenu } from '@/components/TrayMenu';
import { ThemeToggle } from '@/components/ThemeToggle';

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
      // Wait for the letter fade-in animation to finish (~400ms)
      await new Promise(r => setTimeout(r, 400));
      if (isCancelled) return;

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
      className="fixed inset-0 select-none flex flex-col overflow-hidden touchable-area bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800"
      onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
      onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
      onTouchEnd={(e) => swipeHandlers.onTouchEnd()}
      onClick={handleInteraction}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-200/30 dark:bg-amber-500/10"
            style={{
              width: 8 + i * 3,
              height: 8 + i * 3,
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i * 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <header className="absolute top-0 left-0 w-full p-4 z-50 flex items-center justify-between pointer-events-none">
        <TrayMenu currentPageId="phonics" />

        {/* Progress bar */}
        <div className="flex-1 mx-6 max-w-xs pointer-events-none">
          <div className="h-2 rounded-full bg-gray-200/50 dark:bg-gray-700/50 overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: `${shuffledIndices.length > 0 ? ((shuffledIndex + 1) / shuffledIndices.length) * 100 : 0}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center relative overflow-hidden w-full">
        <main className="flex flex-col items-center justify-center w-full h-full">
          <AnimatePresence mode="wait">
            {currentIndex !== null && currentDisplayData && (
              <motion.div
                key={currentIndex}
                className="w-full flex justify-center items-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="flex items-center justify-center" style={{ width: 'clamp(300px, 85vmin, 550px)', height: 'clamp(300px, 85vmin, 550px)' }}>
                  <h2
                    className={`font-black ${getLetterColors(currentDisplayData.letter).text}`}
                    style={{
                      fontSize: 'clamp(14rem, 60vmin, 24rem)',
                      fontFamily: "'Nunito', sans-serif",
                      textShadow: '2px 4px 8px rgba(0,0,0,0.08)',
                      lineHeight: 1,
                    }}
                  >
                    {currentDisplayData.letter}
                  </h2>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


        </main>
      </div>
    </div>
  );
}