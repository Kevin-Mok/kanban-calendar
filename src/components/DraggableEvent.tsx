import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Event } from '../types';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

interface DraggableEventProps {
  event: Event;
  date: string;
  onEventClick: (eventData: { event: Event; date: string }) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDayChange: (direction: 'left' | 'right') => void;
  isClient: boolean;
}

export default function DraggableEvent({
  event,
  date,
  onEventClick,
  onDragStart,
  onDragEnd,
  onDayChange,
  isClient
}: DraggableEventProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const screenWidth = useRef(isClient ? window.innerWidth : 0);
  const lastChangeTime = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const cleanup = draggable({
      element,
      onDragStart: () => {
        screenWidth.current = window.innerWidth;
        setIsDragging(true);
        setIsTransitioning(true);
        onDragStart();
        lastChangeTime.current = Date.now();
      },
      onDrag: ({ location }) => {
        const currentX = location.current.input.clientX;
        const now = Date.now();
        
        if (now - lastChangeTime.current > 1000) {
          const edgeThreshold = 100;
          if (currentX < edgeThreshold) {
            lastChangeTime.current = now;
            onDayChange('left');
          } else if (currentX > screenWidth.current - edgeThreshold) {
            lastChangeTime.current = now;
            onDayChange('right');
          }
        }
      },
      onDrop: () => {
        setIsDragging(false);
        setIsTransitioning(true);
        onDragEnd();
        setTimeout(() => setIsTransitioning(false), 300);
      },
      getInitialData: () => ({ id: event.id, date }),
      dragHandle: element
    });

    return cleanup;
  }, [date, event.id, onDragEnd, onDragStart, onDayChange]);

  return (
    <motion.div
      ref={ref}
      layoutId={event.id}
      onClick={() => !isDragging && onEventClick({ event, date })}
      className="bg-white p-4 rounded shadow-md mb-2 cursor-grab active:cursor-grabbing transition-all relative select-none"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 1.2 }}
      style={{
        opacity: isDragging ? 0.7 : 1,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
        willChange: 'transform'
      }}
    >
      <div className="relative rounded overflow-hidden mb-2">
        {event.imageUrl && (
          <motion.img 
            layoutId={`event-image-${event.id}`}
            transition={{ duration: 1.2 }}
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-16 md:h-12 object-cover pointer-events-none"
            draggable="false"
          />
        )}
        <motion.div
          layoutId={`event-time-${event.id}`}
          transition={{ duration: 1.2 }}
          className="absolute top-1 right-1 bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-[12px] md:text-[10px] px-1 py-0.5 rounded"
        >
          {event.time}
        </motion.div>
      </div>
      <motion.h3 
        layoutId={`event-title-${event.id}`}
        transition={{ duration: 1.2 }}
        className="text-sm text-black font-sans"
      >
        {event.title}
      </motion.h3>
    </motion.div>
  );
} 