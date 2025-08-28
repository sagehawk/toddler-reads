import { useEffect, useState } from "react";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const colors = ["#FFC1CC", "#FFD700", "#ADD8E6", "#90EE90", "#DDA0DD", "#FFA07A"];

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

// simple deterministic seeded random
function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function FloatingLetters() {
  const [floatingLetters, setFloatingLetters] = useState<FloatingLetter[]>([]);

  useEffect(() => {
    const newLetters: FloatingLetter[] = [];

    for (let i = 0; i < 20; i++) {
      const side = i % 2 === 0 ? "left" : "right";

      newLetters.push({
        id: i,
        letter: letters[Math.floor(seededRandom(i) * letters.length)],
        color: colors[Math.floor(seededRandom(i + 100) * colors.length)],
        x: side === "left"
          ? seededRandom(i + 200) * 12 // 0–10%
          : 90 + seededRandom(i + 200) * 5, // 90–100%
        y: seededRandom(i + 300) * 100, // anywhere vertically
        rotation: seededRandom(i + 400) * 360,
        scale: 0.5 + seededRandom(i + 500) * 0.8,
        animationDuration: 15 + seededRandom(i + 600) * 20,
        animationDelay: seededRandom(i + 700) * 10,
      });
    }

    setFloatingLetters(newLetters);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {floatingLetters.map((letter) => (
        <div
          key={letter.id}
          className="absolute font-extrabold opacity-80 select-none"
          style={{
            left: `${letter.x}%`,
            top: `${letter.y}%`,
            transform: `rotate(${letter.rotation}deg) scale(${letter.scale})`,
            fontSize: `${3 + seededRandom(letter.id + 800) * 4}rem`,
            color: letter.color,
          }}
        >
          {letter.letter}
        </div>
      ))}
    </div>
  );
}
