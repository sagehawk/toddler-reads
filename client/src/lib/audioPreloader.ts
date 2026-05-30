/**
 * Audio Preloader
 * 
 * Fetches all phonics MP3 files into the browser's HTTP cache on app startup.
 * This eliminates the delay when the user first taps a letter or vocab word,
 * since the browser already has the file cached locally.
 */

const PHONICS_SOUNDS: string[] = [];

// 26 letter sounds (Sound 01.mp3 through Sound 26.mp3)
for (let i = 1; i <= 26; i++) {
  const padded = i.toString().padStart(2, '0');
  PHONICS_SOUNDS.push(`/sounds/Phonics/Sound ${padded}.mp3`);
}

// CVC word sounds
const CVC_WORDS = ['At', 'Bat', 'Cat', 'Fat', 'Hat', 'Mat', 'Pat', 'Rat', 'Sat'];
for (const word of CVC_WORDS) {
  PHONICS_SOUNDS.push(`/sounds/Phonics/${word}.mp3`);
}

let preloaded = false;

/**
 * Preloads all phonics audio files into the browser HTTP cache.
 * Safe to call multiple times — only runs once.
 * Runs silently in the background without blocking the UI.
 */
export function preloadAllAudio(): void {
  if (preloaded) return;
  preloaded = true;

  // Stagger fetches slightly to avoid saturating bandwidth on slow connections
  PHONICS_SOUNDS.forEach((src, index) => {
    setTimeout(() => {
      fetch(src, { priority: 'low' } as RequestInit)
        .catch(() => {
          // Silently ignore — the file will be fetched on-demand as fallback
        });
    }, index * 50); // 50ms stagger between each fetch
  });
}
