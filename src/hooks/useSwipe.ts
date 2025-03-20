import { useRef, useState } from 'react';

type SwipeDirection = 'left' | 'right';
type SwipeHandler = (direction: 'left' | 'right', delta: number) => void;

const SWIPE_THRESHOLD = 50; // Minimum distance to consider a swipe

export function useSwipe(onSwipe?: SwipeHandler) {
  const touchStart = useRef({ x: 0, y: 0 });
  const [swipeDelta, setSwipeDelta] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStart.current.x;
    setSwipeDelta(deltaX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      onSwipe?.(deltaX > 0 ? 'right' : 'left', deltaX);
    }
    setSwipeDelta(0);
  };

  return { onTouchStart, onTouchMove, onTouchEnd, swipeDelta };
} 