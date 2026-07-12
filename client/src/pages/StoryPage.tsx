import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { TapReadSentence } from '@/components/TapReadSentence';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSwipe } from '@/hooks/useSwipe';
import { usePreventBackExit } from '@/hooks/usePreventBackExit';

const STORY_LENGTH = 11; // Both stories have 11 pages
const TOTAL_STORY_LENGTH = STORY_LENGTH * 2;

// Story 1 — the cat family's fishing day. One short decodable line per page;
// the child finger-point reads it to unlock the page turn. Repeating frames
// ("We go...", "We can...") are deliberate — pattern books build confidence.
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
  const [hasRead, setHasRead] = useState(false);
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

  // Reading gate: pages with text only turn forward once the line is read
  const isGated = !!pageText && !hasRead;

  useEffect(() => {
    setHasRead(false);
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
    setHasRead(true);
    // Finishing the story's last line earns a proper celebration
    if (currentPage === STORY_LENGTH) {
      confetti({
        particleCount: 90,
        spread: 90,
        origin: { y: 0.7 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#a78bfa'],
      });
    }
  };

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    // The words are the key to the page — no page-turning until the line is read
    if (isGated) return;

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

        {/* The reading line — the key that unlocks the page turn */}
        {pageText && (
          <div
            className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-3xl rounded-2xl bg-white/90 dark:bg-zinc-900/85 backdrop-blur-sm shadow-xl px-4 py-2 sm:py-3"
            onClick={(e) => e.stopPropagation()}
          >
            <TapReadSentence
              key={`${storyId}-${currentPage}`}
              text={pageText}
              voice={preferredVoice ?? null}
              mode="read"
              onComplete={handlePageRead}
              maxFontPx={88}
              minFontPx={20}
            />
          </div>
        )}

        {/* Page turned unlocked — bouncing arrow invites the next page */}
        <AnimatePresence>
          {pageText && hasRead && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                nextPage();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 dark:bg-zinc-900/85 shadow-xl backdrop-blur-sm focus:outline-none z-10"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25 }}
              aria-label="Next page"
            >
              {/* Infinite bounce lives on a child so it can never block the
                  parent's exit animation from completing (and unmounting) */}
              <motion.span
                className="flex"
                animate={{ x: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-500" stroke="currentColor" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoryPage;
