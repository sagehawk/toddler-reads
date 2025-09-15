import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { getLetterColors } from '../lib/colorUtils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Progress } from "@/components/ui/progress";
import logoUrl from '../assets/toddler-reads-logo.png';
import appleImg from '../assets/animals/apple.png';
import ballImg from '../assets/animals/ball.png';
import catImg from '../assets/animals/cat.png';
import dogImg from '../assets/animals/dog.png';
import eggImg from '../assets/animals/egg.png';
import fishImg from '../assets/animals/fish.png';
import goatImg from '../assets/animals/goat.png';
import hatImg from '../assets/animals/hat.png';
import iceImg from '../assets/animals/ice.png';
import juiceImg from '../assets/animals/juice.png';
import keyImg from '../assets/animals/key.png';
import lionImg from '../assets/animals/lion.png';
import moonImg from '../assets/animals/moon.png';
import nestImg from '../assets/animals/nest.png';
import orangeImg from '../assets/animals/orange.png';
import pizzaImg from '../assets/animals/pizza.png';
import quackImg from '../assets/animals/quack.png';
import rabbitImg from '../assets/animals/rabbit.png';
import sunImg from '../assets/animals/sun.png';
import turtleImg from '../assets/animals/turtle.png';
import umbrellaImg from '../assets/animals/umbrella.png';
import vacuumImg from '../assets/animals/vacuum.png';
import watermelonImg from '../assets/animals/watermelon.png';
import boxImg from '../assets/animals/box.png';
import yogurtImg from '../assets/animals/yogurt.png';
import zebraImg from '../assets/animals/zebra.png';

const letterImages: { [key: string]: string } = {
  A: appleImg, B: ballImg, C: catImg, D: dogImg, E: eggImg, F: fishImg, G: goatImg, H: hatImg, I: iceImg, J: juiceImg, K: keyImg, L: lionImg, M: moonImg, N: nestImg, O: orangeImg, P: pizzaImg, Q: quackImg, R: rabbitImg, S: sunImg, T: turtleImg, U: umbrellaImg, V: vacuumImg, W: watermelonImg, X: boxImg, Y: yogurtImg, Z: zebraImg,
};

