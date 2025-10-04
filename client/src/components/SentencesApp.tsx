import { useState, useEffect, useCallback } from 'react';
import { Link, useRoute } from 'wouter';
import { Shuffle, ImageIcon, ImageOff } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import useLocalStorage from '@/hooks/useLocalStorage';

// Import images
import appleImage from '../assets/animals/apple.png';
import ballImage from '../assets/animals/ball.png';
import hatImage from '../assets/animals/hat.png';
import keyImage from '../assets/animals/key.png';
import boxImage from '../assets/animals/box.png';
import cupImage from '../assets/animals/cup.png';
import bedImage from '../assets/animals/bed.png';
import toyImage from '../assets/animals/toy.png';
import penImage from '../assets/animals/pen.png';
import bagImage from '../assets/animals/bag.png';
import juiceImage from '../assets/animals/juice.png';
import pizzaImage from '../assets/animals/pizza.png';
import yogurtImage from '../assets/animals/yogurt.png';
import orangeImage from '../assets/animals/orange.png';
import watermelonImage from '../assets/animals/watermelon.png';
import sunImage from '../assets/animals/sun.png';
import moonImage from '../assets/animals/moon.png';
import nestImage from '../assets/animals/nest.png';
import treeImage from '../assets/animals/tree.png';
import rockImage from '../assets/animals/rock.png';
import logImage from '../assets/animals/log.png';
import carImage from '../assets/animals/car.png';
import busImage from '../assets/animals/bus.png';
import vanImage from '../assets/animals/van.png';
import jetImage from '../assets/animals/jet.png';
import boatImage from '../assets/animals/boat.png';
import bikeImage from '../assets/animals/bike.png';
import trainImage from '../assets/animals/train.png';

import momImage from '../assets/animals/mom.png';
import dadImage from '../assets/animals/dad.png';
import kidImage from '../assets/animals/kid.png';
import manImage from '../assets/animals/man.png';
import catImage from '../assets/animals/cat.png';
import dogImage from '../assets/animals/dog.png';
import fishImage from '../assets/animals/fish.png';
import goatImage from '../assets/animals/goat.png';
import lionImage from '../assets/animals/lion.png';
import rabbitImage from '../assets/animals/rabbit.png';
import turtleImage from '../assets/animals/turtle.png';
import zebraImage from '../assets/animals/zebra.png';
import pandaImage from '../assets/animals/panda.png';
import henImage from '../assets/animals/hen.png';
import cowImage from '../assets/animals/cow.png';
import duckImage from '../assets/animals/duck.png';
import ratImage from '../assets/animals/rat.png';
import batImage from '../assets/animals/bat.png';

const wordImageMap: { [key: string]: string } = {
  'apple': appleImage,
  'ball': ballImage,
  'hat': hatImage,
  'key': keyImage,
  'box': boxImage,
  'cup': cupImage,
  'bed': bedImage,
  'toy': toyImage,
  'pen': penImage,
  'bag': bagImage,
  'juice': juiceImage,
  'pizza': pizzaImage,
  'yogurt': yogurtImage,
  'orange': orangeImage,
  'watermelon': watermelonImage,
  'sun': sunImage,
  'moon': moonImage,
  'nest': nestImage,
  'tree': treeImage,
  'rock': rockImage,
  'log': logImage,
  'car': carImage,
  'bus': busImage,
  'van': vanImage,
  'jet': jetImage,
  'boat': boatImage,
  'bike': bikeImage,
  'train': trainImage,

  'mom': momImage,
  'dad': dadImage,
  'kid': kidImage,
  'man': manImage,
  'cat': catImage,
  'dog': dogImage,
  'fish': fishImage,
  'goat': goatImage,
  'lion': lionImage,
  'rabbit': rabbitImage,
  'turtle': turtleImage,
  'zebra': zebraImage,
  'panda': pandaImage,
  'hen': henImage,
  'cow': cowImage,
  'duck': duckImage,
  'rat': ratImage,
  'bat': batImage,
};

