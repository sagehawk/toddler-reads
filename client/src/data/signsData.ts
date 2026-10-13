import catImage from '../assets/animals/cat.png';
import sunImage from '../assets/animals/sun.png';
import boxImage from '../assets/animals/box.png';

/**
 * SIGNS — words a toddler first meets inside a shape that already means
 * something to them (a stop sign, a green light, a cat). Each word climbs a
 * fade ladder; every clean win takes ONE clue away until only the plain
 * lowercase word is left:
 *
 *   0  the full sign    solid shape, word sitting on it
 *   1  outline          the solid fill is gone, the shape stays
 *   2  gray outline     the shape's color is gone
 *   3  colored word     no shape — color is the last clue
 *   4  WORD             plain capitals
 *   5  Word             first-letter capital
 *   6  word             lowercase, the way books print it
 */
export const FADE_STEPS = 7;
export const LAST_STEP = FADE_STEPS - 1;

export interface SignPath {
  d: string;
  /** Fill on the full sign; defaults to the sign's color. */
  fill?: string;
}

/** Details that only exist on the full sign (the stop sign's white ring, the cat's face). */
export interface SignDecor {
  d: string;
  fill?: string;
  stroke?: string;
  width?: number;
}

export interface SignWord {
  word: string;
  /** Outline and word color while the color clue is still on (steps 1–3). */
  color: string;
  /** Word color while it sits on the solid sign (step 0). */
  onSign: string;
  /** The emblem, drawn in a 240×240 box. */
  paths: SignPath[];
  decor?: SignDecor[];
  /** Where the word sits on the emblem (240 box) and how big it is there. */
  wordAt: { x: number; y: number; size: number };
  /** The answer card: a photo from the Words game, or a drawn sign. */
  picture: { image: string } | { drawn: 'stopSign' | 'trafficLight' };
}

// ----- Shape helpers (all in the 240×240 emblem box, centered on 120,120) -----

type Pt = [number, number];

const polygon = (pts: Pt[]) =>
  'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') + ' Z';

const polar = (r: number, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return [120 + r * Math.cos(a), 120 + r * Math.sin(a)];
};

/** Regular polygon; 22.5° turns an octagon flat-topped like a real stop sign. */
const regular = (sides: number, r: number, rotateDeg = 0) =>
  polygon(Array.from({ length: sides }, (_, i) => polar(r, rotateDeg + (360 / sides) * i)));

const circle = (r: number, cx = 120, cy = 120) =>
  `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;

const sunRays = () =>
  Array.from({ length: 12 }, (_, i) => {
    const a = i * 30;
    return polygon([polar(82, a - 9), polar(110, a), polar(82, a + 9)]);
  }).join(' ');

// Cat head: round face, two pointy ears (rounded off by the stroke join)
const CAT_HEAD =
  'M22 150 C22 105 38 80 56 70 L46 18 L100 56 C113 53 127 53 140 56 L194 18 L184 70 ' +
  'C202 80 218 105 218 150 C218 196 174 222 120 222 C66 222 22 196 22 150 Z';

const CAT_FACE = '#7c2d12';

export const signWords: SignWord[] = [
  {
    word: 'stop',
    color: '#dc2626',
    onSign: '#ffffff',
    paths: [{ d: regular(8, 112, 22.5) }],
    decor: [{ d: regular(8, 97, 22.5), stroke: '#ffffff', width: 7 }],
    wordAt: { x: 120, y: 120, size: 54 },
    picture: { drawn: 'stopSign' },
  },
  {
    word: 'go',
    color: '#16a34a',
    onSign: '#ffffff',
    paths: [{ d: circle(106) }],
    // Glassy shine so the circle reads as a lit traffic light
    decor: [{ d: 'M41.1 91.3 A84 84 0 0 1 84.5 43.9', stroke: 'rgba(255,255,255,0.55)', width: 12 }],
    wordAt: { x: 120, y: 120, size: 82 },
    picture: { drawn: 'trafficLight' },
  },
  {
    word: 'cat',
    color: '#f97316',
    onSign: '#ffffff',
    paths: [{ d: CAT_HEAD }],
    decor: [
      { d: circle(9, 84, 110), fill: CAT_FACE },
      { d: circle(9, 156, 110), fill: CAT_FACE },
      { d: polygon([[111, 126], [129, 126], [120, 136]]), fill: CAT_FACE, stroke: CAT_FACE, width: 4 },
      { d: 'M30 150 L62 156 M30 172 L62 167 M210 150 L178 156 M210 172 L178 167', stroke: CAT_FACE, width: 4 },
    ],
    wordAt: { x: 120, y: 168, size: 54 },
    picture: { image: catImage },
  },
  {
    word: 'sun',
    color: '#f59e0b',
    onSign: '#9a3412',
    paths: [
      { d: circle(66), fill: '#facc15' },
      { d: sunRays(), fill: '#facc15' },
    ],
    wordAt: { x: 120, y: 120, size: 44 },
    picture: { image: sunImage },
  },
  {
    word: 'box',
    color: '#b45309',
    onSign: '#5b3413',
    // A cardboard cube like the Words photo: front, top, right side
    paths: [
      { d: polygon([[28, 70], [168, 70], [168, 210], [28, 210]]), fill: '#c99a62' },
      { d: polygon([[28, 70], [72, 30], [212, 30], [168, 70]]), fill: '#e0b884' },
      { d: polygon([[168, 70], [212, 30], [212, 170], [168, 210]]), fill: '#a97a44' },
    ],
    decor: [{ d: polygon([[87, 70], [131, 30], [153, 30], [109, 70]]), fill: '#f1dcb5' }],
    wordAt: { x: 98, y: 140, size: 50 },
    picture: { image: boxImage },
  },
];
