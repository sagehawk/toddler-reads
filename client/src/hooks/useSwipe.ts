import { useRef } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** Set false to ignore swipes entirely (e.g. while a mini-game is in progress). */
  enabled?: boolean;
  /** Minimum travel distance (in px) before a gesture counts as a swipe. */
  minSwipeDistance?: number;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  enabled = true,
  minSwipeDistance = 100,
}: SwipeHandlers) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  // Toddlers drag and rest fingers while tapping. A real "turn the page" swipe
  // must travel far, be clearly directional, and not be a slow drift.
  const minSpeed = 0.15; // px per ms across the whole gesture
  const directionRatio = 1.5; // dominant axis must beat the other by 1.5x

  const cancelGesture = () => {
    touchStart.current = null;
    touchEnd.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    // A second finger or resting palm means this is not a navigation swipe.
    if (e.touches.length > 1) {
      cancelGesture();
      return;
    }
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: performance.now(),
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 1) {
      cancelGesture();
      return;
    }
    if (!touchStart.current) return;
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchEnd = () => {
    if (!enabled || !touchStart.current || !touchEnd.current) {
      cancelGesture();
      return;
    }

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const elapsed = Math.max(performance.now() - touchStart.current.time, 1);
    cancelGesture();

    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY) * directionRatio;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX) * directionRatio;

    if (isHorizontalSwipe) {
      if (Math.abs(distanceX) < minSwipeDistance) return;
      if (Math.abs(distanceX) / elapsed < minSpeed) return;
      if (distanceX > 0) {
        onSwipeLeft && onSwipeLeft();
      } else {
        onSwipeRight && onSwipeRight();
      }
    } else if (isVerticalSwipe) {
      if (Math.abs(distanceY) < minSwipeDistance) return;
      if (Math.abs(distanceY) / elapsed < minSpeed) return;
      if (distanceY > 0) {
        onSwipeUp && onSwipeUp();
      } else {
        onSwipeDown && onSwipeDown();
      }
    }
    // Diagonal or ambiguous drags fall through — treated as accidental.
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
