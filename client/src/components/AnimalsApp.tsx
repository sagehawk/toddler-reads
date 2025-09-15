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
  const [isWordComplete, setIsWordComplete] = useState(false);
  const { speak, stop, voices } = useSpeechSynthesis();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    setIsWordComplete(false);
    setCurrentIndex(index);
  };

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
    if (completedParts.includes(part.text)) return;

    const newCompletedParts = [...completedParts, part.text];
    setCompletedParts(newCompletedParts);

    const textToSpeak = part.pronunciation || part.text;

    if (part.text.length === 1 && phonicsSounds[part.text.toUpperCase()]) {
      await playSound(phonicsSounds[part.text.toUpperCase()]);
    } else {
      if (femaleVoice) await speak(textToSpeak, { voice: femaleVoice });
    }

    if (newCompletedParts.length === currentAnimal.parts.length) {
      setIsWordComplete(true);
      if (femaleVoice) {
        const fullWordToSpeak = currentAnimal.pronunciation || currentAnimal.name;
        await speak(fullWordToSpeak, { voice: femaleVoice });
      }
      resetTimeoutRef.current = setTimeout(() => {
        setCompletedParts([]);
        setIsWordComplete(false);
      }, 1500);
    }
  };

  return (
    <div className="h-screen bg-background select-none flex flex-col overflow-hidden relative">
      <header className="flex items-center p-4 flex-shrink-0 w-full">
        <Link href="/">
          <a className="text-foreground hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </a>
        </Link>
      </header>

      {isWordComplete && currentAnimal.image && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-40 h-40">
            <img
                src={currentAnimal.image}
                alt={currentAnimal.name}
                className="w-full h-full object-contain animate-fade-in"
            />
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-start pt-20 text-center p-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <h2 className="text-6xl md:text-8xl font-bold tracking-widest">
            {currentAnimal.parts.map((part, index) => (
              <span key={index} className={`transition-colors duration-500 ${completedParts.includes(part.text) ? part.colors.text : 'text-gray-300'}`}>
                {part.text}
              </span>
            ))}
          </h2>
        </div>

        <div className="flex gap-4 mt-8">
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

      <div className="w-full flex-shrink-0 p-2">
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {animalData.map((animal, index) => (
              <div key={animal.name} className="flex-shrink-0">
                <button 
                  onClick={() => selectAnimal(index)}
                  className={`p-2 rounded-lg border-4 transition-all w-24 h-24 ${currentIndex === index ? 'border-primary' : 'border-transparent'}`}>
                  <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                    {animal.image ? <img src={animal.image} alt={animal.name} className="w-full h-full object-cover rounded-sm select-none" draggable="false" /> : <span className="text-sm text-gray-500">{animal.name}</span>}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
};

export default AnimalsApp;