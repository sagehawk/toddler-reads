import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { TapReadSentence } from '@/components/TapReadSentence';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSwipe } from '@/hooks/useSwipe';
import { usePreventBackExit } from '@/hooks/usePreventBackExit';
import { playDotPop } from '@/lib/uiSounds';

const STORY_LENGTH = 11; // Both stories have 11 pages
const TOTAL_STORY_LENGTH = STORY_LENGTH * 2;

// Story 1 — the cat family's fishing day. One short decodable line per page.
// Each page plays the loop the little ones love: picture first → tap it →
// the line appears → finger-point read it → the page turns by itself.
// Repeating frames ("We go...", "We can...") are deliberate — pattern books
// build confidence.
const STORY_1_TEXT: Record<number, string> = {
  1: 'We want fish!',
  2: 'We go to the lake.',
  3: 'We fish on a boat.',
  4: 'We got a fish!',
  5: 'The cat falls in!',
  6: 'Mom pulls the cat up.',
  7: 'We go on a bike.',
  8: 'We go to swim class.',
  9: 'We sit and listen.',
  10: 'We learn to swim.',
  11: 'We can swim!',
};

const StoryPage = ({ params }: { params: { id: string } }) => {
  usePreventBackExit();
  const [, setLocation] = useLocation();
  const storyId = params?.id;
  const isCombinedStory = storyId === 'all';
  const storyLength = isCombinedStory ? TOTAL_STORY_LENGTH : STORY_LENGTH;

  const [currentPage, setCurrentPage] = useState(1);
  // Text pages walk three stages: just the picture → tap reveals the line →
  // reading it completes the page (which then turns itself).
  const [stage, setStage] = useState<'image' | 'reading' | 'done'>('image');
  const [isPortrait, setIsPortrait] = useState(window.matchMedia("(orientation: portrait)").matches);
  const { preferredVoice } = useSpeechSynthesis();

  const imageUrlFor = (page: number): string => {
    if (isCombinedStory) {
      return page <= STORY_LENGTH
        ? `/stories/Story 1/${page}.png`
        : `/stories/Story 2/${page - STORY_LENGTH}.png`;
    }
    return `/stories/Story ${storyId}/${page}.png`;
  };

  // The line to read on this page (undefined = free page-turning, e.g. Story 2)
  const pageText =
    storyId === '1' || (isCombinedStory && currentPage <= STORY_LENGTH)
      ? STORY_1_TEXT[currentPage]
      : undefined;

  useEffect(() => {
    setStage('image');
  }, [currentPage]);

  // Preload the next page's art so page turns feel instant
  useEffect(() => {
    const next = currentPage === storyLength ? 1 : currentPage + 1;
    const img = new Image();
    img.src = imageUrlFor(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, storyLength, storyId]);

  const nextPage = () => {
    setCurrentPage((prev) => (prev === storyLength ? 1 : prev + 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev === 1 ? storyLength : prev - 1));
  };

  const handlePageRead = () => {
    setStage('done');
    // Every finished line gets a little burst; the story's last line gets a big one
    const isFinale = currentPage === STORY_LENGTH;
    confetti({
      particleCount: isFinale ? 90 : 35,
      spread: isFinale ? 90 : 60,
      origin: { y: 0.75 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#a78bfa'],
    });
  };

  // Fires only after the closing "you read it!" sentence read-out finishes,
  // so the page never turns mid-voice.
  const handleReadAdvance = () => {
    nextPage();
  };

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (pageText) {
      // Picture first: the whole page is the tap target that reveals the words
      if (stage === 'image') {
        playDotPop();
        if (navigator.vibrate) navigator.vibrate(8);
        setStage('reading');
      }
      // While reading (and during the closing read-out) background taps do
      // nothing — completing the line turns the page by itself, and swipes /
      // arrow keys remain the grown-up escape hatch.
      return;
    }

    // Pages without a reading line (Story 2) keep free tap-to-turn
    if (isPortrait) {
      const { clientY, currentTarget } = e;
      const clickPosition = clientY / currentTarget.offsetHeight;
      if (clickPosition < 0.25) {
        prevPage();
      } else {
        nextPage();
      }
    } else {
      const { clientX, currentTarget } = e;
      const clickPosition = clientX / currentTarget.offsetWidth;
      if (clickPosition < 0.25) {
        prevPage();
      } else {
        nextPage();
      }
    }
  };

  // Deliberate swipes always work — the parent's escape hatch past the gate
  const swipeHandlers = useSwipe({
    onSwipeLeft: nextPage,
    onSwipeRight: prevPage,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextPage, prevPage]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const handleChange = () => setIsPortrait(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Try to lock orientation
    if (window.screen.orientation && 'lock' in window.screen.orientation) {
      try {
        (window.screen.orientation as any).lock('landscape');
      } catch (error) {
        console.error('Failed to lock screen orientation:', error);
      }
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      // Unlock orientation when component unmounts
      if (window.screen.orientation && 'unlock' in window.screen.orientation) {
        try {
          window.screen.orientation.unlock();
        } catch (error) {
          // This can fail, it's fine.
        }
      }
    };
  }, []);

  if (!storyId) {
    return <div>Story not found</div>;
  }

  return (
    <div
      className="fixed inset-0 bg-black w-full h-full flex items-center justify-center select-none"
      onClick={handleInteraction}
      onTouchStart={(e) => swipeHandlers.onTouchStart(e)}
      onTouchMove={(e) => swipeHandlers.onTouchMove(e)}
      onTouchEnd={() => swipeHandlers.onTouchEnd()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
             document.documentElement.requestFullscreen().catch(() => {});
          }
          setLocation("/app", { replace: true });
        }}
        className={`absolute text-white bg-black bg-opacity-50 p-2 rounded-full z-10 ${isPortrait ? 'top-4 right-4 rotate-90' : 'top-4 left-4'}`}
      >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
      </button>

      {/* Page art + reading line rotate together in portrait */}
      <div className={`relative flex items-center justify-center ${isPortrait ? 'story-image-portrait' : 'max-w-full max-h-full'}`}>
        <img
          src={imageUrlFor(currentPage)}
          alt={`Story ${storyId} - Page ${currentPage}`}
          className="max-w-[100vw] max-h-[100dvh] object-contain noselect"
          draggable="false"
        />

        {/* Stage 1 — just the picture: a bouncing finger invites the tap
            that reveals the words (plain conditional render, enter-only) */}
        {pageText && stage === 'image' && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-6xl sm:text-7xl pointer-events-none select-none drop-shadow-lg"
            animate={{ y: [0, -14, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            aria-hidden
          >
            👆
          </motion.div>
        )}

        {/* Stage 2 — the reading line; finishing it turns the page itself */}
        {pageText && stage !== 'image' && (
          <motion.div
            className="absolute bottom-2 sm:bottom-4 left-1/2 w-[94%] max-w-3xl rounded-2xl bg-white/90 dark:bg-zinc-900/85 backdrop-blur-sm shadow-xl px-4 py-2 sm:py-3"
            style={{ x: '-50%' }}
            initial={{ y: 24, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <TapReadSentence
              key={`${storyId}-${currentPage}`}
              text={pageText}
              voice={preferredVoice ?? null}
              onComplete={handlePageRead}
              onAdvance={handleReadAdvance}
              maxFontPx={88}
              minFontPx={20}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StoryPage;
