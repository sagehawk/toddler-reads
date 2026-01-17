import { useState, useEffect, useCallback, useRef } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

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

  return { speak, stop, voices };
};
