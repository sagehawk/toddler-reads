import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

import catImage from '../assets/animals/cat.png';
import dogImage from '../assets/animals/dog.png';
import fishImage from '../assets/animals/fish.png';
import lionImage from '../assets/animals/lion.png';
import turtleImage from '../assets/animals/turtle.png';
import pandaImage from '../assets/animals/panda.png';
import duckImage from '../assets/animals/duck.png';
import cowImage from '../assets/animals/cow.png';
import tigerImage from '../assets/animals/tiger.png';
import elephantImage from '../assets/animals/elephant.png';

import { getLetterColors } from '../lib/colorUtils';

const animalData = [
  { name: 'Cat', type: 'Syllable Pop', parts: [{ text: 'C', colors: getLetterColors('C') }, { text: 'AT', colors: getLetterColors('A') }], image: catImage },
  { name: 'Dog', type: 'Syllable Pop', parts: [{ text: 'D', colors: getLetterColors('D') }, { text: 'OG', colors: getLetterColors('O') }], image: dogImage },
  { name: 'Panda', type: 'Syllable Pop', parts: [{ text: 'PAN', colors: getLetterColors('P') }, { text: 'DA', pronunciation: 'Duh', colors: getLetterColors('A') }], image: pandaImage },
  { name: 'Duck', type: 'Sound String', parts: [{ text: 'D', colors: getLetterColors('D') }, { text: 'U', colors: getLetterColors('U') }, { text: 'CK', pronunciation: '/ka/', colors: getLetterColors('C') }], image: duckImage },
  { name: 'Fish', type: 'Sound String', parts: [{ text: 'F', colors: getLetterColors('F') }, { text: 'I', colors: getLetterColors('I') }, { text: 'SH', pronunciation: 'sh', colors: getLetterColors('S') }], image: fishImage },
  { name: 'Cow', type: 'Sound String', parts: [{ text: 'C', colors: getLetterColors('C') }, { text: 'OW', colors: getLetterColors('O') }], image: cowImage },
  { name: 'Lion', pronunciation: 'Lie-on', type: 'Syllable Chunk', parts: [{ text: 'LI', pronunciation: 'Lie', colors: getLetterColors('L') }, { text: 'ON', colors: getLetterColors('O') }], image: lionImage },
  { name: 'Tiger', type: 'Syllable Chunk', parts: [{ text: 'TI', pronunciation: 'Tie', colors: getLetterColors('T') }, { text: 'GER', colors: getLetterColors('G') }], image: tigerImage },
  { name: 'Turtle', type: 'Syllable Chunk', parts: [{ text: 'TUR', colors: getLetterColors('T') }, { text: 'TLE', pronunciation: 'Tull', colors: getLetterColors('L') }], image: turtleImage },
  { name: 'Elephant', type: 'Syllable Chunk', parts: [{ text: 'EL', colors: getLetterColors('E') }, { text: 'E', colors: getLetterColors('E') }, { text: 'PHANT', pronunciation: 'Fant', colors: getLetterColors('P') }], image: elephantImage },
];

const phonicsSounds: { [key: string]: string } = {
    'A': '/sounds/Phonics/Sound 01.mp3',
    'B': '/sounds/Phonics/Sound 02.mp3',
    'C': '/sounds/Phonics/Sound 03.mp3',
    'D': '/sounds/Phonics/Sound 04.mp3',
    'E': '/sounds/Phonics/Sound 05.mp3',
    'F': '/sounds/Phonics/Sound 06.mp3',
    'G': '/sounds/Phonics/Sound 07.mp3',
    'H': '/sounds/Phonics/Sound 08.mp3',
    'I': '/sounds/Phonics/Sound 09.mp3',
    'J': '/sounds/Phonics/Sound 10.mp3',
    'K': '/sounds/Phonics/Sound 11.mp3',
    'L': '/sounds/Phonics/Sound 12.mp3',
    'M': '/sounds/Phonics/Sound 13.mp3',
    'N': '/sounds/Phonics/Sound 14.mp3',
    'O': '/sounds/Phonics/Sound 15.mp3',
    'P': '/sounds/Phonics/Sound 16.mp3',
    'Q': '/sounds/Phonics/Sound 17.mp3',
    'R': '/sounds/Phonics/Sound 18.mp3',
    'S': '/sounds/Phonics/Sound 19.mp3',
    'T': '/sounds/Phonics/Sound 20.mp3',
    'U': '/sounds/Phonics/Sound 21.mp3',
    'V': '/sounds/Phonics/Sound 22.mp3',
    'W': '/sounds/Phonics/Sound 23.mp3',
    'X': '/sounds/Phonics/Sound 24.mp3',
    'Y': '/sounds/Phonics/Sound 25.mp3',
    'Z': '/sounds/Phonics/Sound 26.mp3',
};

const AnimalsApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedParts, setCompletedParts] = useState<string[]>([]);
  const { speak, stop, voices } = useSpeechSynthesis();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isWheeling = useRef(false);

  const currentAnimal = animalData[currentIndex];

  const femaleVoice = voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices?.find(v => v.lang.startsWith('en'));

  const stopAllSounds = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stop();
  }, [stop]);

  const playSound = useCallback((soundFile: string) => {
    stopAllSounds();
    return new Promise<void>(resolve => {
        const audio = new Audio(soundFile);
        audioRef.current = audio;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play();
    });
  }, [stopAllSounds]);

  const selectAnimal = (index: number) => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    stopAllSounds();
    setCompletedParts([]);
    setCurrentIndex(index);

    itemRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };

  useEffect(() => {
    const slider = scrollContainerRef.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      slider.classList.remove('active');
    };

    const handleMouseUp = () => {
      isDown = false;
      slider.classList.remove('active');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; //scroll-fast
      slider.scrollLeft = scrollLeft - walk;
    };

    const onWheel = (e: WheelEvent) => {
      if (isWheeling.current) return;
      e.preventDefault();
      isWheeling.current = true;
      
      slider.scrollLeft += e.deltaY;

      setTimeout(() => {
        isWheeling.current = false;
      }, 100); // Cooldown period
    };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);
    slider.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);
      slider.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      stopAllSounds(); // Stop sounds when leaving the page
    };
  }, [stopAllSounds]);

  const handlePartClick = async (part: { text: string, colors: any, pronunciation?: string }) => {
    // Do nothing if the part is already completed
    if (completedParts.includes(part.text)) return;

    // Immediately update state to make button disappear
    const newCompletedParts = [...completedParts, part.text];
    setCompletedParts(newCompletedParts);

    const textToSpeak = part.pronunciation || part.text;

    // Play sound
    if (part.text.length === 1 && phonicsSounds[part.text.toUpperCase()]) {
      await playSound(phonicsSounds[part.text.toUpperCase()]);
    } else {
      if (femaleVoice) await speak(textToSpeak, { voice: femaleVoice });
    }

    // Check if all parts are now complete
    if (newCompletedParts.length === currentAnimal.parts.length) {
      if (femaleVoice) {
        const fullWordToSpeak = currentAnimal.pronunciation || currentAnimal.name;
        await speak(fullWordToSpeak, { voice: femaleVoice });
      }
      // Set a timeout to reset the current animal's state
      resetTimeoutRef.current = setTimeout(() => {
        setCompletedParts([]);
      }, 1500);
    }
  };

  return (
    <div className="h-screen bg-background select-none flex flex-col overflow-hidden">
      <header className="flex items-center p-4 flex-shrink-0 w-full">
        <Link href="/">
          <Button variant="outline">← Home</Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-center gap-8 mb-8">
          <h2 className="text-8xl font-bold tracking-widest">
            {currentAnimal.parts.map((part, index) => (
              <span key={index} className={`transition-colors duration-500 ${completedParts.includes(part.text) ? part.colors.text : 'text-gray-300'}`}>
                {part.text}
              </span>
            ))}
          </h2>
          {currentAnimal.image && (
            <img 
              key={currentIndex} // This key will force a remount when the animal changes
              src={currentAnimal.image} 
              alt={currentAnimal.name} 
              className={`w-48 h-48 transition-opacity duration-500 ${completedParts.length === currentAnimal.parts.length ? 'opacity-100' : 'opacity-20'} select-none object-contain`}
              draggable="false"
            />
          )}
        </div>

        <div className="flex gap-4">
          {currentAnimal.parts.map((part, index) => (
            <Button 
              key={index} 
              size="lg" 
              className={`text-4xl p-8 ${completedParts.includes(part.text) ? 'invisible' : ''} ${part.colors.background} ${part.colors.darkText}`}
              onClick={() => handlePartClick(part)}
            >
              {part.text}
            </Button>
          ))}
        </div>
      </main>

      <div className="w-full flex-shrink-0 p-4">
        <div 
          ref={scrollContainerRef} 
          className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto overflow-x-auto pb-4 custom-scrollbar cursor-grab active:cursor-grabbing"
        >
          <div className="flex flex-nowrap -ml-2 md:-ml-4">
            {animalData.map((animal, index) => (
              <div key={animal.name} className="pl-2 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 flex-shrink-0">
                <button 
                  ref={el => itemRefs.current[index] = el}
                  onClick={() => selectAnimal(index)}
                  className={`p-2 rounded-lg border-4 transition-all w-full ${currentIndex === index ? 'border-primary' : 'border-transparent'}`}>
                  <div className="w-full aspect-square bg-muted rounded flex items-center justify-center">
                    {animal.image ? <img src={animal.image} alt={animal.name} className="w-full h-full object-cover rounded-sm select-none" draggable="false" /> : <span className="text-sm text-gray-500">{animal.name}</span>}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalsApp;