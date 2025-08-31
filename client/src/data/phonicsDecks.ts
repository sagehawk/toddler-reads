export interface PhonicsLetter {
  letter: string;
  sound: string;
}

export interface CVCWord {
  consonant: string;
  word: string;
  sound: string; // "c... at... Cat" - descriptive text
  audioFile: string; // Path to the actual audio file
}

export interface LearningModule {
  id: string;
  name: string;
  type: 'letters' | 'cvc';
  isLocked?: boolean;
  
  // For letter modules
  letters?: PhonicsLetter[];
  
  // For CVC modules
  family?: string; // e.g., "at", "et", "it"
  wordStem?: string; // e.g., "_at"
  stemSound?: string; // e.g., "at" - sound for word stem
  consonants?: string[]; // Available consonants for this family
  words?: CVCWord[];
}

export const learningModules: LearningModule[] = [
  // Letters Module
  {
    id: 'letters-full',
    name: 'Full Alphabet',
    type: 'letters',
    letters: [
      { letter: 'A', sound: '/sounds/Phonics/Sound 01.mp3' },
      { letter: 'B', sound: '/sounds/Phonics/Sound 02.mp3' },
      { letter: 'C', sound: '/sounds/Phonics/Sound 03.mp3' },
      { letter: 'D', sound: '/sounds/Phonics/Sound 04.mp3' },
      { letter: 'E', sound: '/sounds/Phonics/Sound 05.mp3' },
      { letter: 'F', sound: '/sounds/Phonics/Sound 06.mp3' },
      { letter: 'G', sound: '/sounds/Phonics/Sound 07.mp3' },
      { letter: 'H', sound: '/sounds/Phonics/Sound 08.mp3' },
      { letter: 'I', sound: '/sounds/Phonics/Sound 09.mp3' },
      { letter: 'J', sound: '/sounds/Phonics/Sound 10.mp3' },
      { letter: 'K', sound: '/sounds/Phonics/Sound 11.mp3' },
      { letter: 'L', sound: '/sounds/Phonics/Sound 12.mp3' },
      { letter: 'M', sound: '/sounds/Phonics/Sound 13.mp3' },
      { letter: 'N', sound: '/sounds/Phonics/Sound 14.mp3' },
      { letter: 'O', sound: '/sounds/Phonics/Sound 15.mp3' },
      { letter: 'P', sound: '/sounds/Phonics/Sound 16.mp3' },
      { letter: 'Q', sound: '/sounds/Phonics/Sound 17.mp3' },
      { letter: 'R', sound: '/sounds/Phonics/Sound 18.mp3' },
      { letter: 'S', sound: '/sounds/Phonics/Sound 19.mp3' },
      { letter: 'T', sound: '/sounds/Phonics/Sound 20.mp3' },
      { letter: 'U', sound: '/sounds/Phonics/Sound 21.mp3' },
      { letter: 'V', sound: '/sounds/Phonics/Sound 22.mp3' },
      { letter: 'W', sound: '/sounds/Phonics/Sound 23.mp3' },
      { letter: 'X', sound: '/sounds/Phonics/Sound 24.mp3' },
      { letter: 'Y', sound: '/sounds/Phonics/Sound 25.mp3' },
      { letter: 'Z', sound: '/sounds/Phonics/Sound 26.mp3' },
    ]
  },
  
  // CVC Word Families - Integrated Stem Design
  {
    id: 'cvc-at',
    name: '-at Family',
    type: 'cvc',
    family: 'at',
    wordStem: '_at',
    stemSound: '/sounds/Phonics/At.mp3',
    consonants: ['B', 'C', 'H', 'M', 'P', 'R', 'S'],
    words: [
      { consonant: 'B', word: 'Bat', sound: 'B... at... Bat', audioFile: '/sounds/Phonics/Bat.mp3' },
      { consonant: 'C', word: 'Cat', sound: 'C... at... Cat', audioFile: '/sounds/Phonics/Cat.mp3' },
      { consonant: 'H', word: 'Hat', sound: 'H... at... Hat', audioFile: '/sounds/Phonics/Hat.mp3' },
      { consonant: 'M', word: 'Mat', sound: 'M... at... Mat', audioFile: '/sounds/Phonics/Mat.mp3' },
      { consonant: 'P', word: 'Pat', sound: 'P... at... Pat', audioFile: '/sounds/Phonics/Pat.mp3' },
      { consonant: 'R', word: 'Rat', sound: 'R... at... Rat', audioFile: '/sounds/Phonics/Rat.mp3' },
      { consonant: 'S', word: 'Sat', sound: 'S... at... Sat', audioFile: '/sounds/Phonics/Sat.mp3' },
    ]
  },
  
  {
    id: 'cvc-et',
    name: '-et Family',
    type: 'cvc',
    family: 'et',
    wordStem: '_et',
    stemSound: '/sounds/Phonics/Sound 05.mp3', // Placeholder for 'et' sound (E)
    consonants: ['B', 'G', 'J', 'L', 'M', 'N', 'P', 'W'],
    words: [
      { consonant: 'B', word: 'Bet', sound: 'B... et... Bet', audioFile: '/sounds/Phonics/Sound 02.mp3' },
      { consonant: 'G', word: 'Get', sound: 'G... et... Get', audioFile: '/sounds/Phonics/Sound 07.mp3' },
      { consonant: 'J', word: 'Jet', sound: 'J... et... Jet', audioFile: '/sounds/Phonics/Sound 10.mp3' },
      { consonant: 'L', word: 'Let', sound: 'L... et... Let', audioFile: '/sounds/Phonics/Sound 12.mp3' },
      { consonant: 'M', word: 'Met', sound: 'M... et... Met', audioFile: '/sounds/Phonics/Sound 13.mp3' },
      { consonant: 'N', word: 'Net', sound: 'N... et... Net', audioFile: '/sounds/Phonics/Sound 14.mp3' },
      { consonant: 'P', word: 'Pet', sound: 'P... et... Pet', audioFile: '/sounds/Phonics/Sound 16.mp3' },
      { consonant: 'W', word: 'Wet', sound: 'W... et... Wet', audioFile: '/sounds/Phonics/Sound 23.mp3' },
    ]
  },
  
  {
    id: 'cvc-it',
    name: '-it Family',
    type: 'cvc',
    family: 'it',
    wordStem: '_it',
    stemSound: '/sounds/Phonics/Sound 09.mp3', // Placeholder for 'it' sound (I)
    consonants: ['B', 'F', 'H', 'K', 'L', 'P', 'S', 'W'],
    words: [
      { consonant: 'B', word: 'Bit', sound: 'B... it... Bit', audioFile: '/sounds/Phonics/Sound 02.mp3' },
      { consonant: 'F', word: 'Fit', sound: 'F... it... Fit', audioFile: '/sounds/Phonics/Sound 06.mp3' },
      { consonant: 'H', word: 'Hit', sound: 'H... it... Hit', audioFile: '/sounds/Phonics/Sound 08.mp3' },
      { consonant: 'K', word: 'Kit', sound: 'K... it... Kit', audioFile: '/sounds/Phonics/Sound 11.mp3' },
      { consonant: 'L', word: 'Lit', sound: 'L... it... Lit', audioFile: '/sounds/Phonics/Sound 12.mp3' },
      { consonant: 'P', word: 'Pit', sound: 'P... it... Pit', audioFile: '/sounds/Phonics/Sound 16.mp3' },
      { consonant: 'S', word: 'Sit', sound: 'S... it... Sit', audioFile: '/sounds/Phonics/Sound 19.mp3' },
      { consonant: 'W', word: 'Wit', sound: 'W... it... Wit', audioFile: '/sounds/Phonics/Sound 23.mp3' },
    ]
  }
];

// Legacy export for backwards compatibility
export const phonicsDecks = learningModules;
