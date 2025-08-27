import { useState, useEffect } from 'react';

export type Speed = 'slow' | 'medium' | 'fast';
export type Loops = 1 | 3 | 5 | 'infinite';

export interface PhonicsSettings {
  selectedDeck: string;
  mode: 'drill' | 'play';
  speed: Speed;
  loops: Loops;
}

const defaultSettings: PhonicsSettings = {
  selectedDeck: 'full',
  mode: 'drill',
  speed: 'medium',
  loops: 1,
};

const STORAGE_KEY = 'phonics-app-settings';

export const usePhonicsSettings = () => {
  const [settings, setSettings] = useState<PhonicsSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  const updateSettings = (updates: Partial<PhonicsSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
};
