import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import catImage from '../assets/animals/cat.png';

const animalData = [
  { name: 'Cat', type: 'Syllable Pop', parts: [{ text: 'C', color: 'text-teal-500' }, { text: 'AT', color: 'text-orange-500' }], image: catImage },
  { name: 'Dog', type: 'Syllable Pop', parts: [{ text: 'D', color: 'text-teal-500' }, { text: 'OG', color: 'text-orange-500' }], image: null },
  { name: 'Pig', type: 'Syllable Pop', parts: [{ text: 'P', color: 'text-teal-500' }, { text: 'IG', color: 'text-orange-500' }], image: null },
  { name: 'Duck', type: 'Sound String', parts: [{ text: 'D', color: 'text-teal-500' }, { text: 'U', color: 'text-yellow-500' }, { text: 'CK', color: 'text-orange-500' }], image: null },
  { name: 'Fish', type: 'Sound String', parts: [{ text: 'F', color: 'text-teal-500' }, { text: 'I', color: 'text-yellow-500' }, { text: 'SH', color: 'text-orange-500' }], image: null },
  { name: 'Cow', type: 'Sound String', parts: [{ text: 'C', color: 'text-teal-500' }, { text: 'OW', color: 'text-orange-500' }], image: null },
  { name: 'Lion', type: 'Syllable Chunk', parts: [{ text: 'LI', color: 'text-teal-500' }, { text: 'ON', color: 'text-orange-500' }], image: null },
  { name: 'Tiger', type: 'Syllable Chunk', parts: [{ text: 'TI', color: 'text-teal-500' }, { text: 'GER', color: 'text-orange-500' }], image: null },
  { name: 'Turtle', type: 'Syllable Chunk', parts: [{ text: 'TUR', color: 'text-teal-500' }, { text: 'TLE', color: 'text-orange-500' }], image: null },
  { name: 'Elephant', type: 'Syllable Chunk', parts: [{ text: 'EL', color: 'text-teal-500' }, { text: 'E', color: 'text-yellow-500' }, { text: 'PHANT', color: 'text-orange-500' }], image: null },
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
              className={`text-4xl p-8 ${part.color.replace('text-', 'bg-').replace('-500', '-200')} hover:${part.color.replace('text-', 'bg-').replace('-500', '-300')} ${part.color}`}
              onClick={() => handlePartClick(part)}
              disabled={completedParts.includes(part.text)}
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