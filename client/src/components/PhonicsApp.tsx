import { useState, useEffect, useCallback, useRef } from 'react';
import { learningModules, LearningModule, PhonicsLetter, CVCWord } from '../data/phonicsDecks';

import logoUrl from '../assets/toddler-reads-logo.png';

type AppMode = 'learning' | 'story';

export default function PhonicsApp() {
  
  const [appMode, setAppMode] = useState<AppMode>('learning');
  const [selectedModuleId, setSelectedModuleId] = useState('letters-full');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);
  const [isShowingStem, setIsShowingStem] = useState(false);

  const selectedModule = learningModules.find(m => m.id === selectedModuleId) || learningModules[0];

  const currentAudio = useRef<HTMLAudioElement | null>(null); // Declare a ref

  // Color palette for letters and consonants (Montessori-inspired)
  const getLetterColor = (letter: string): string => {
    const colors = {
      'A': 'text-red-600', 'B': 'text-orange-600', 'C': 'text-amber-600', 'D': 'text-yellow-600',
      'E': 'text-lime-600', 'F': 'text-green-600', 'G': 'text-emerald-600', 'H': 'text-teal-600',
      'I': 'text-cyan-600', 'J': 'text-sky-600', 'K': 'text-blue-600', 'L': 'text-indigo-600',
      'M': 'text-violet-600', 'N': 'text-purple-600', 'O': 'text-fuchsia-600', 'P': 'text-pink-600',
      'Q': 'text-rose-600', 'R': 'text-red-700', 'S': 'text-orange-700', 'T': 'text-amber-700',
      'U': 'text-yellow-700', 'V': 'text-lime-700', 'W': 'text-green-700', 'X': 'text-emerald-700',
      'Y': 'text-teal-700', 'Z': 'text-cyan-700'
    };
    return colors[letter as keyof typeof colors] || 'text-foreground';
  };

  const getTrayButtonColor = (letter: string): string => {
    const colors = {
      'A': 'bg-red-200 hover:bg-red-300 text-red-800', 'B': 'bg-orange-200 hover:bg-orange-300 text-orange-800',
      'C': 'bg-amber-200 hover:bg-amber-300 text-amber-800', 'D': 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800',
      'E': 'bg-lime-200 hover:bg-lime-300 text-lime-800', 'F': 'bg-green-200 hover:bg-green-300 text-green-800',
      'G': 'bg-emerald-200 hover:bg-emerald-300 text-emerald-800', 'H': 'bg-teal-200 hover:bg-teal-300 text-teal-800',
      'I': 'bg-cyan-200 hover:bg-cyan-300 text-cyan-800', 'J': 'bg-sky-200 hover:bg-sky-300 text-sky-800',
      'K': 'bg-blue-200 hover:bg-blue-300 text-blue-800', 'L': 'bg-indigo-200 hover:bg-indigo-300 text-indigo-800',
      'M': 'bg-violet-200 hover:bg-violet-300 text-violet-800', 'N': 'bg-purple-200 hover:bg-purple-300 text-purple-800',
      'O': 'bg-fuchsia-200 hover:bg-fuchsia-300 text-fuchsia-800', 'P': 'bg-pink-200 hover:bg-pink-300 text-pink-800',
      'Q': 'bg-rose-200 hover:bg-rose-300 text-rose-800', 'R': 'bg-red-300 hover:bg-red-400 text-red-800',
      'S': 'bg-orange-300 hover:bg-orange-400 text-orange-800', 'T': 'bg-amber-300 hover:bg-amber-400 text-amber-800',
      'U': 'bg-yellow-300 hover:bg-yellow-400 text-yellow-800', 'V': 'bg-lime-300 hover:bg-lime-400 text-lime-800',
      'W': 'bg-green-300 hover:bg-green-400 text-green-800', 'X': 'bg-emerald-300 hover:bg-emerald-400 text-emerald-800',
      'Y': 'bg-teal-300 hover:bg-teal-400 text-teal-800', 'Z': 'bg-cyan-300 hover:bg-cyan-400 text-cyan-800'
    };
    return colors[letter as keyof typeof colors] || 'bg-gray-200 hover:bg-gray-300 text-gray-800';
  };

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
    
    if (selectedModule.type === 'letters' && selectedModule.letters) {
      const letter = selectedModule.letters[index];
      if (letter) playSound(letter.sound);
    } else if (selectedModule.type === 'cvc') {
      if (isStem && selectedModule.stemSound) {
        playSound(selectedModule.stemSound);
      } else if (selectedModule.words && index >= 0) {
        const word = selectedModule.words[index];
        if (word) playSound(word.audioFile);
      }
    }
  }, [selectedModule]);

  const playCurrentSound = useCallback(() => {
    if (selectedModule.type === 'letters' && selectedModule.letters) {
      const letter = selectedModule.letters[currentIndex];
      if (letter) playSound(letter.sound);
    } else if (selectedModule.type === 'cvc') {
      if (isShowingStem && selectedModule.stemSound) {
        playSound(selectedModule.stemSound);
      } else if (selectedModule.words && currentIndex >= 0) {
        const word = selectedModule.words[currentIndex];
        if (word) playSound(word.audioFile);
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
  }, [selectedModuleId]);

  // Get current display content
  const getCurrentDisplay = () => {
    if (selectedModule.type === 'letters' && selectedModule.letters) {
      const letter = selectedModule.letters[currentIndex];
      return {
        content: letter?.letter || 'A',
        color: getLetterColor(letter?.letter || 'A'),
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
    return { content: 'A', color: 'text-foreground', isWord: false };
  };

  const currentDisplay = getCurrentDisplay();

  // Render word with color-coded consonant and black stem
  const renderWordDisplay = (word: string, consonant: string, family: string) => {
    if (!consonant || word.startsWith('_')) {
      // Word stem only - render normally
      return (
        <span className="font-semibold text-9xl lg:text-[12rem] xl:text-[16rem] text-foreground">
          {word}
        </span>
      );
    }
    
    // Full word - consonant in color, stem in black
    const stemPart = family;
    return (
      <span className="font-semibold text-9xl lg:text-[12rem] xl:text-[16rem]">
        <span className={getLetterColor(consonant)}>{consonant}</span>
        <span className="text-foreground">{stemPart}</span>
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

  // Main Learning Screen - V2.0 Layout
  return (
    <div className="min-h-screen bg-background select-none">
      <div className="h-full flex flex-col">
        {/* Header with Logo, Story Link, and Module Dropdown */}
        <div className="relative flex items-center justify-between p-4">
          <button
            data-testid="button-view-story"
            className="touch-target bg-muted text-muted-foreground rounded-xl py-2 px-4 text-sm hover:bg-muted/80 transition-colors"
            onClick={() => setAppMode('story')}
          >
            My Story
          </button>
          
          {/* In-flow logo for small screens, hidden on larger */}
          <div className="sm:hidden">
            <img
              src={logoUrl}
              alt="ToddlerReads"
              className="h-12 object-contain"
            />
          </div>

          {/* Force-centered logo for larger screens, hidden on small */}
          <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2">
            <img 
              src={logoUrl} 
              alt="ToddlerReads" 
              className="h-12 object-contain"
            />
          </div>

          {/* Learning Module Dropdown */}
          <div className="relative">
            <button
              data-testid="button-module-selector"
              className="touch-target bg-secondary text-secondary-foreground rounded-xl py-2 px-4 text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2"
              onClick={() => setShowModuleDropdown(!showModuleDropdown)}
            >
              {selectedModule.name}
              <span className="text-lg">{showModuleDropdown ? '▲' : '▼'}</span>
            </button>

            {showModuleDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg z-10 min-w-[200px]">
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
        </div>

        {/* Main Content Display - Larger and More Immersive */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="relative">
            {/* Navigation Areas */}
            <button
              data-testid="button-nav-previous"
              className="absolute left-0 top-0 bottom-0 w-20 -ml-20 touch-target flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity"
              onClick={() => navigateItem('prev')}
            >
              <span className="text-4xl text-muted-foreground">‹</span>
            </button>
            <button
              data-testid="button-nav-next"
              className="absolute right-0 top-0 bottom-0 w-20 -mr-20 touch-target flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity"
              onClick={() => navigateItem('next')}
            >
              <span className="text-4xl text-muted-foreground">›</span>
            </button>

            {/* Content Card - Much Larger */}
            <div
              data-testid="card-content-display"
              className="bg-card rounded-3xl shadow-2xl border border-border p-16 min-w-[400px] min-h-[400px] lg:min-w-[500px] lg:min-h-[500px] xl:min-w-[600px] xl:min-h-[600px] flex items-center justify-center cursor-pointer hover:shadow-3xl transition-shadow"
              onClick={playCurrentSound}
            >
              <div data-testid="text-current-content">
                {currentDisplay.isWord && currentDisplay.consonant && currentDisplay.family ? 
                  renderWordDisplay(currentDisplay.content, currentDisplay.consonant, currentDisplay.family) :
                  <span className={`font-semibold text-9xl lg:text-[12rem] xl:text-[16rem] ${currentDisplay.color}`}>
                    {currentDisplay.content}
                  </span>
                }
              </div>
            </div>

            {/* Instruction */}
            <p className="text-center mt-6 text-muted-foreground text-lg">
              {selectedModule.type === 'letters' ? 'Tap the letter to hear its sound' : 'Tap the word to hear it spoken'}
            </p>
          </div>
        </div>

        {/* Item Selection Tray */}
        <div className="p-4">
          <div className="bg-card rounded-2xl p-4 border border-border" data-testid="container-item-tray">
            <div className="flex flex-wrap justify-center gap-3">
              {selectedModule.type === 'letters' && selectedModule.letters?.map((letter, index) => (
                <button
                  key={index}
                  data-testid={`button-tray-letter-${letter.letter}`}
                  className={`touch-target rounded-2xl py-3 px-4 font-medium text-lg transition-colors min-w-[48px] ${
                    index === currentIndex
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : getTrayButtonColor(letter.letter)
                  }`}
                  onClick={() => jumpToItem(index)}
                >
                  {letter.letter}
                </button>
              ))}
              
              {selectedModule.type === 'cvc' && (
                <>
                  {/* Stem Button - Always First */}
                  <button
                    data-testid="button-tray-stem"
                    className={`touch-target rounded-2xl py-3 px-4 font-medium text-lg transition-colors min-w-[48px] ${
                      isShowingStem
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                    onClick={() => jumpToItem(-1, true)}
                  >
                    _
                  </button>
                  
                  {/* Consonant Buttons */}
                  {selectedModule.consonants?.map((consonant, index) => (
                    <button
                      key={index}
                      data-testid={`button-tray-consonant-${consonant}`}
                      className={`touch-target rounded-2xl py-3 px-4 font-medium text-lg transition-colors min-w-[48px] ${
                        index === currentIndex && !isShowingStem
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : getTrayButtonColor(consonant)
                      }`}
                      onClick={() => jumpToItem(index, false)}
                    >
                      {consonant}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}