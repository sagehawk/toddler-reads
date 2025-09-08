import { useState, useEffect, useCallback, useRef } from 'react';
import { learningModules } from '../data/phonicsDecks';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useLocation } from 'wouter';
import { getLetterColors } from '../lib/colorUtils';

import logoUrl from '../assets/toddler-reads-logo.png';

type AppMode = 'learning' | 'story';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

export default function PhonicsApp() {
  const [, navigate] = useLocation();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then(({ outcome }) => {
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    });
  };
  
  const [appMode, setAppMode] = useState<AppMode>('learning');
  const [selectedModuleId, setSelectedModuleId] = useState('letters-full');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);
  const [isShowingStem, setIsShowingStem] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: default, 1: first letter visible, 2: rest visible, 3: all fade
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModuleDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const selectedModule = learningModules.find(m => m.id === selectedModuleId) || learningModules[0];

  const currentAudio = useRef<HTMLAudioElement | null>(null); // Declare a ref
  const animationTimeouts = useRef<number[]>([]); // To store timeout IDs

  const playSound = (soundFile: string) => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0; // Reset to beginning
    }

    const audio = new Audio(soundFile);
    audio.play();
    currentAudio.current = audio; // Store the new audio object
  };

  // Navigation with arrow keys
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigateItem('prev');
      } else if (e.key === 'ArrowRight') {
        navigateItem('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, selectedModule]);

  const navigateItem = useCallback((direction: 'prev' | 'next') => {
    if (selectedModule.type === 'letters') {
      const maxIndex = (selectedModule.letters?.length || 0) - 1;
      setCurrentIndex(prevIndex => {
        if (direction === 'prev') {
          return prevIndex > 0 ? prevIndex - 1 : maxIndex;
        } else {
          return prevIndex < maxIndex ? prevIndex + 1 : 0;
        }
      });
    } else if (selectedModule.type === 'cvc') {
      // For CVC: navigate between stem (-1) and consonants (0 to n-1)
      const maxIndex = (selectedModule.consonants?.length || 0) - 1;
      const minIndex = -1; // -1 represents the stem button
      
      setCurrentIndex(prevIndex => {
        if (direction === 'prev') {
          if (prevIndex > minIndex) {
            const newIndex = prevIndex - 1;
            setIsShowingStem(newIndex === -1);
            return newIndex;
          } else {
            setIsShowingStem(false);
            return maxIndex;
          }
        } else {
          if (prevIndex < maxIndex) {
            const newIndex = prevIndex + 1;
            setIsShowingStem(newIndex === -1);
            return newIndex;
          } else {
            setIsShowingStem(true);
            return minIndex;
          }
        }
      });
    }
  }, [selectedModule, currentIndex]);

  const jumpToItem = useCallback((index: number, isStem = false) => {
    setCurrentIndex(index);
    setIsShowingStem(isStem);
  }, []);

  const [showInstruction, setShowInstruction] = useState(true);

  const playCurrentSound = useCallback(() => {
    setShowInstruction(false); // Hide instruction on first click
    if (selectedModule.type === 'letters' && selectedModule.letters) {
      const letter = selectedModule.letters[currentIndex];
      if (letter) playSound(letter.sound);
    } else if (selectedModule.type === 'cvc') {
      if (isShowingStem && selectedModule.stemSound) {
        playSound(selectedModule.stemSound);
      } else if (selectedModule.words && currentIndex >= 0) {
        const word = selectedModule.words[currentIndex];
        if (word) {
          playSound(word.audioFile);

          // Reset animation before starting
          setAnimationPhase(0);
          animationTimeouts.current.forEach(clearTimeout);
          animationTimeouts.current = [];

          // Animation sequence for CVC words
          setTimeout(() => {
            setAnimationPhase(1); // Phase 1: First letter visible, rest transparent
            const timeout1 = setTimeout(() => {
              setAnimationPhase(2); // Phase 2: First letter transparent, rest visible
              const timeout2 = setTimeout(() => {
                setAnimationPhase(3); // Phase 3: All fade
                const timeout3 = setTimeout(() => {
                  setAnimationPhase(0); // Phase 0: All back to 100% (default)
                }, 500); // 0.5 seconds for phase 3
                animationTimeouts.current.push(timeout3 as unknown as number);
              }, 1500); // 1.5 seconds for phase 2
              animationTimeouts.current.push(timeout2 as unknown as number);
            }, 900); // 0.9 seconds for phase 1
            animationTimeouts.current.push(timeout1 as unknown as number);
          }, 50); // Small delay to allow React to process the state change
        }
      }
    }
  }, [selectedModule, currentIndex, isShowingStem]);

  const selectModule = useCallback((moduleId: string) => {
    setSelectedModuleId(moduleId);
    const newModule = learningModules.find(m => m.id === moduleId);
    
    if (newModule?.type === 'cvc') {
      // Default to stem for CVC modules
      setCurrentIndex(-1);
      setIsShowingStem(true);
      // Auto-play stem sound on load
      setTimeout(() => {
        if (newModule.stemSound) {
          playSound(newModule.stemSound);
        }
      }, 100);
    } else {
      setCurrentIndex(0);
      setIsShowingStem(false);
    }
    
    setShowModuleDropdown(false);
  }, []);

  // Reset index when switching modules
  useEffect(() => {
    const module = learningModules.find(m => m.id === selectedModuleId);
    if (module?.type === 'cvc') {
      setCurrentIndex(-1);
      setIsShowingStem(true);
    } else {
      setCurrentIndex(0);
      setIsShowingStem(false);
    }
    setCompletedIndices([]);
  }, [selectedModuleId]);

  // Effect to reset animation and clear timeouts when item changes
  useEffect(() => {
    animationTimeouts.current.forEach(clearTimeout);
    animationTimeouts.current = [];
    setAnimationPhase(0);

    // Stop current audio playback
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
    }
  }, [currentIndex, selectedModuleId]);

  // Get current display content
  const getCurrentDisplay = () => {
    if (selectedModule.type === 'letters' && selectedModule.letters) {
      const letter = selectedModule.letters[currentIndex];
      const upper = letter?.letter || 'A';
      const lower = upper.toLowerCase();
      return {
        content: `${upper}${lower}`,
        color: getLetterColors(upper).text,
        isWord: false
      };
    } else if (selectedModule.type === 'cvc') {
      if (isShowingStem) {
        return {
          content: selectedModule.wordStem || '',
          color: 'text-foreground',
          isWord: true,
          consonant: '',
          family: selectedModule.family || ''
        };
      } else if (selectedModule.words && currentIndex >= 0) {
        const word = selectedModule.words[currentIndex];
        return {
          content: word?.word || selectedModule.wordStem || '',
          color: 'text-foreground',
          isWord: true,
          consonant: word?.consonant || '',
          family: selectedModule.family || ''
        };
      }
    }
    return { content: 'Aa', color: getLetterColors('A').text, isWord: false };
  };

  const currentDisplay = getCurrentDisplay();

  // Render word with color-coded consonant and black stem
  const renderWordDisplay = (word: string, consonant: string, family: string, phase: number) => {
    if (!consonant || word.startsWith('_')) {
      // Word stem only - render normally (no animation for stem)
      return (
        <span className="font-semibold text-9xl sm:text-[10rem] md:text-[12rem] lg:text-[14rem] xl:text-[16rem] text-foreground">
          {word}
        </span>
      );
    }
    
    const stemPart = family;
    const firstLetterOpacity = phase === 1 ? 1 : (phase === 2 ? 0.25 : (phase === 3 ? 0.25 : 1));
    const restOfWordOpacity = phase === 1 ? 0.25 : (phase === 2 ? 1 : (phase === 3 ? 0.25 : 1));

    return (
      <span className="font-semibold text-9xl sm:text-[10rem] md:text-[12rem] lg:text-[14rem] xl:text-[16rem]">
        <span
          className={getLetterColors(consonant).text}
          style={{ opacity: firstLetterOpacity, transition: 'opacity 0.5s ease-in-out' }}
        >
          {consonant}
        </span>
        <span
          className="text-foreground"
          style={{ opacity: restOfWordOpacity, transition: 'opacity 0.5s ease-in-out' }}
        >
          {stemPart}
        </span>
      </span>
    );
  };

  // Story Mode
  if (appMode === 'story') {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <header className="flex items-center mb-8">
            <button
              data-testid="button-back-from-story"
              className="touch-target bg-muted text-muted-foreground rounded-xl py-2 px-4 text-sm hover:bg-muted/80 transition-colors mr-4"
              onClick={() => setAppMode('learning')}
            >
              ← Back to App
            </button>
            <h1 className="text-2xl font-light text-foreground">My Story</h1>
          </header>

          <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
            <h2 className="text-xl font-medium mb-6 text-card-foreground text-center">
              My Story: From Failing English to My 20-Month-Old Son Mastering Phonics
            </h2>
            
            <div className="prose prose-lg max-w-none text-card-foreground space-y-6">
              <p className="text-card-foreground mb-6">
                I'll be honest with you - I wasn't the brightest kid in school. I still remember standing in front of a Frosted Flakes box at five years old, unable to decipher the words. That feeling of being behind, of not understanding, followed me for years. It's a struggle I was determined my son would never face.
              </p>
              
              <p className="text-card-foreground mb-6">
                When my son turned 18 months, I started noticing his fascination with letters. But here's the thing - most "educational" apps are overwhelming chaos. Flashing lights, distracting animations, multiple sounds at once. They're designed to entertain, not to teach.
              </p>
              
              <p className="text-card-foreground mb-6">
                So I stripped everything down to what actually works: one letter, one sound, crystal clear pronunciation. No distractions. No overwhelm. Just pure, focused learning.
              </p>

              <p className="text-card-foreground mb-6">
                In today's world, this is more important than ever. With AI that threatens to do our thinking for us, our children's greatest advantage will be their ability to think, articulate, and express themselves with confidence. That journey starts with their first words, which starts with their first sounds.
              </p>
              
              <p className="text-card-foreground mb-6">
                The results were incredible. By 20 months, my son was identifying letter sounds with confidence. By 22 months, he was blending simple words. By 24 months, he was ahead of kids twice his age. His preschool teachers couldn't believe how advanced his phonemic awareness was. Most importantly, I watched him grow into a confident communicator - something I struggled with for years.
              </p>
              
              <p className="text-card-foreground mb-6">
                That's why I built ToddlerReads. It's not just an app - it's the exact method that transformed my son into a confident early reader and communicator. Every feature, every design choice comes from real experience with real results.
              </p>
              
              <div className="bg-muted rounded-xl p-6 border border-border">
                <h3 className="font-medium text-card-foreground mb-2">The Science Behind ToddlerReads</h3>
                <ul className="text-card-foreground text-sm space-y-1">
                  <li>• <strong>Guided Discovery:</strong> Builds neural pathways through active recall and parent interaction</li>
                  <li>• <strong>Structured Learning Modules:</strong> Provides systematic progression from letters to words</li>
                  <li>• <strong>Distraction-Free Design:</strong> Removes cognitive load so focus stays on learning</li>
                  <li>• <strong>Progressive Development:</strong> Optimized for toddler attention spans and prevents overwhelm</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Single Clear Call to Action */}
          <div className="text-center mt-8">
            <button
              data-testid="button-start-free-trial"
              className="touch-target bg-green-600 text-white rounded-3xl py-4 px-8 text-xl font-semibold shadow-lg hover:bg-green-700 transition-colors"
              onClick={() => window.open('https://toddlerreads.com/signup', '_blank')}
            >
              Start Your 7-Day Free Trial
            </button>
            <p className="text-sm text-muted-foreground mt-2">
              Get instant access for your toddler
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Learning Screen - V2.1 Layout
  return (
    <div className="h-screen bg-background select-none flex flex-col overflow-hidden">
      {/* Header with Logo and Module Dropdown */}
      <header className="flex items-center justify-between p-4 flex-shrink-0 w-full">
        {/* Logo */}
        <div className="flex-1">
          <button onClick={() => navigate('/')} className="focus:outline-none">
            <img 
              src={logoUrl} 
              alt="ToddlerReads" 
              className="h-10 object-contain" // Slightly smaller logo
            />
          </button>
        </div>

        {/* Learning Module Dropdown */}
        <div className="relative flex-1 flex justify-end" ref={dropdownRef}>
          <button
            data-testid="button-module-selector"
            className="touch-target bg-card border border-border shadow-sm rounded-xl py-2 px-4 text-sm hover:bg-secondary/80 transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
            onClick={() => setShowModuleDropdown(!showModuleDropdown)}
          >
            {selectedModule.name}
            <span className="text-muted-foreground text-lg transition-transform duration-200" style={{ transform: showModuleDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>

          {showModuleDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg z-50 min-w-[200px] bg-background/80 backdrop-blur-sm">
              <div className="p-2">
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-2 py-1">Letters</h3>
                  <button
                    data-testid="button-select-letters"
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedModuleId === 'letters-full'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-card-foreground'
                    }`}
                    onClick={() => selectModule('letters-full')}
                  >
                    Full Alphabet
                  </button>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground px-2 py-1">First Words (CVC)</h3>
                  {learningModules.filter(m => m.type === 'cvc').map((module) => (
                    <button
                      key={module.id}
                      data-testid={`button-select-${module.id}`}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedModuleId === module.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-card-foreground'
                      }`}
                      onClick={() => selectModule(module.id)}
                    >
                      {module.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Display */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 -mt-8 min-h-0">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Navigation Areas */}
          <button
            data-testid="button-nav-previous"
            className="absolute left-0 top-0 bottom-0 w-10 sm:w-20 touch-target flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity"
            onClick={() => navigateItem('prev')}
          >
            <span className="text-4xl text-muted-foreground">‹</span>
          </button>
          <button
            data-testid="button-nav-next"
            className="absolute right-0 top-0 bottom-0 w-10 sm:w-20 touch-target flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity"
            onClick={() => navigateItem('next')}
          >
            <span className="text-4xl text-muted-foreground">›</span>
          </button>

          {/* Wrapper for Card and Instruction to contain absolute positioning */}
          <div className="relative aspect-square max-h-full w-full max-w-md">
            {/* Content Card */}
            <div
              data-testid="card-content-display"
              className="bg-card rounded-3xl shadow-2xl p-4 sm:p-8 flex items-center justify-center cursor-pointer hover:shadow-3xl transition-shadow w-full h-full touch-auto"
              onClick={playCurrentSound}
            >
              <div data-testid="text-current-content" className="text-center">
                {currentDisplay.isWord && currentDisplay.consonant && currentDisplay.family ? 
                  renderWordDisplay(currentDisplay.content, currentDisplay.consonant, currentDisplay.family, animationPhase) :
                  <span className={`font-semibold text-8xl sm:text-[9rem] md:text-[11rem] lg:text-[13rem] xl:text-[14rem] ${currentDisplay.color}`}>
                    {currentDisplay.content}
                  </span>
                }
              </div>
            </div>

            {/* Instruction */}
            {showInstruction && (
              <p className="absolute bottom-5 left-0 right-0 text-center text-muted-foreground text-base sm:text-lg opacity-75 pointer-events-none">
                {selectedModule.type === 'letters' ? "Tap the letter to hear its sound" : "Tap the word to hear it spoken"}
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Item Selection Tray */}
      <div className="w-full flex-shrink-0" data-testid="container-item-tray">
        <div className="flex flex-wrap justify-center gap-3 p-4">
          {selectedModule.type === 'letters' && selectedModule.letters?.map((letter, index) => {
            const colors = getLetterColors(letter.letter);
            return (
              <button
                key={index}
                data-testid={`button-tray-letter-${letter.letter}`}
                className={`touch-target rounded-2xl py-4 px-5 font-bold text-2xl transition-colors min-w-[64px] text-white touch-auto ${
                  completedIndices.includes(index)
                    ? 'invisible'
                    : index === currentIndex
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : `${colors.background} ${colors.hoverBackground}`
                }`}
                onClick={() => {
                  jumpToItem(index);
                  if (!completedIndices.includes(index)) {
                    const newCompletedIndices = [...completedIndices, index];
                    setCompletedIndices(newCompletedIndices);

                    if (newCompletedIndices.length === selectedModule.letters?.length) {
                      setTimeout(() => {
                        setCompletedIndices([]);
                      }, 1000);
                    }
                  }
                }}
              >
                {letter.letter}
              </button>
            );
          })}
          
          {selectedModule.type === 'cvc' && (
            <>
              {/* Stem Button */}
              <button
                data-testid="button-tray-stem"
                className={`touch-target rounded-2xl py-4 px-5 font-bold text-2xl transition-colors min-w-[64px] ${
                  isShowingStem
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                onClick={() => jumpToItem(-1, true)}
              >
                _
              </button>
              
              {/* Consonant Buttons */}
              {selectedModule.consonants?.map((consonant, index) => {
                const colors = getLetterColors(consonant);
                return (
                  <button
                    key={index}
                    data-testid={`button-tray-consonant-${consonant}`}
                    className={`touch-target rounded-2xl py-4 px-5 font-bold text-2xl transition-colors min-w-[64px] text-white ${
                      index === currentIndex && !isShowingStem
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : `${colors.background} ${colors.hoverBackground}`
                    }`}
                    onClick={() => jumpToItem(index, false)}
                  >
                    {consonant}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}