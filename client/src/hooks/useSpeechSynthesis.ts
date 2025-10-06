import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
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
  }, []);

  const speak = useCallback((text: string, options?: { voice: SpeechSynthesisVoice | null; onEnd?: () => void }) => {
    return new Promise<void>(resolve => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
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
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop, voices };
};
