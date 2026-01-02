import { useState, useEffect } from 'react';
import { Link } from 'wouter';

const STORY_LENGTH = 11; // Both stories have 11 pages
const TOTAL_STORY_LENGTH = STORY_LENGTH * 2;

const StoryPage = ({ params }: { params: { id: string } }) => {
  const storyId = params?.id;
  const isCombinedStory = storyId === 'all';
  const storyLength = isCombinedStory ? TOTAL_STORY_LENGTH : STORY_LENGTH;

  const [currentPage, setCurrentPage] = useState(1);
  const [isPortrait, setIsPortrait] = useState(window.matchMedia("(orientation: portrait)").matches);

  const nextPage = () => {
    setCurrentPage((prev) => (prev === storyLength ? 1 : prev + 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev === 1 ? storyLength : prev - 1));
  };

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPortrait) {
      const { clientY, currentTarget } = e;
      const { offsetHeight } = currentTarget;
      const clickPosition = clientY / offsetHeight;

      if (clickPosition < 0.25) {
        prevPage();
      } else {
        nextPage();
      }
    } else {
      const { clientX, currentTarget } = e;
      const { offsetWidth } = currentTarget;
      const clickPosition = clientX / offsetWidth;

      if (clickPosition < 0.25) {
        prevPage();
      } else {
        nextPage();
      }
    }
  };

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

  let imageUrl = '';
  if (isCombinedStory) {
    if (currentPage <= STORY_LENGTH) {
      imageUrl = `/stories/Story 1/${currentPage}.png`;
    } else {
      imageUrl = `/stories/Story 2/${currentPage - STORY_LENGTH}.png`;
    }
  } else {
    imageUrl = `/stories/Story ${storyId}/${currentPage}.png`;
  }

  return (
    <div
      className="fixed inset-0 bg-black w-full h-full flex items-center justify-center"
      onClick={handleInteraction}
    >
      <Link 
        href="/app"
        onClick={(e) => {
          e.stopPropagation();
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
             document.documentElement.requestFullscreen().catch(() => {});
          }
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
      </Link>
      <img
        src={imageUrl}
        alt={`Story ${storyId} - Page ${currentPage}`}
        className={`max-w-full max-h-full object-contain ${isPortrait ? 'story-image-portrait' : ''} noselect`}
        draggable="false"
      />
    </div>
  );
};

export default StoryPage;