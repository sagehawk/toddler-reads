import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import catImage from '../assets/animals/cat.png';
import { getLetterColors } from '../lib/colorUtils'; // Import the centralized color utility

// Define a mapping from the color class to the hex code for the button style
const colorClassToHex: { [key: string]: string } = {
  'text-red-400': '#f87171',
  'text-orange-400': '#fb923c',
  'text-amber-400': '#fbbf24',
  'text-yellow-400': '#facc15',
  'text-lime-400': '#a3e635',
  'text-green-400': '#4ade80',
  'text-emerald-400': '#34d399',
  'text-teal-400': '#2dd4bf',
  'text-cyan-400': '#22d3ee',
  'text-sky-400': '#38bdf8',
  'text-blue-400': '#60a5fa',
  'text-indigo-400': '#818cf8',
  'text-violet-400': '#a78bfa',
  'text-purple-400': '#c084fc',
  'text-fuchsia-400': '#e879f9',
  'text-pink-400': '#f472b6',
  'text-rose-400': '#fb7185',

  // optional darker hover states
  'text-red-500': '#ef4444',
  'text-orange-500': '#f97316',
  'text-amber-500': '#f59e0b',
  'text-yellow-500': '#eab308',
  'text-lime-500': '#84cc16',
  'text-green-500': '#22c55e',
  'text-emerald-500': '#10b981',
  'text-teal-500': '#14b8a6',
  'text-cyan-500': '#06b6d4',
  'text-sky-500': '#0ea5e9',
  'text-blue-500': '#3b82f6',
  'text-indigo-500': '#6366f1',
  'text-violet-500': '#8b5cf6',
  'text-purple-500': '#a855f7',
  'text-fuchsia-500': '#d946ef',
  'text-pink-500': '#ec4899',
  'text-rose-500': '#f43f5e',
};


const animalData = [
  { name: 'Cat', type: 'Syllable Pop', parts: [{ text: 'C', color: getLetterColors('C').text }, { text: 'AT', color: getLetterColors('A').text }], image: catImage },
  { name: 'Dog', type: 'Syllable Pop', parts: [{ text: 'D', color: getLetterColors('D').text }, { text: 'OG', color: getLetterColors('O').text }], image: null },
  { name: 'Pig', type: 'Syllable Pop', parts: [{ text: 'P', color: getLetterColors('P').text }, { text: 'IG', color: getLetterColors('I').text }], image: null },
  { name: 'Duck', type: 'Sound String', parts: [{ text: 'D', color: getLetterColors('D').text }, { text: 'U', color: getLetterColors('U').text }, { text: 'CK', color: getLetterColors('C').text }], image: null },
  { name: 'Fish', type: 'Sound String', parts: [{ text: 'F', color: getLetterColors('F').text }, { text: 'I', color: getLetterColors('I').text }, { text: 'SH', color: getLetterColors('S').text }], image: null },
  { name: 'Cow', type: 'Sound String', parts: [{ text: 'C', color: getLetterColors('C').text }, { text: 'OW', color: getLetterColors('O').text }], image: null },
  { name: 'Lion', type: 'Syllable Chunk', parts: [{ text: 'LI', color: getLetterColors('L').text }, { text: 'ON', color: getLetterColors('O').text }], image: null },
  { name: 'Tiger', type: 'Syllable Chunk', parts: [{ text: 'TI', color: getLetterColors('T').text }, { text: 'GER', color: getLetterColors('G').text }], image: null },
  { name: 'Turtle', type: 'Syllable Chunk', parts: [{ text: 'TUR', color: getLetterColors('T').text }, { text: 'TLE', color: getLetterColors('L').text }], image: null },
  { name: 'Elephant', type: 'Syllable Chunk', parts: [{ text: 'EL', color: getLetterColors('E').text }, { text: 'E', color: getLetterColors('E').text }, { text: 'PHANT', color: getLetterColors('P').text }], image: null },
];

const AnimalsApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedParts, setCompletedParts] = useState<string[]>([]);
  const { speak } = useSpeechSynthesis();

  const currentAnimal = animalData[currentIndex];
  const isComplete = completedParts.length === currentAnimal.parts.length;

  useEffect(() => {
    setCompletedParts([]);
  }, [currentIndex]);

  const handlePartClick = (part: { text: string, color: string }) => {
    if (isComplete) return;

    const nextPartIndex = completedParts.length;
    if (currentAnimal.parts[nextPartIndex].text === part.text) {
      speak(part.text);
      const newCompletedParts = [...completedParts, part.text];
      setCompletedParts(newCompletedParts);

      if (newCompletedParts.length === currentAnimal.parts.length) {
        // Word complete
        setTimeout(() => {
          // Joyful chime (placeholder)
          const synth = window.speechSynthesis;
          const utterance1 = new SpeechSynthesisUtterance(currentAnimal.parts.map(p => p.text).join('-'));
          const utterance2 = new SpeechSynthesisUtterance(currentAnimal.name);
          synth.speak(utterance1);
          synth.speak(utterance2);
          
          // Meow sound (placeholder)

          // Reset for the same animal
          setTimeout(() => {
            setCompletedParts([]);
          }, 2000);
        }, 500);
      }
    }
  };

  return (
    <div className="h-screen bg-background select-none flex flex-col overflow-hidden">
      <header className="flex items-center p-4 flex-shrink-0 w-full">
        <Link href="/">
          <Button variant="outline">← Home</Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* Word Canvas */}
          <h2 className="text-8xl font-bold tracking-widest">
            {currentAnimal.parts.map((part, index) => (
              <span key={index} className={`transition-colors duration-500 ${completedParts.includes(part.text) ? part.color : 'text-gray-300'}`}>
                {part.text}
              </span>
            ))}
          </h2>
          {/* Image Canvas */}
          {currentAnimal.image && (
            <img 
              src={currentAnimal.image} 
              alt={currentAnimal.name} 
              className={`w-48 h-48 transition-opacity duration-500 ${isComplete ? 'opacity-100' : 'opacity-20'}`}
            />
          )}
        </div>

        {/* Button Canvas */}
        <div className="flex gap-4">
          {currentAnimal.parts.map((part, index) => (
            <Button 
              key={index} 
              size="lg" 
              className={`text-4xl p-8 text-white hover:opacity-90 ${completedParts.includes(part.text) ? 'invisible' : ''}`}
              style={{ backgroundColor: colorClassToHex[part.color as keyof typeof colorClassToHex] || '#6b7280' }} // Use color map, fallback to gray
              onClick={() => handlePartClick(part)}
            >
              {part.text}
            </Button>
          ))}
        </div>
      </main>

      {/* Discovery Tray */}
      <div className="w-full flex-shrink-0 p-4">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
          {animalData.map((animal, index) => (
            <button 
              key={animal.name} 
              onClick={() => setCurrentIndex(index)}
              className={`p-2 rounded-lg border-4 ${currentIndex === index ? 'border-primary' : 'border-transparent'}`}
            >
              <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                {animal.image ? <img src={animal.image} alt={animal.name} className="w-full h-full object-cover rounded-sm" /> : <span className="text-sm text-gray-500">{animal.name}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimalsApp;
