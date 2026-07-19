// A centralized utility for consistent letter colors across the application.

interface LetterColors {
  text: string;
  background: string;
  hoverBackground: string;
  darkText: string;
}

const colorPalette: { [key: string]: Omit<LetterColors, 'darkText'> } = {
  A: { text: 'text-red-500', background: 'bg-red-400', hoverBackground: 'hover:bg-red-500' },
  B: { text: 'text-indigo-500', background: 'bg-indigo-400', hoverBackground: 'hover:bg-indigo-500' },
  C: { text: 'text-yellow-500', background: 'bg-yellow-400', hoverBackground: 'hover:bg-yellow-500' },
  D: { text: 'text-cyan-500', background: 'bg-cyan-400', hoverBackground: 'hover:bg-cyan-500' },
  E: { text: 'text-purple-500', background: 'bg-purple-400', hoverBackground: 'hover:bg-purple-500' },
  F: { text: 'text-lime-500', background: 'bg-lime-400', hoverBackground: 'hover:bg-lime-500' },
  G: { text: 'text-sky-500', background: 'bg-sky-400', hoverBackground: 'hover:bg-sky-500' },
  H: { text: 'text-pink-500', background: 'bg-pink-400', hoverBackground: 'hover:bg-pink-500' },
  I: { text: 'text-green-500', background: 'bg-green-400', hoverBackground: 'hover:bg-green-500' },
  J: { text: 'text-violet-500', background: 'bg-violet-400', hoverBackground: 'hover:bg-violet-500' },
  K: { text: 'text-amber-500', background: 'bg-amber-400', hoverBackground: 'hover:bg-amber-500' },
  L: { text: 'text-fuchsia-500', background: 'bg-fuchsia-400', hoverBackground: 'hover:bg-fuchsia-500' },
  M: { text: 'text-blue-500', background: 'bg-blue-400', hoverBackground: 'hover:bg-blue-500' },
  N: { text: 'text-teal-500', background: 'bg-teal-400', hoverBackground: 'hover:bg-teal-500' },
  O: { text: 'text-orange-500', background: 'bg-orange-400', hoverBackground: 'hover:bg-orange-500' },
  P: { text: 'text-rose-500', background: 'bg-rose-400', hoverBackground: 'hover:bg-rose-500' },
  Q: { text: 'text-emerald-500', background: 'bg-emerald-400', hoverBackground: 'hover:bg-emerald-500' },
  R: { text: 'text-rose-500', background: 'bg-rose-400', hoverBackground: 'hover:bg-rose-500' },
  S: { text: 'text-yellow-500', background: 'bg-yellow-400', hoverBackground: 'hover:bg-yellow-500' },
  T: { text: 'text-cyan-500', background: 'bg-cyan-400', hoverBackground: 'hover:bg-cyan-500' },
  U: { text: 'text-purple-500', background: 'bg-purple-400', hoverBackground: 'hover:bg-purple-500' },
  V: { text: 'text-lime-500', background: 'bg-lime-400', hoverBackground: 'hover:bg-lime-500' },
  W: { text: 'text-sky-500', background: 'bg-sky-400', hoverBackground: 'hover:bg-sky-500' },
  X: { text: 'text-pink-500', background: 'bg-pink-400', hoverBackground: 'hover:bg-pink-500' },
  Y: { text: 'text-green-500', background: 'bg-green-400', hoverBackground: 'hover:bg-green-500' },
  Z: { text: 'text-violet-500', background: 'bg-violet-400', hoverBackground: 'hover:bg-violet-500' },
  '1': { text: 'text-red-500', background: 'bg-red-400', hoverBackground: 'hover:bg-red-500' },
  '2': { text: 'text-blue-500', background: 'bg-blue-400', hoverBackground: 'hover:bg-blue-500' },
  '3': { text: 'text-yellow-500', background: 'bg-yellow-400', hoverBackground: 'hover:bg-yellow-500' },
  '4': { text: 'text-cyan-500', background: 'bg-cyan-400', hoverBackground: 'hover:bg-cyan-500' },
  '5': { text: 'text-purple-500', background: 'bg-purple-400', hoverBackground: 'hover:bg-purple-500' },
  '6': { text: 'text-lime-500', background: 'bg-lime-400', hoverBackground: 'hover:bg-lime-500' },
  '7': { text: 'text-sky-500', background: 'bg-sky-400', hoverBackground: 'hover:bg-sky-500' },
  '8': { text: 'text-pink-500', background: 'bg-pink-400', hoverBackground: 'hover:bg-pink-500' },
  '9': { text: 'text-green-500', background: 'bg-green-400', hoverBackground: 'hover:bg-green-500' },
  '0': { text: 'text-violet-500', background: 'bg-violet-400', hoverBackground: 'hover:bg-violet-500' },
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
    darkText: colors.text.replace('-400', '-800').replace('-500', '-900'), // for lighter backgrounds
  };
};

// Explicit hex per letter/number, matching the Tailwind -500 palette above.
// Used for the interactive dots (Numbers-style fills) so the color paints
// INSTANTLY via inline style — Tailwind color classes here ride the global
// 1s color transition in index.css and can read as unfilled mid-fade.
const hexPalette: { [key: string]: string } = {
  A: '#ef4444', B: '#6366f1', C: '#eab308', D: '#06b6d4', E: '#a855f7',
  F: '#84cc16', G: '#0ea5e9', H: '#ec4899', I: '#22c55e', J: '#8b5cf6',
  K: '#f59e0b', L: '#d946ef', M: '#3b82f6', N: '#14b8a6', O: '#f97316',
  P: '#f43f5e', Q: '#10b981', R: '#f43f5e', S: '#eab308', T: '#06b6d4',
  U: '#a855f7', V: '#84cc16', W: '#0ea5e9', X: '#ec4899', Y: '#22c55e',
  Z: '#8b5cf6',
  '1': '#ef4444', '2': '#3b82f6', '3': '#eab308', '4': '#06b6d4', '5': '#a855f7',
  '6': '#84cc16', '7': '#0ea5e9', '8': '#ec4899', '9': '#22c55e', '0': '#8b5cf6',
};

export const getLetterHex = (letter: string): string =>
  hexPalette[(letter || '').toUpperCase()] || '#64748b';
