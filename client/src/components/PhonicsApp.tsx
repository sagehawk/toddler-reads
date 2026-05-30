import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { getLetterColors } from '../lib/colorUtils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useSwipe } from '@/hooks/useSwipe';
import { motion, AnimatePresence } from 'framer-motion';
import { TrayMenu } from '@/components/TrayMenu';
import { ThemeToggle } from '@/components/ThemeToggle';

// ----- Real-time Bubbly Sound Synthesis for Tactile Toddler Interactions -----
const playCardTransitionChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.22);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {}
};

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
  const [isPulsing, setIsPulsing] = useState(false);
  const [soundToggle, setSoundToggle] = useState<'phonic' | 'name'>('phonic');

  // Always reset manual tap toggle back to phonic first when entering a new letter
  useEffect(() => {
    setSoundToggle('phonic');
  }, [currentIndex]);

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
    setIsPulsing(false);
  }, [stop, stopAllTimers]);

  const handleLetterClick = useCallback((index: number) => {
    stopAllSounds();

    const letterInfo = selectedModule.letters?.[index];
    if (!letterInfo) return;

    setCurrentIndex(index);
    setIsPlaying(false);
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
    setIsPulsing(true);
    return new Promise<void>(resolve => {
      audioRef.current.src = soundFile;
      audioRef.current.onended = () => {
        isSoundPlayingRef.current = false;
        setIsPulsing(false);
        resolve();
      };
      audioRef.current.onerror = () => {
        isSoundPlayingRef.current = false;
        setIsPulsing(false);
        resolve();
      };
      audioRef.current.play().catch(() => {
        isSoundPlayingRef.current = false;
        setIsPulsing(false);
        resolve();
      });
    });
  }, []);

  const replaySound = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex === null) return;
    const letterInfo = selectedModule.letters?.[currentIndex];
    if (!letterInfo) return;

    stopAllSounds();

    if (soundToggle === 'phonic') {
      // Tap 1: Play phonic MP3 sound, and animate a pulse
      setIsPulsing(true);
      await playSoundOnce(letterInfo.sound);
      setIsPulsing(false);
      setSoundToggle('name'); // Toggle to TTS letter name next
    } else {
      // Tap 2: Speak TTS letter name, and animate a pulse
      const textToSpeak = letterInfo.letter.toUpperCase() === 'Z' ? 'Zee' : letterInfo.letter;
      setIsPulsing(true);
      await speak(textToSpeak, {
        voice: femaleVoice,
        rate: 1.0,
        onEnd: () => setIsPulsing(false)
      });
      setIsPulsing(false);
      setSoundToggle('phonic'); // Toggle back to phonic sound next
    }
  }, [currentIndex, selectedModule.letters, playSoundOnce, stopAllSounds, speak, femaleVoice, soundToggle]);

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

      // 1. Delay the MP3 by a second so they get the chance to recognize it and say it themselves
      await new Promise(r => setTimeout(r, 1000));
      if (isCancelled) return;

      // 2. Play the MP3 audio first
      if (isAutoplayEnabled) {
        await playSoundOnce(letterInfo.sound);
      }
      if (isCancelled) return;

      // 3. Wait a brief delay after the audio ends before saying the TTS (delayed by an additional second)
      await new Promise(r => setTimeout(r, 1600));
      if (isCancelled) return;

      // 4. Speak the TTS letter name second
      if (isAutoplayEnabled) {
        const textToSpeak = letterInfo.letter.toUpperCase() === 'Z' ? 'Zee' : letterInfo.letter;
        setIsPulsing(true);
        speak(textToSpeak, {
          voice: femaleVoice,
          rate: 1.0,
          onEnd: () => setIsPulsing(false)
        });
        setTimeout(() => setIsPulsing(false), 1200);
      }
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
    playCardTransitionChime();

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
      className="fixed inset-0 select-none flex flex-col overflow-hidden touchable-area bg-[#FFFDF9] dark:bg-[#000000]"
      onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
      onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
      onTouchEnd={(e) => swipeHandlers.onTouchEnd()}
      onClick={handleInteraction}
    >
      <header className="absolute top-0 left-0 w-full p-4 z-50 flex items-center justify-between pointer-events-none">
        <TrayMenu currentPageId="phonics" />

        {/* Rainbow Pop-It progress tracker */}
        <div className="flex-1 mx-4 max-w-[280px] flex items-center justify-center pointer-events-auto">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {shuffledIndices.map((letterIdx, idx) => {
              const isCompleted = idx < shuffledIndex;
              const isCurrent = idx === shuffledIndex;
              
              // Generate a cute rainbow color based on the index
              const hue = (idx * 360 / Math.max(shuffledIndices.length, 1)) % 360;
              
              return (
                <motion.div
                  key={idx}
                  className="w-3.5 h-3.5 rounded-full border shadow-sm relative flex items-center justify-center"
                  style={{
                    borderColor: isCompleted 
                      ? `hsl(${hue}, 70%, 45%)` 
                      : isCurrent 
                      ? `hsl(${hue}, 80%, 50%)` 
                      : 'rgba(156, 163, 175, 0.3)',
                    backgroundColor: isCompleted
                      ? `hsl(${hue}, 65%, 55%)`
                      : isCurrent
                      ? `hsl(${hue}, 80%, 65%)`
                      : 'rgba(156, 163, 175, 0.1)',
                  }}
                  animate={
                    isCurrent 
                      ? { scale: [1, 1.3, 1.25], boxShadow: `0 0 10px hsl(${hue}, 80%, 60%)` } 
                      : isCompleted 
                      ? { scale: [1, 1.15, 1], opacity: 1 } 
                      : { scale: 1, opacity: 0.4 }
                  }
                  transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                />
              );
            })}
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
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-center" style={{ width: 'clamp(300px, 85vmin, 550px)', height: 'clamp(300px, 85vmin, 550px)' }}>
                  <motion.h2
                    onClick={replaySound}
                    className={`font-black cursor-pointer pointer-events-auto select-none ${getLetterColors(currentDisplayData.letter).text}`}
                    animate={isPulsing ? { scale: 1.25 } : { scale: [1, 1.04, 1] }}
                    transition={isPulsing ? { type: 'spring', stiffness: 200, damping: 10 } : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      fontSize: 'clamp(14rem, 60vmin, 24rem)',
                      fontFamily: "'Nunito', sans-serif",
                      textShadow: '2px 4px 8px rgba(0,0,0,0.08)',
                      lineHeight: 1,
                    }}
                  >
                    {currentDisplayData.letter}
                  </motion.h2>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}