interface Sentence {
  text: string;
  category: string;
}

export const sentences: Sentence[] = [
  { text: 'I see a cat.', category: 'Animals' },
  { text: 'The dog can run.', category: 'Animals' },
  { text: 'The hen is on a log.', category: 'Animals' },
  { text: 'We see a cow.', category: 'Animals' },
  { text: 'The rat is in a box.', category: 'Animals' },
  { text: 'A bat is on a rock.', category: 'Animals' },
  { text: 'The lion is big.', category: 'Animals' },
  { text: 'I see a fish.', category: 'Animals' },
  { text: 'The turtle can nap.', category: 'Animals' },
  { text: 'The ball is in a bag.', category: 'Things' },
  { text: 'I see a hat.', category: 'Things' },
  { text: 'The cup is on a bed.', category: 'Things' },
  { text: 'A toy is in the box.', category: 'Things' },
  { text: 'I eat an apple.', category: 'Things' },
  { text: 'We see a pizza.', category: 'Things' },
  { text: 'The key is on the bed.', category: 'Things' },
  { text: 'The kid has a pen.', category: 'Things' },
  { text: 'I see yogurt.', category: 'Things' },
  { text: 'The man has an orange.', category: 'Things' },
  { text: 'We see the sun.', category: 'Nature' },
  { text: 'The moon is up.', category: 'Nature' },
  { text: 'A nest is in a tree.', category: 'Nature' },
  { text: 'I sit on a rock.', category: 'Nature' },
  { text: 'A log is big.', category: 'Nature' },
  { text: 'I see a car.', category: 'Vehicles' },
  { text: 'The bus is big.', category: 'Vehicles' },
  { text: 'A van is in the sun.', category: 'Vehicles' },
  { text: 'I see a jet.', category: 'Vehicles' },
  { text: 'We go on a boat.', category: 'Vehicles' },
  { text: 'The kid is on a bike.', category: 'Vehicles' },
  { text: 'The train can go.', category: 'Vehicles' },

  { text: 'Mom and Dad hug.', category: 'People' },
  { text: 'I see a man.', category: 'People' },
  { text: 'The kid can hop.', category: 'People' },
  { text: 'I run to a box.', category: 'Actions' },
  { text: 'We sit on a log.', category: 'Actions' },
  { text: 'The cat can hop.', category: 'Actions' },
  { text: 'I eat an apple.', category: 'Actions' },
  { text: 'Mom and Dad hug.', category: 'Actions' },
  { text: 'The kid can nap.', category: 'Actions' },
  { text: 'We go to a tree.', category: 'Actions' },
  { text: 'I see the dog run.', category: 'Actions' },
];

const categoryOrder = ['Animals', 'Things', 'Nature', 'Vehicles', 'People', 'Actions'];

const sortedSentences = [...sentences].sort((a, b) => {
  const categoryA = categoryOrder.indexOf(a.category);
  const categoryB = categoryOrder.indexOf(b.category);
  if (categoryA !== categoryB) {
    return categoryA - categoryB;
  }
  return a.text.localeCompare(b.text);
});

