import { useState, useEffect, useCallback, useMemo } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

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

  const speak = useCallback(async (text: string, options?: { voice: SpeechSynthesisVoice | null; rate?: number; onEnd?: () => void }) => {
    if (isNative) {
      try {
        await TextToSpeech.stop();
        await TextToSpeech.speak({
          text,
          lang: 'en-US',
          rate: options?.rate ?? 1.0,
          pitch: 1.2,
          volume: 1.0,
          category: 'ambient',
        });
        if (options?.onEnd) options.onEnd();
      } catch (error) {
        console.error('Native speech error:', error);
        if (options?.onEnd) options.onEnd();
      }
      return;
    }

    return new Promise<void>(resolve => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = 1.2;
      utterance.volume = 1;

      if (options?.voice) {
        utterance.voice = options.voice;
      }
      
      utterance.onend = () => {
        if (options?.onEnd) {
          options.onEnd();
        }
        resolve();
      };
      utterance.onerror = () => {
        if (options?.onEnd) {
          options.onEnd();
        }
        resolve(); // Also resolve on error to not block the sequence
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [isNative]);

  const stop = useCallback(async () => {
    if (isNative) {
      await TextToSpeech.stop();
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isNative]);

  const preferredVoice = useMemo(() => pickPreferredVoice(voices), [voices]);

  return { speak, stop, voices, preferredVoice };
};
