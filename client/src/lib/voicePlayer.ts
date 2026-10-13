import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';
import { voiceClips } from '../data/voiceClips';

/**
 * The app's voice. Every line the app says has a recorded Kokoro clip in
 * public/sounds/Voice (made by scripts/make-voice.py), played here in order
 * through ONE shared audio element. A line with no clip (new content that
 * hasn't been voiced yet) is spoken by the device's text-to-speech instead,
 * so nothing ever goes silent. The phonics letter sounds are real recordings
 * and don't come through here.
 *
 * Behaves the way speechSynthesis did, so callers didn't have to change: one
 * queue for the whole app, `interrupt` (the default) cancels everything first,
 * otherwise a line waits its turn, and onEnd / the promise always settle, even
 * when a line is cancelled.
 */

/** Clip name for some words: "I see a cat." → "i-see-a-cat". Same rule as slug() in make-voice.py. */
export const clipSlug = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Letter names get their own clips, so "A" the letter never collides with "a" the word. */
export const letterClip = (letter: string) => `letter-${letter.toLowerCase()}`;

export const clipUrl = (name: string) => `/sounds/Voice/${name}.mp3`;
export const allClipUrls = () => voiceClips.map(clipUrl);

const CLIPS = new Set(voiceClips);

export interface SayOptions {
  /** Device voice to fall back on when the line has no clip. */
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  onEnd?: () => void;
  /** false: wait for whatever is playing instead of cutting it off. */
  interrupt?: boolean;
  /** Play this clip instead of looking one up by the words (letter names). */
  clip?: string;
}

type Piece = { text: string; clip: string | null };

interface Line {
  pieces: Piece[];
  voice: SpeechSynthesisVoice | null;
  rate: number;
  settle: () => void;
}

const isNative = Capacitor.isNativePlatform();

// One element for every clip: iOS only lets an element make sound once a tap
// has unlocked it, and plenty of lines start after the tap is over.
let element: HTMLAudioElement | null = null;
let queue: Line[] = [];
let current: Line | null = null;
let generation = 0; // bumped by every cancel, so stale playback knows to stop
let wakeCurrent: (() => void) | null = null; // ends the piece playing right now
let liveUtterance: SpeechSynthesisUtterance | null = null; // Chrome drops onend if the utterance is GC'd

const clipFor = (text: string) => {
  const name = clipSlug(text);
  return CLIPS.has(name) ? name : null;
};

// A whole line usually has its own clip; otherwise it plays sentence by
// sentence: "Cat! Great job!" → "Cat!" then "Great job!"
const toPieces = (text: string, clip?: string): Piece[] => {
  if (clip) return [{ text, clip: CLIPS.has(clip) ? clip : null }];
  const whole = clipFor(text);
  if (whole) return [{ text, clip: whole }];
  return (text.match(/[^.!?]+[.!?]*/g) ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ text: s, clip: clipFor(s) }));
};

// Resolves true once the clip has played, false if it couldn't play
const playClip = (name: string, rate: number) =>
  new Promise<boolean>((resolve) => {
    if (!element) element = new Audio();
    const audio = element;
    wakeCurrent = () => resolve(true);
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);
    audio.defaultPlaybackRate = rate; // loading a new src resets playbackRate to this
    audio.src = clipUrl(name);
    // AbortError just means a newer line took the element over
    audio.play().catch((err) => resolve(err?.name === 'AbortError'));
  });

const speakWithDevice = (text: string, voice: SpeechSynthesisVoice | null, rate: number) =>
  new Promise<void>((resolve) => {
    wakeCurrent = () => resolve();
    if (isNative) {
      TextToSpeech.speak({ text, lang: 'en-US', rate, pitch: 1.2, volume: 1.0, category: 'ambient' }).then(
        () => resolve(),
        (error) => {
          console.error('Native speech error:', error);
          resolve();
        },
      );
      return;
    }
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // never block the queue
    liveUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });

const pump = async () => {
  if (current || queue.length === 0) return;
  const line = queue.shift()!;
  current = line;
  const gen = generation;
  for (const piece of line.pieces) {
    const played = piece.clip ? await playClip(piece.clip, line.rate) : false;
    if (gen !== generation) return; // cancelled: stopVoice already settled this line
    if (!played) await speakWithDevice(piece.text, line.voice, line.rate);
    if (gen !== generation) return;
  }
  wakeCurrent = null;
  liveUtterance = null;
  current = null;
  line.settle();
  pump();
};

/** Stop talking and drop everything queued. */
export const stopVoice = () => {
  generation += 1;
  const cancelled = current ? [current, ...queue] : queue;
  current = null;
  queue = [];
  const wake = wakeCurrent;
  wakeCurrent = null;
  wake?.();
  try {
    element?.pause();
  } catch (e) {
    // Ignore
  }
  if (isNative) TextToSpeech.stop().catch(() => {});
  else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  liveUtterance = null;
  // Settle on the next tick, like speechSynthesis' own cancel events, so a
  // cancelled line's onEnd can't jump ahead of the line that interrupted it
  if (cancelled.length) setTimeout(() => cancelled.forEach((line) => line.settle()), 0);
};

/** Say some words; resolves when they've been said (or were cut off). */
export const say = (text: string, options: SayOptions = {}) =>
  new Promise<void>((resolve) => {
    let settled = false;
    const line: Line = {
      pieces: toPieces(text, options.clip),
      voice: options.voice ?? null,
      rate: options.rate ?? 1,
      settle: () => {
        if (settled) return;
        settled = true;
        options.onEnd?.();
        resolve();
      },
    };
    if (options.interrupt !== false) stopVoice();
    queue.push(line);
    pump();
  });
