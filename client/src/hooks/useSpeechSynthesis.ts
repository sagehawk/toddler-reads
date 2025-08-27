import { useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.rate = 0.8;
    utteranceRef.current.pitch = 1.2;
    utteranceRef.current.volume = 1;

    // Try to use a child-friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = voices.filter(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Female') || voice.name.includes('Google'))
    );
    
    if (preferredVoices.length > 0) {
      utteranceRef.current.voice = preferredVoices[0];
    }

    window.speechSynthesis.speak(utteranceRef.current);
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
};
