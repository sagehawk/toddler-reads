import { useState, useEffect, useRef } from "react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { vocabData, VocabItem } from "../data/vocabData";
import { learningModules } from "../data/phonicsDecks";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";

// Helper to find phonics data
const findPhonicsData = (word: string) => {
  const lowerWord = word.toLowerCase();
  for (const module of learningModules) {
    if (module.type === "cvc" && module.words) {
      const found = module.words.find(
        (w) => w.word.toLowerCase() === lowerWord,
      );
      if (found) {
        return {
          consonantSound:
            module.letters?.find((l) => l.letter === found.consonant)?.sound ||
            learningModules[0].letters?.find(
              (l) => l.letter === found.consonant,
            )?.sound,
          stemSound: module.stemSound,
          fullSound: found.audioFile,
          consonant: found.consonant,
          stem: module.family || found.word.slice(1),
        };
      }
    }
  }
  // Fallback for non-CVC words (e.g. Zebra)
  const firstLetter = word.charAt(0).toUpperCase();
  return {
    consonantSound: learningModules[0].letters?.find(
      (l) => l.letter === firstLetter,
    )?.sound,
    stemSound: null, // TTS fallback
    fullSound: null, // TTS fallback
    consonant: firstLetter,
    stem: word.slice(1),
  };
};

interface AnimalsVocabProps {
  items: VocabItem[];
  onExit: () => void;
}

export const AnimalsVocab = ({ items, onExit }: AnimalsVocabProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [consonantActive, setConsonantActive] = useState(false);
  const [stemActive, setStemActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { speak, stop } = useSpeechSynthesis();

  const currentItem = items[currentIndex];
  const phonics = findPhonicsData(currentItem.name);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = (src: string | null | undefined, textFallback: string) => {
    stop();
    if (src) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = new Audio(src);
        audioRef.current
          .play()
          .catch((e) => console.error("Audio play failed", e));
      } else {
        const audio = new Audio(src);
        audioRef.current = audio;
        audio.play().catch((e) => console.error("Audio play failed", e));
      }
    } else {
      speak(textFallback);
    }
  };

  const handleConsonantClick = () => {
    if (isCompleted) return;
    setConsonantActive(true);
    playSound(phonics.consonantSound, phonics.consonant);
  };

  const handleStemClick = () => {
    if (isCompleted) return;
    setStemActive(true);
    playSound(phonics.stemSound, phonics.stem);
  };

  useEffect(() => {
    if (consonantActive && stemActive && !isCompleted) {
      const timer = setTimeout(() => {
        setIsCompleted(true);
        triggerSuccess();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [consonantActive, stemActive, isCompleted]);

  const triggerSuccess = () => {
    // 1. Chime (using confetti as visual chime substitute for now)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // 2. Speak breakdown
    setTimeout(() => {
      speak(`${phonics.consonant}... ${phonics.stem}... ${currentItem.name}!`);
      // 3. Play generic animal sound or "Meow" if cat (hardcoded for demo)
      if (currentItem.name === "Cat") {
        // setTimeout(() => playSound(null, "Meow!"), 1500);
      }
    }, 500);

    // 4. Auto-advance
    setTimeout(() => {
      handleNext();
    }, 4000);
  };

  const handleNext = () => {
    setConsonantActive(false);
    setStemActive(false);
    setIsCompleted(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handleSelect = (index: number) => {
    setConsonantActive(false);
    setStemActive(false);
    setIsCompleted(false);
    setCurrentIndex(index);
  };

  return (
    <div className="fixed inset-0 bg-[#FFFAF0] flex flex-col font-nunito">
      {/* Top Bar */}
      <div className="p-4">
        <button
          onClick={onExit}
          className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-[#2D3748]" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center md:-mt-40">
        {/* Word Display */}
        <div className="flex items-center gap-1 mb-8 text-7xl sm:text-8xl font-bold tracking-tight">
          <span
            className={`transition-all duration-500 ${consonantActive || isCompleted ? "text-[#4FD1C5] scale-110" : "text-gray-300"}`}
          >
            {phonics.consonant}
          </span>
          <span
            className={`transition-all duration-500 ${stemActive || isCompleted ? "text-[#F6AD55] scale-110" : "text-gray-300"}`}
          >
            {phonics.stem}
          </span>
        </div>

        {/* Image Display */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-12">
          <img
            src={currentItem.image}
            alt={currentItem.name}
            className={`w-full h-full object-contain transition-all duration-1000 ${isCompleted ? "filter-none scale-110 drop-shadow-2xl" : "grayscale opacity-50 scale-95"}`}
          />
        </div>

        {/* Interactive Buttons */}
        {!isCompleted && (
          <div className="flex gap-8">
            <button
              onClick={handleConsonantClick}
              disabled={consonantActive}
              className={`w-24 h-24 rounded-2xl text-4xl font-bold shadow-button transition-all transform active:scale-95 ${consonantActive ? "bg-[#4FD1C5] text-white" : "bg-white text-[#4FD1C5] border-2 border-[#4FD1C5] hover:-translate-y-1"}`}
            >
              {phonics.consonant}
            </button>
            <button
              onClick={handleStemClick}
              disabled={stemActive}
              className={`w-24 h-24 rounded-2xl text-4xl font-bold shadow-button transition-all transform active:scale-95 ${stemActive ? "bg-[#F6AD55] text-white" : "bg-white text-[#F6AD55] border-2 border-[#F6AD55] hover:-translate-y-1"}`}
            >
              {phonics.stem}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Grid Navigation */}
      <div className="h-32 bg-white border-t border-gray-100 overflow-x-auto">
        <div className="h-full flex items-center px-4 gap-4">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`flex-shrink-0 w-20 h-20 p-2 rounded-xl transition-all ${currentIndex === index ? "bg-[#4FD1C5] ring-4 ring-[#4FD1C5]/30 scale-110" : "bg-gray-50 hover:bg-gray-100"}`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
