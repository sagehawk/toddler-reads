import { useEffect, useState } from 'react';

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const colors = ['#FFC1CC', '#FFD700', '#ADD8E6', '#90EE90', '#DDA0DD', '#FFA07A'];

interface FloatingLetter {
  id: number;
  letter: string;
  color: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  animationDuration: number;
  animationDelay: number;
}

export function FloatingLetters() {
  const [floatingLetters, setFloatingLetters] = useState<FloatingLetter[]>([]);

  useEffect(() => {
    const generateLetters = () => {
      const newLetters: FloatingLetter[] = [];
      
      for (let i = 0; i < 15; i++) {
        newLetters.push({
          id: i,
          letter: letters[Math.floor(Math.random() * letters.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.8,
          animationDuration: 15 + Math.random() * 20,
          animationDelay: Math.random() * 10,
        });
      }
      
      setFloatingLetters(newLetters);
    };

    generateLetters();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {floatingLetters.map((letter) => (
        <div
          key={letter.id}
          className="absolute font-bold opacity-15 select-none animate-float"
          style={{
            left: `${letter.x}%`,
            top: `${letter.y}%`,
            transform: `rotate(${letter.rotation}deg) scale(${letter.scale})`,
            fontSize: `${3 + Math.random() * 4}rem`,
            animationDuration: `${letter.animationDuration}s`,
            animationDelay: `${letter.animationDelay}s`,
            color: letter.color,
          }}
        >
          {letter.letter}
        </div>
      ))}
      
    </div>
  );
};
