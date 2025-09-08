// A centralized utility for consistent letter colors across the application.

interface LetterColors {
  text: string;
  background: string;
  hoverBackground: string;
  darkText: string;
}

const colorPalette: { [key: string]: Omit<LetterColors, 'darkText'> } = {
  A: { text: 'text-red-500', background: 'bg-red-400', hoverBackground: 'hover:bg-red-500' },
  B: { text: 'text-orange-500', background: 'bg-orange-400', hoverBackground: 'hover:bg-orange-500' },
  C: { text: 'text-amber-500', background: 'bg-amber-400', hoverBackground: 'hover:bg-amber-500' },
  D: { text: 'text-yellow-500', background: 'bg-yellow-400', hoverBackground: 'hover:bg-yellow-500' },
  E: { text: 'text-lime-500', background: 'bg-lime-400', hoverBackground: 'hover:bg-lime-500' },
  F: { text: 'text-green-500', background: 'bg-green-400', hoverBackground: 'hover:bg-green-500' },
  G: { text: 'text-emerald-500', background: 'bg-emerald-400', hoverBackground: 'hover:bg-emerald-500' },
  H: { text: 'text-teal-500', background: 'bg-teal-400', hoverBackground: 'hover:bg-teal-500' },
  I: { text: 'text-cyan-500', background: 'bg-cyan-400', hoverBackground: 'hover:bg-cyan-500' },
  J: { text: 'text-sky-500', background: 'bg-sky-400', hoverBackground: 'hover:bg-sky-500' },
  K: { text: 'text-blue-500', background: 'bg-blue-400', hoverBackground: 'hover:bg-blue-500' },
  L: { text: 'text-indigo-500', background: 'bg-indigo-400', hoverBackground: 'hover:bg-indigo-500' },
  M: { text: 'text-violet-500', background: 'bg-violet-400', hoverBackground: 'hover:bg-violet-500' },
  N: { text: 'text-purple-500', background: 'bg-purple-400', hoverBackground: 'hover:bg-purple-500' },
  O: { text: 'text-fuchsia-500', background: 'bg-fuchsia-400', hoverBackground: 'hover:bg-fuchsia-500' },
  P: { text: 'text-pink-500', background: 'bg-pink-400', hoverBackground: 'hover:bg-pink-500' },
  Q: { text: 'text-rose-500', background: 'bg-rose-400', hoverBackground: 'hover:bg-rose-500' },
  R: { text: 'text-red-500', background: 'bg-red-500', hoverBackground: 'hover:bg-red-600' },
  S: { text: 'text-orange-500', background: 'bg-orange-500', hoverBackground: 'hover:bg-orange-600' },
  T: { text: 'text-amber-500', background: 'bg-amber-500', hoverBackground: 'hover:bg-amber-600' },
  U: { text: 'text-yellow-500', background: 'bg-yellow-500', hoverBackground: 'hover:bg-yellow-600' },
  V: { text: 'text-lime-500', background: 'bg-lime-500', hoverBackground: 'hover:bg-lime-600' },
  W: { text: 'text-green-500', background: 'bg-green-500', hoverBackground: 'hover:bg-green-600' },
  X: { text: 'text-emerald-500', background: 'bg-emerald-500', hoverBackground: 'hover:bg-emerald-600' },
  Y: { text: 'text-teal-500', background: 'bg-teal-500', hoverBackground: 'hover:bg-teal-600' },
  Z: { text: 'text-cyan-500', background: 'bg-cyan-500', hoverBackground: 'hover:bg-cyan-600' },
};

const defaultColors: Omit<LetterColors, 'darkText'> = {
  text: 'text-foreground',
  background: 'bg-gray-600',
  hoverBackground: 'hover:bg-gray-700',
};

export const getLetterColors = (letter: string): LetterColors => {
  const upperLetter = letter.toUpperCase();
  const colors = colorPalette[upperLetter] || defaultColors;
  return {
    ...colors,
    darkText: colors.text.replace('-400', '-600').replace('-500', '-700'), // for lighter backgrounds
  };
};
