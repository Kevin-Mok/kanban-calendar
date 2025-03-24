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
        onDragStart();
        lastChangeTime.current = Date.now();
      },
      onDrag: ({ location }) => {
        const currentX = location.current.input.clientX;
        const now = Date.now();
        
        if (now - lastChangeTime.current > 500) {
          if (currentX < 50) {
            lastChangeTime.current = now;
            onDayChange('left');
          } else if (currentX > screenWidth.current - 50) {
            lastChangeTime.current = now;
            onDayChange('right');
          }
        }
      },
      onDrop: () => {
        setIsDragging(false);
        onDragEnd();
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
      className="bg-white p-4 rounded shadow mb-2 cursor-grab active:cursor-grabbing transition-all relative select-none"
      whileHover={{ scale: 1.01 }}
      style={{
        opacity: isDragging ? 0.7 : 1,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation'
      }}
    >
      <div className="relative rounded overflow-hidden mb-2">
        {event.imageUrl && (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-16 md:h-12 object-cover pointer-events-none"
            draggable="false"
          />
        )}
        <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {event.time}
        </div>
      </div>
      <h3 className="font-medium text-black">{event.title}</h3>
    </motion.div>
  );
} 