const letterWords: { [key: string]: string } = {
  A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Egg', F: 'Fish', G: 'Goat', H: 'Hat', I: 'Ice', J: 'Juice', K: 'Key', L: 'Lion', M: 'Moon', N: 'Nest', O: 'Orange', P: 'Pizza', Q: 'Quack', R: 'Rabbit', S: 'Sun', T: 'Turtle', U: 'Umbrella', V: 'Vacuum', W: 'Watermelon', X: 'Box', Y: 'Yogurt', Z: 'Zebra',
};

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
  const [displayState, setDisplayState] = useState('LETTER'); // LETTER, WORD
  const [isPlaying, setIsPlaying] = useState(false);
  const { speak, stop, voices } = useSpeechSynthesis();
  const [progress, setProgress] = useState(0);
  const [femaleVoice, setFemaleVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const loopShouldContinue = useRef(false);

  const selectedModule = learningModules[0];

  useEffect(() => {
    if (voices && voices.length > 0) {
        const foundVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices.find(v => v.lang.startsWith('en'));
        setFemaleVoice(foundVoice || null);
    }
  }, [voices]);

  const stopAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
  }, []);

  const stopAllSounds = useCallback(() => {
    loopShouldContinue.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stop(); // Stop TTS
    stopAllTimers();
  }, [stop, stopAllTimers]);

  const waitWithProgress = useCallback((duration: number) => {
    stopAllTimers();
    return new Promise<void>(resolve => {
      setProgress(0);
      const startTime = Date.now();
      
      intervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min((elapsedTime / duration) * 100, 100);
        setProgress(currentProgress);
      }, 50);

      timeoutRef.current = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setProgress(100);
        resolve();
      }, duration);
    });
  }, [stopAllTimers]);

  const playSoundOnce = useCallback((soundFile: string) => {
      stopAllSounds();
      return new Promise<void>(resolve => {
          const audio = new Audio(soundFile);
          audioRef.current = audio;
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
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
        if (displayState === 'LETTER') {
            loopShouldContinue.current = true;
            while (loopShouldContinue.current) {
                await playSoundOnce(letterInfo.sound);
                if (!loopShouldContinue.current) break;
                await waitWithProgress(4000);
            }
        } else if (displayState === 'WORD') {
            loopShouldContinue.current = false;
            stopAllTimers();
            if (femaleVoice) {
                speak(letterWords[letterInfo.letter], { voice: femaleVoice });
            }
        }
    }

    runAsync();

    return () => {
        loopShouldContinue.current = false;
        stopAllSounds();
    };
  }, [currentIndex, displayState, isPlaying, selectedModule.letters, femaleVoice, playSoundOnce, waitWithProgress, speak, stopAllSounds, stopAllTimers]);


  const handleTrayClick = (index: number) => {
    stopAllSounds();
    
    const letterInfo = selectedModule.letters?.[index];
    if (!letterInfo) return;

    if (currentIndex === index && isPlaying) {
        setDisplayState(prevState => prevState === 'LETTER' ? 'WORD' : 'LETTER');
    } else {
        setCurrentIndex(index);
        setIsPlaying(true);
        setDisplayState('LETTER');
    }
  };

  const handleScreenClick = () => {
    if (!isPlaying) return;
    setDisplayState(prevState => prevState === 'LETTER' ? 'WORD' : 'LETTER');
  };
  
  const replaySound = async () => {
    if (currentIndex === null) return;
    const letterInfo = selectedModule.letters?.[currentIndex];
    if (!letterInfo) return;

    stopAllSounds();
    
    if (displayState === 'LETTER') {
        loopShouldContinue.current = true;
        while (loopShouldContinue.current) {
            await playSoundOnce(letterInfo.sound);
            if (!loopShouldContinue.current) break;
            await waitWithProgress(4000);
        }
    } else if (displayState === 'WORD') {
        if (femaleVoice) {
            await speak(letterWords[letterInfo.letter], { voice: femaleVoice });
        }
    }
  };

  if (!selectedModule) {
    return <div>Error: Letter module not found.</div>;
  }

  const currentDisplayData = currentIndex !== null ? selectedModule.letters?.[currentIndex] : null;

  return (
    <div className="h-screen bg-background select-none flex flex-col overflow-hidden" onClick={handleScreenClick}>
      <header className="flex items-center p-4 flex-shrink-0 w-full">
        <Link href="/">
          <Button variant="outline">← Home</Button>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 -mt-8 min-h-0">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative">
            <div className="text-center">
              {currentIndex !== null && currentDisplayData && (
                <>
                  {displayState === 'LETTER' && (
                    <span className={`font-semibold ${getLetterColors(currentDisplayData.letter).text} text-8xl sm:text-[9rem] md:text-[11rem] lg:text-[13rem] xl:text-[14rem]`}>
                      <span>{currentDisplayData.letter}</span>
                      <span className="text-6xl sm:text-[7rem] md:text-[8rem] lg:text-[9rem] xl:text-[10rem] align-baseline">{currentDisplayData.letter.toLowerCase()}</span>
                    </span>
                  )}
                  {displayState === 'WORD' && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-x-8 animate-fade-in">
                      <span className={`font-semibold text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]`}>
                        {currentDisplayData.letter === 'X' ? (
                          <>
                            <span className="text-gray-600">Bo</span>
                            <span className={getLetterColors('X').text}>x</span>
                          </>
                        ) : (
                          <>
                            <span className={getLetterColors(currentDisplayData.letter).text}>{letterWords[currentDisplayData.letter].charAt(0)}</span>
                            <span className="text-gray-600">{letterWords[currentDisplayData.letter].slice(1)}</span>
                          </>
                        )}
                      </span>
                      {letterImages[currentDisplayData.letter] && (
                         <img
                            src={letterImages[currentDisplayData.letter]}
                            alt={letterWords[currentDisplayData.letter]}
                            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 select-none"
                            draggable="false"
                         />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div onClick={(e) => { e.stopPropagation(); replaySound(); }} className="w-full max-w-md p-4 absolute bottom-0 cursor-pointer">
          <Progress value={progress} className="h-2" />
        </div>
      </main>

      <div className="w-full flex-shrink-0" data-testid="container-item-tray">
        <div className="flex flex-wrap justify-center gap-3 p-4">
          {selectedModule.letters?.map((letter, index) => {
            const colors = getLetterColors(letter.letter);
            return (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); voices.length > 0 && handleTrayClick(index); }}
                disabled={voices.length === 0}
                className={`touch-target rounded-2xl py-4 px-5 font-bold text-2xl transition-all min-w-[64px] touch-auto ${
                  currentIndex === index && isPlaying
                    ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-offset-2 ring-primary transform scale-110'
                    : `${colors.background} ${colors.hoverBackground} ${colors.darkText}`
                } ${voices.length === 0 && 'opacity-50 cursor-not-allowed'}`}
              >
                {letter.letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}