const SentencesApp = () => {
  const [match, params] = useRoute("/sentences/:category?");
  const category = params?.category;

  const filteredSentences = (category && category !== 'all')
    ? sortedSentences.filter(item => item.category.toLowerCase().replace(/[\s/]+/g, '-') === category)
    : sortedSentences;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [shuffledIndex, setShuffledIndex] = useState(0);
  const [tappedNouns, setTappedNouns] = useState<string[]>([]);
  const [showImages, setShowImages] = useLocalStorage('sentenceShowImages', true);
  const { speak, voices } = useSpeechSynthesis();
  const femaleVoice = voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices?.find(v => v.lang.startsWith('en'));

  const currentSentence = filteredSentences[currentIndex]?.text;
  const words = currentSentence ? currentSentence.split(' ') : [];
  const nounsInSentence = words.map(word => word.toLowerCase().replace('.', '')).filter(word => Object.keys(wordImageMap).includes(word));

  const shuffleSentences = useCallback(() => {
    const indices = filteredSentences.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledIndices(indices);
    setShuffledIndex(0);
  }, [filteredSentences]);

  useEffect(() => {
    shuffleSentences();
  }, [category]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredSentences.length);
    setTappedNouns([]);
  }, [filteredSentences.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredSentences.length) % filteredSentences.length);
    setTappedNouns([]);
  }, [filteredSentences.length]);

  const handleShuffle = () => {
    if (shuffledIndex >= shuffledIndices.length) {
      shuffleSentences();
      setCurrentIndex(shuffledIndices[0]);
      setShuffledIndex(1);
    } else {
      setCurrentIndex(shuffledIndices[shuffledIndex]);
      setShuffledIndex(shuffledIndex + 1);
    }
    setTappedNouns([]);
  };

  const replaySound = () => {
    if (currentSentence) {
      speak(currentSentence, { voice: femaleVoice ?? null });
    }
  };

  const handleNounTap = (noun: string) => {
    if (!tappedNouns.includes(noun)) {
      setTappedNouns([...tappedNouns, noun]);
    }
    speak(noun, { voice: femaleVoice ?? null });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        replaySound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, replaySound]);

  useEffect(() => {
    if (currentSentence) {
      speak(currentSentence, { voice: femaleVoice ?? null });
    }
  }, [currentSentence, femaleVoice, speak]);

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;

    if (clickX < screenWidth / 4) {
      handlePrevious();
    } else if (clickX > screenWidth * 3 / 4) {
      handleNext();
    } else {
      if (currentSentence) {
        speak(currentSentence, { voice: femaleVoice ?? null });
      }
    }
  };

  if (!currentSentence) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-background select-none flex flex-col overflow-hidden relative" onClick={handleScreenClick}>
      <header className="flex items-center justify-between p-4 flex-shrink-0 w-full">
        <Link href="/" onClick={(e) => e.stopPropagation()} className="z-50 flex items-center justify-center w-20 h-20 rounded-full bg-secondary hover:bg-border text-secondary-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </Link>
        <button onClick={() => setShowImages(!showImages)} className="z-50 flex items-center justify-center w-20 h-20 rounded-full bg-secondary hover:bg-border text-secondary-foreground transition-colors">
          {showImages ? <ImageIcon className="w-12 h-12" /> : <ImageOff className="w-12 h-12" />}
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center overflow-y-auto">
        <main className="relative flex flex-col items-center justify-center text-center p-4">
          <div className="flex flex-wrap justify-center items-center gap-x-2 text-6xl md:text-8xl font-bold tracking-wider">
            {words.map((word, index) => {
              const cleanedWord = word.toLowerCase().replace('.', '');
              const isNoun = Object.keys(wordImageMap).includes(cleanedWord);
              return (
                <span 
                  key={index} 
                  className={`${isNoun ? 'text-blue-500 cursor-pointer' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isNoun) {
                      handleNounTap(cleanedWord);
                    }
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </main>
      </div>

      <div className="h-48 flex items-center justify-center gap-x-4">
        {nounsInSentence.map((noun, index) => (
          <div key={index} className="w-44 h-44 flex items-center justify-center">
            {(showImages || tappedNouns.includes(noun)) && (
              <img
                src={wordImageMap[noun]}
                alt={noun}
                className="w-40 h-40 md:w-40 md:h-40 object-contain rounded-lg animate-fade-in"
                onError={(e) => (e.currentTarget.style.display = 'none')}
                onClick={(e) => {
                  e.stopPropagation();
                  speak(noun, { voice: femaleVoice ?? null });
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="h-24">
        <button
          onClick={(e) => { e.stopPropagation(); handleShuffle(); e.currentTarget.blur(); }}
          className="w-full h-full flex items-center justify-center transition-colors bg-secondary hover:bg-border text-secondary-foreground"
        >
          <Shuffle className="w-10 h-10 md:w-12 md:h-12" />
        </button>
      </div>
    </div>
  );
};

export default SentencesApp;
