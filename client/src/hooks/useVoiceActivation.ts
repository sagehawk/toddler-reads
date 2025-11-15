import { useState, useEffect, useRef } from 'react';

interface VoiceActivationOptions {
  onSoundDetected: () => void;
  silenceThreshold?: number;
  soundThreshold?: number;
  delay?: number;
}

export const useVoiceActivation = ({
  onSoundDetected,
  silenceThreshold = 200, // ms of silence to consider speech ended
  soundThreshold = 0.1, // Average volume threshold
  delay = 2000, // ms to wait before listening again
}: VoiceActivationOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopListening = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsListening(false);
  };

  useEffect(() => {
    if (!isListening) return;

    const processAudio = () => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += Math.abs(dataArray[i] - 128);
      }
      const average = sum / dataArray.length / 128;

      if (average > soundThreshold) {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        setIsSoundPlaying(true);
        silenceTimeoutRef.current = setTimeout(() => {
          setIsSoundPlaying(false);
          if (listeningTimeoutRef.current === null) {
            onSoundDetected();
            listeningTimeoutRef.current = setTimeout(() => {
              listeningTimeoutRef.current = null;
            }, delay);
          }
        }, silenceThreshold);
      }
      requestAnimationFrame(processAudio);
    };

    processAudio();

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };
  }, [isListening, onSoundDetected, silenceThreshold, soundThreshold, delay]);

  return { startListening, stopListening, isListening };
};
