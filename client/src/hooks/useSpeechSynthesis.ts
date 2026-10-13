import { useState, useEffect, useCallback, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { say, stopVoice, SayOptions } from '../lib/voicePlayer';

// Warm, natural voices commonly available across platforms, in preference order.
// Very few platforms actually put the word "Female" in voice names, so we match
// against known-good voices first and fall back progressively.
const VOICE_PREFERENCES = [
  'Google UK English Female',
  'Google US English',
  'Microsoft Aria',
  'Microsoft Jenny',
  'Microsoft Zira',
  'Samantha',
  'Karen',
  'Moira',
  'Tessa',
];

export const pickPreferredVoice = (
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null => {
  if (!voices || voices.length === 0) return null;
  const english = voices.filter((v) => v.lang?.toLowerCase().startsWith('en'));
  const pool = english.length > 0 ? english : voices;

  for (const preferred of VOICE_PREFERENCES) {
    const match = pool.find((v) => v.name?.includes(preferred));
    if (match) return match;
  }
  const labelledFemale = pool.find((v) => /female/i.test(v.name || ''));
  if (labelledFemale) return labelledFemale;
  // Local (on-device) voices start instantly and work offline.
  return (
    pool.find((v) => v.lang === 'en-US' && v.localService) ||
    pool.find((v) => v.lang === 'en-US') ||
    pool[0]
  );
};

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) return;

    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    if ('speechSynthesis' in window) {
      setVoices(window.speechSynthesis.getVoices());
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isNative]);

  // Everything is said in the app's recorded voice (lib/voicePlayer): the
  // line's Kokoro clip, or the device voice when it has none. `interrupt`
  // (default true) cancels whatever is currently speaking before starting.
  // Pass `interrupt: false` to let the current line finish and QUEUE this one
  // after it — used for word-by-word reading and reward reads so a quick next
  // tap (or the closing sentence read) never clips the previous word.
  const speak = useCallback((text: string, options?: SayOptions) => say(text, options), []);

  const stop = useCallback(() => stopVoice(), []);

  const preferredVoice = useMemo(() => pickPreferredVoice(voices), [voices]);

  return { speak, stop, voices, preferredVoice };
};
