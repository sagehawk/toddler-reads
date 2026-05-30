import hatImage from '../assets/animals/hat.png';
import boxImage from '../assets/animals/box.png';
import cupImage from '../assets/animals/cup.png';
import bedImage from '../assets/animals/bed.png';
import penImage from '../assets/animals/pen.png';
import bagImage from '../assets/animals/bag.png';

import sunImage from '../assets/animals/sun.png';
import nestImage from '../assets/animals/nest.png';
import logImage from '../assets/animals/log.png';

import busImage from '../assets/animals/bus.png';
import vanImage from '../assets/animals/van.png';
import jetImage from '../assets/animals/jet.png';

import momImage from '../assets/animals/mom.png';
import dadImage from '../assets/animals/dad.png';
import kidImage from '../assets/animals/kid.png';
import manImage from '../assets/animals/man.png';

import catImage from '../assets/animals/cat.png';
import dogImage from '../assets/animals/dog.png';
import henImage from '../assets/animals/hen.png';
import ratImage from '../assets/animals/rat.png';
import batImage from '../assets/animals/bat.png';

export interface VocabItem {
  name: string;
  image: string;
  category: string;
  tts?: string;
}

export const vocabData: VocabItem[] = [
  // Animals (Pure CVC Decodables)
  { name: 'Cat', image: catImage, category: 'Animals' },
  { name: 'Dog', image: dogImage, category: 'Animals' },
  { name: 'Hen', image: henImage, category: 'Animals' },
  { name: 'Rat', image: ratImage, category: 'Animals' },
  { name: 'Bat', image: batImage, category: 'Animals' },

  // Things (Pure CVC Decodables)
  { name: 'Hat', image: hatImage, category: 'Things' },
  { name: 'Box', image: boxImage, category: 'Things' },
  { name: 'Cup', image: cupImage, category: 'Things' },
  { name: 'Bed', image: bedImage, category: 'Things' },
  { name: 'Pen', image: penImage, category: 'Things' },
  { name: 'Bag', image: bagImage, category: 'Things' },

  // Nature (Highly Regular Decodables)
  { name: 'Sun', image: sunImage, category: 'Nature' },
  { name: 'Nest', image: nestImage, category: 'Nature' },
  { name: 'Log', image: logImage, category: 'Nature' },

  // Vehicles (Pure CVC Decodables)
  { name: 'Bus', image: busImage, category: 'Vehicles' },
  { name: 'Van', image: vanImage, category: 'Vehicles' },
  { name: 'Jet', image: jetImage, category: 'Vehicles' },

  // People (Pure CVC Decodables)
  { name: 'Mom', image: momImage, category: 'People' },
  { name: 'Dad', image: dadImage, category: 'People' },
  { name: 'Kid', image: kidImage, category: 'People' },
  { name: 'Man', image: manImage, category: 'People' },
];