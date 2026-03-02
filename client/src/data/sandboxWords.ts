// Simple CVC and short words for the sandbox blending game.
// Ordered roughly by difficulty — continuous-sound-starting words first.
export interface SandboxWord {
    word: string;
    // Optional image key (matches vocabData names) for the reward reveal
    imageKey?: string;
}

export const sandboxWords: SandboxWord[] = [
    // Continuous-sound starters (M, S, F, R, L, N) — easier to blend
    { word: 'MOM', imageKey: 'Mom' },
    { word: 'SUN', imageKey: 'Sun' },
    { word: 'FAN' },
    { word: 'RUN' },
    { word: 'LOG', imageKey: 'Log' },
    { word: 'NUT' },
    { word: 'MAN', imageKey: 'Man' },
    { word: 'SIT' },
    { word: 'FIT' },
    { word: 'RAT', imageKey: 'Rat' },
    { word: 'LIT' },
    { word: 'NET' },
    { word: 'MAP' },
    { word: 'SAT' },
    { word: 'FUN' },
    { word: 'RUG' },
    { word: 'LET' },
    { word: 'NAP' },

    // Stop-sound starters — harder
    { word: 'CAT', imageKey: 'Cat' },
    { word: 'DOG', imageKey: 'Dog' },
    { word: 'HAT', imageKey: 'Hat' },
    { word: 'BAT', imageKey: 'Bat' },
    { word: 'BUS', imageKey: 'Bus' },
    { word: 'CUP', imageKey: 'Cup' },
    { word: 'BED', imageKey: 'Bed' },
    { word: 'HEN', imageKey: 'Hen' },
    { word: 'COW', imageKey: 'Cow' },
    { word: 'PEN', imageKey: 'Pen' },
    { word: 'BAG', imageKey: 'Bag' },
    { word: 'BOX', imageKey: 'Box' },
    { word: 'DAD', imageKey: 'Dad' },
    { word: 'KID', imageKey: 'Kid' },
    { word: 'VAN', imageKey: 'Van' },
    { word: 'JET', imageKey: 'Jet' },
    { word: 'BIG' },
    { word: 'DIG' },
    { word: 'HIT' },
    { word: 'HOP' },
    { word: 'TOP' },
    { word: 'GOT' },
    { word: 'PIG' },
    { word: 'TUB' },
];
