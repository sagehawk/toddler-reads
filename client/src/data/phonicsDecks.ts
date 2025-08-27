export interface PhonicsLetter {
  letter: string;
  sound: string;
}

export interface CVCWord {
  consonant: string;
  word: string;
  sound: string; // "c... at... Cat"
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
      { letter: 'A', sound: 'A' },
      { letter: 'B', sound: 'B' },
      { letter: 'C', sound: 'C' },
      { letter: 'D', sound: 'D' },
      { letter: 'E', sound: 'E' },
      { letter: 'F', sound: 'F' },
      { letter: 'G', sound: 'G' },
      { letter: 'H', sound: 'H' },
      { letter: 'I', sound: 'I' },
      { letter: 'J', sound: 'J' },
      { letter: 'K', sound: 'K' },
      { letter: 'L', sound: 'L' },
      { letter: 'M', sound: 'M' },
      { letter: 'N', sound: 'N' },
      { letter: 'O', sound: 'O' },
      { letter: 'P', sound: 'P' },
      { letter: 'Q', sound: 'Q' },
      { letter: 'R', sound: 'R' },
      { letter: 'S', sound: 'S' },
      { letter: 'T', sound: 'T' },
      { letter: 'U', sound: 'U' },
      { letter: 'V', sound: 'V' },
      { letter: 'W', sound: 'W' },
      { letter: 'X', sound: 'X' },
      { letter: 'Y', sound: 'Y' },
      { letter: 'Z', sound: 'Z' },
    ]
  },
  
  // CVC Word Families - Integrated Stem Design
  {
    id: 'cvc-at',
    name: '-at Family',
    type: 'cvc',
    family: 'at',
    wordStem: '_at',
    stemSound: 'at',
    consonants: ['B', 'C', 'F', 'H', 'M', 'P', 'R', 'S'],
    words: [
      { consonant: 'B', word: 'Bat', sound: 'B... at... Bat' },
      { consonant: 'C', word: 'Cat', sound: 'C... at... Cat' },
      { consonant: 'F', word: 'Fat', sound: 'F... at... Fat' },
      { consonant: 'H', word: 'Hat', sound: 'H... at... Hat' },
      { consonant: 'M', word: 'Mat', sound: 'M... at... Mat' },
      { consonant: 'P', word: 'Pat', sound: 'P... at... Pat' },
      { consonant: 'R', word: 'Rat', sound: 'R... at... Rat' },
      { consonant: 'S', word: 'Sat', sound: 'S... at... Sat' },
    ]
  },
  
  {
    id: 'cvc-et',
    name: '-et Family',
    type: 'cvc',
    family: 'et',
    wordStem: '_et',
    stemSound: 'et',
    consonants: ['B', 'G', 'J', 'L', 'M', 'N', 'P', 'W'],
    words: [
      { consonant: 'B', word: 'Bet', sound: 'B... et... Bet' },
      { consonant: 'G', word: 'Get', sound: 'G... et... Get' },
      { consonant: 'J', word: 'Jet', sound: 'J... et... Jet' },
      { consonant: 'L', word: 'Let', sound: 'L... et... Let' },
      { consonant: 'M', word: 'Met', sound: 'M... et... Met' },
      { consonant: 'N', word: 'Net', sound: 'N... et... Net' },
      { consonant: 'P', word: 'Pet', sound: 'P... et... Pet' },
      { consonant: 'W', word: 'Wet', sound: 'W... et... Wet' },
    ]
  },
  
  {
    id: 'cvc-it',
    name: '-it Family',
    type: 'cvc',
    family: 'it',
    wordStem: '_it',
    stemSound: 'it',
    consonants: ['B', 'F', 'H', 'K', 'L', 'P', 'S', 'W'],
    words: [
      { consonant: 'B', word: 'Bit', sound: 'B... it... Bit' },
      { consonant: 'F', word: 'Fit', sound: 'F... it... Fit' },
      { consonant: 'H', word: 'Hit', sound: 'H... it... Hit' },
      { consonant: 'K', word: 'Kit', sound: 'K... it... Kit' },
      { consonant: 'L', word: 'Lit', sound: 'L... it... Lit' },
      { consonant: 'P', word: 'Pit', sound: 'P... it... Pit' },
      { consonant: 'S', word: 'Sit', sound: 'S... it... Sit' },
      { consonant: 'W', word: 'Wit', sound: 'W... it... Wit' },
    ]
  }
];

// Legacy export for backwards compatibility
export const phonicsDecks = learningModules;
