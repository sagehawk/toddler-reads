import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { Shuffle } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

// Import images
import antImage from '../assets/animals/ant.png';
import appleImage from '../assets/animals/apple.png';
import ballImage from '../assets/animals/ball.png';
import boxImage from '../assets/animals/box.png';
import catImage from '../assets/animals/cat.png';
import cowImage from '../assets/animals/cow.png';
import dogImage from '../assets/animals/dog.png';
import duckImage from '../assets/animals/duck.png';
import eggImage from '../assets/animals/egg.png';
import elephantImage from '../assets/animals/elephant.png';
import fishImage from '../assets/animals/fish.png';
import goatImage from '../assets/animals/goat.png';
import hatImage from '../assets/animals/hat.png';
import iceImage from '../assets/animals/ice.png';
import iglooImage from '../assets/animals/igloo.png';
import juiceImage from '../assets/animals/juice.png';
import keyImage from '../assets/animals/key.png';
import lionImage from '../assets/animals/lion.png';
import moonImage from '../assets/animals/moon.png';
import nestImage from '../assets/animals/nest.png';
import orangeImage from '../assets/animals/orange.png';
import pandaImage from '../assets/animals/panda.png';
import pizzaImage from '../assets/animals/pizza.png';
import quackImage from '../assets/animals/quack.png';
import rabbitImage from '../assets/animals/rabbit.png';
import sunImage from '../assets/animals/sun.png';
import tigerImage from '../assets/animals/tiger.png';
import turtleImage from '../assets/animals/turtle.png';
import umbrellaImage from '../assets/animals/umbrella.png';
import vacuumImage from '../assets/animals/vacuum.png';
import watermelonImage from '../assets/animals/watermelon.png';
import yogurtImage from '../assets/animals/yogurt.png';
import zebraImage from '../assets/animals/zebra.png';

const wordImageMap: { [key: string]: string } = {
  'ant': antImage,
  'apple': appleImage,
  'ball': ballImage,
  'box': boxImage,
  'cat': catImage,
  'cow': cowImage,
  'dog': dogImage,
  'duck': duckImage,
  'egg': eggImage,
  'elephant': elephantImage,
  'fish': fishImage,
  'goat': goatImage,
  'hat': hatImage,
  'ice': iceImage,
  'igloo': iglooImage,
  'juice': juiceImage,
  'key': keyImage,
  'lion': lionImage,
  'moon': moonImage,
  'nest': nestImage,
  'orange': orangeImage,
  'panda': pandaImage,
  'pizza': pizzaImage,
  'quack': quackImage,
  'rabbit': rabbitImage,
  'sun': sunImage,
  'tiger': tigerImage,
  'turtle': turtleImage,
  'umbrella': umbrellaImage,
  'vacuum': vacuumImage,
  'watermelon': watermelonImage,
  'yogurt': yogurtImage,
  'zebra': zebraImage,
};

const sentences = [
  "the cat has a hat",
  "a dog and a panda",
  "the fish is in a box",
  "a turtle and a rabbit",
  "the sun is up",
  "the cow on the moon",
  "an elephant has an apple",
  "a lion and a tiger",
  "the duck has an egg",
  "a goat in an igloo",
  "a zebra has a watermelon",
  "the key is in the box",
  "a rabbit has a ball",
  "the cat sat on the mat",
  "a dog has a ball",
  "the fish is in the sun",
  "a panda has a hat",
  "the cow is on the moon",
];

const SentencesApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const { speak, voices } = useSpeechSynthesis();
  const femaleVoice = voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices?.find(v => v.lang.startsWith('en'));

  const shuffleSentences = useCallback(() => {
    const indices = sentences.map((_, i) => i);
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
    shuffleSentences();
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
      shuffleSentences();
    } else {
      handleNext();
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  const currentSentence = sentences[currentIndex];
  const words = currentSentence.split(' ');

  useEffect(() => {
    speak(currentSentence, { voice: femaleVoice ?? null });
  }, [currentSentence, femaleVoice, speak]);

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;

    if (clickX < screenWidth / 4) {
      handlePrevious();
    } else if (clickX > screenWidth * 3 / 4) {
      handleNext();
    } else {
      speak(currentSentence, { voice: femaleVoice ?? null });
    }
  };

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
        <main className="relative flex flex-col items-center justify-center text-center p-4">
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

          <div className="flex flex-wrap justify-center items-start gap-x-4 gap-y-8 animate-fade-in">
            {words.map((word, index) => (
              <div key={index} className="flex flex-col items-center gap-y-2">
                <span className="text-6xl md:text-6xl font-bold tracking-wider">{word}</span>
                {wordImageMap[word.toLowerCase()] && (
                  <img 
                    src={wordImageMap[word.toLowerCase()]} 
                    alt={word} 
                    className="w-32 h-32 md:w-32 md:h-32 object-contain bg-card rounded-lg p-2 shadow-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </main>

        <div className="w-full p-4 pb-8">
          <div className="w-full max-w-2xl mx-auto">
            <div className="flex justify-center items-center p-4 max-w-4xl mx-auto">
              <button
                onClick={handleShuffle}
                className={`touch-target rounded-2xl py-6 px-8 transition-all bg-gray-200 hover:bg-gray-300 text-gray-800`}
              >
                <Shuffle className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default SentencesApp;
