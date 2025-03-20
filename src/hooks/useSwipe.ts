import { useRef } from 'react';

type SwipeDirection = 'left' | 'right';
type SwipeCallback = (direction: SwipeDirection) => void;

const SWIPE_THRESHOLD = 50; // Minimum distance to consider a swipe

export function useSwipe(onSwipe: SwipeCallback) {
  const touchStart = useRef({ x: 0, y: 0 });

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStart.current.x;
    const deltaY = touchEnd.y - touchStart.current.y;

    // Check if horizontal swipe and meets threshold
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      onSwipe(deltaX > 0 ? 'right' : 'left');
    }
  };

  return { onTouchStart, onTouchEnd };
} 