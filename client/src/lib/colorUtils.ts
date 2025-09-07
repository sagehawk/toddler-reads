// A centralized utility for consistent letter colors across the application.

interface LetterColors {
  text: string;
  background: string;
  hoverBackground: string;
  darkText: string;
}

const colorPalette: { [key: string]: Omit<LetterColors, 'darkText'> } = {
  A: { text: 'text-red-600', background: 'bg-red-600', hoverBackground: 'hover:bg-red-700' },
  B: { text: 'text-orange-600', background: 'bg-orange-600', hoverBackground: 'hover:bg-orange-700' },
  C: { text: 'text-amber-600', background: 'bg-amber-600', hoverBackground: 'hover:bg-amber-700' },
  D: { text: 'text-yellow-600', background: 'bg-yellow-600', hoverBackground: 'hover:bg-yellow-700' },
  E: { text: 'text-lime-600', background: 'bg-lime-600', hoverBackground: 'hover:bg-lime-700' },
  F: { text: 'text-green-600', background: 'bg-green-600', hoverBackground: 'hover:bg-green-700' },
  G: { text: 'text-emerald-600', background: 'bg-emerald-600', hoverBackground: 'hover:bg-emerald-700' },
  H: { text: 'text-teal-600', background: 'bg-teal-600', hoverBackground: 'hover:bg-teal-700' },
  I: { text: 'text-cyan-600', background: 'bg-cyan-600', hoverBackground: 'hover:bg-cyan-700' },
  J: { text: 'text-sky-600', background: 'bg-sky-600', hoverBackground: 'hover:bg-sky-700' },
  K: { text: 'text-blue-600', background: 'bg-blue-600', hoverBackground: 'hover:bg-blue-700' },
  L: { text: 'text-indigo-600', background: 'bg-indigo-600', hoverBackground: 'hover:bg-indigo-700' },
  M: { text: 'text-violet-600', background: 'bg-violet-600', hoverBackground: 'hover:bg-violet-700' },
  N: { text: 'text-purple-600', background: 'bg-purple-600', hoverBackground: 'hover:bg-purple-700' },
  O: { text: 'text-fuchsia-600', background: 'bg-fuchsia-600', hoverBackground: 'hover:bg-fuchsia-700' },
  P: { text: 'text-pink-600', background: 'bg-pink-600', hoverBackground: 'hover:bg-pink-700' },
  Q: { text: 'text-rose-600', background: 'bg-rose-600', hoverBackground: 'hover:bg-rose-700' },
  R: { text: 'text-red-700', background: 'bg-red-700', hoverBackground: 'hover:bg-red-800' },
  S: { text: 'text-orange-700', background: 'bg-orange-700', hoverBackground: 'hover:bg-orange-800' },
  T: { text: 'text-amber-700', background: 'bg-amber-700', hoverBackground: 'hover:bg-amber-800' },
  U: { text: 'text-yellow-700', background: 'bg-yellow-700', hoverBackground: 'hover:bg-yellow-800' },
  V: { text: 'text-lime-700', background: 'bg-lime-700', hoverBackground: 'hover:bg-lime-800' },
  W: { text: 'text-green-700', background: 'bg-green-700', hoverBackground: 'hover:bg-green-800' },
  X: { text: 'text-emerald-700', background: 'bg-emerald-700', hoverBackground: 'hover:bg-emerald-800' },
  Y: { text: 'text-teal-700', background: 'bg-teal-700', hoverBackground: 'hover:bg-teal-800' },
  Z: { text: 'text-cyan-700', background: 'bg-cyan-700', hoverBackground: 'hover:bg-cyan-800' },
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
    darkText: colors.text.replace('-600', '-800').replace('-700', '-900'), // for lighter backgrounds
  };
};
