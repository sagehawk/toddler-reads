import { useState, useEffect, useCallback, useRef } from 'react';
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
  const { speak, stop, voices } = useSpeechSynthesis();
  const femaleVoice = voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices?.find(v => v.lang.startsWith('en'));
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = useCallback(() => {
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    stop();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % numbersData.length);
    }, 150);
  }, [numbersData.length, stop]);

  const handlePrevious = useCallback(() => {
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    stop();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + numbersData.length) % numbersData.length);
    }, 150);
  }, [numbersData.length, stop]);

  const handleShuffle = () => {
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

  const replaySound = () => {
    if (currentNumber) {
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
      stop();
      audioTimeoutRef.current = setTimeout(() => {
        speak(String(currentNumber), { voice: femaleVoice ?? null });
      }, 1000); // 1 second delay
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;

    if (clickX < screenWidth / 4) {
      handlePrevious();
    } else if (clickX > screenWidth * 3 / 4) {
      handleNext();
    } else {
      replaySound();
      setIsFlipped(!isFlipped);
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

  const Dot = ({ color }: { color: string }) => (
    <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${color} rounded-full`} />
  );
  
  const DieFace = ({ count, color }: { count: number, color: string }) => {
    const patterns: { [key: number]: React.ReactNode } = {
        1: <div className="flex justify-center items-center w-full h-full"><Dot color={color} /></div>,
        2: <div className="grid grid-cols-2 gap-4 w-full h-full p-4 place-items-center"><div className="self-start justify-self-start"><Dot color={color} /></div><div className="self-end justify-self-end"><Dot color={color} /></div></div>,
        3: <div className="grid grid-cols-3 grid-rows-3 gap-6 w-full h-full p-4 place-items-center"><div className="self-start justify-self-start"><Dot color={color} /></div><div><Dot color={color} /></div><div className="self-end justify-self-end"><Dot color={color} /></div></div>,
        4: <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full p-4 place-items-center"><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /></div>,
        5: <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full p-4 place-items-center"><div className="col-start-1 row-start-1"><Dot color={color} /></div><div className="col-start-3 row-start-1"><Dot color={color} /></div><div className="col-start-2 row-start-2"><Dot color={color} /></div><div className="col-start-1 row-start-3"><Dot color={color} /></div><div className="col-start-3 row-start-3"><Dot color={color} /></div></div>,
        6: <div className="grid grid-cols-2 grid-rows-3 gap-4 w-full h-full p-4 place-items-center"><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /></div>,
        7: <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full p-4 place-items-center"><div className="col-start-1 row-start-1"><Dot color={color} /></div><div className="col-start-3 row-start-1"><Dot color={color} /></div><div className="col-start-2 row-start-2"><Dot color={color} /></div><div className="col-start-1 row-start-3"><Dot color={color} /></div><div className="col-start-3 row-start-3"><Dot color={color} /></div><div className="col-start-2 row-start-1"><Dot color={color} /></div><div className="col-start-2 row-start-3"><Dot color={color} /></div></div>,
        8: <div className="grid grid-cols-2 grid-rows-4 gap-4 w-full h-full p-4 place-items-center"><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /></div>,
        9: <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full p-4 place-items-center"><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /></div>,
        10: <div className="grid grid-cols-2 grid-rows-5 gap-4 w-full h-full p-4 place-items-center"><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /><Dot color={color} /></div>,
    };
    return <div className="w-64 h-64 flex justify-center items-center">{patterns[count]}</div>;
  };

  const DotsDisplay = ({ count, color }: { count: number, color: string }) => {
    return <DieFace count={count} color={color} />;
  };

  const numberColor = getLetterColors(String(currentNumber === 10 ? 0 : currentNumber));
  const [dots, setDots] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (currentNumber) {
      setDots(<DotsDisplay count={currentNumber} color={numberColor.background} />);
    }
  }, [currentNumber, numberColor.background]);

  return (
    <div className="fixed inset-0 bg-background select-none flex flex-col justify-between overflow-hidden" onPointerDown={handlePointerDown}>
      <header className="flex items-center justify-between p-4 flex-shrink-0 w-full">
        <Link href="/" onClick={(e) => e.stopPropagation()} className="z-50 flex items-center justify-center w-20 h-20 rounded-full bg-secondary hover:bg-border text-secondary-foreground transition-colors focus:outline-none focus:ring-0 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </Link>
        <button onClick={(e) => { e.stopPropagation(); setIsQuietMode(!isQuietMode); }} className="z-50 flex items-center justify-center w-20 h-20 rounded-full bg-secondary hover:bg-border text-secondary-foreground transition-colors focus:outline-none focus:ring-0 opacity-50">
          {isQuietMode ? <VolumeX className="w-12 h-12" /> : <Volume2 className="w-12 h-12" />}
        </button>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-start text-center px-4 overflow-hidden pb-48 md:pb-24 mt-[10vh] md:-mt-[25vh]">
        <div className="absolute left-0 top-0 h-full w-1/4 flex items-center justify-center opacity-80 md:opacity-20 md:hover:opacity-80 transition-opacity" onClick={(e) => {e.stopPropagation(); handlePrevious();}}>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/4 flex items-center justify-center opacity-80 md:opacity-20 md:hover:opacity-80 transition-opacity" onClick={(e) => {e.stopPropagation(); handleNext();}}>
        </div>

        <div className="w-full flex justify-center items-center" style={{ perspective: '1000px' }}>
            <div className={`card ${isFlipped ? 'is-flipped' : ''}`} style={{ width: 'clamp(300px, 80vw, 800px)', height: 'clamp(300px, 80vw, 600px)' }}>
              <div className="card-face card-face-front">
                <h2 className={`text-[15rem] lg:text-[20rem] xl:text-[25rem] font-bold tracking-widest cursor-pointer ${numberColor.text}`}>
                  {currentNumber}
                </h2>
              </div>
              <div className="card-face card-face-back">
                {dots}
              </div>
            </div>
          </div>
      </main>

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

export default NumbersApp;