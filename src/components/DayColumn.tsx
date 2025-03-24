import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import DraggableEvent from './DraggableEvent';
import { Event } from '../types';

interface DayColumnProps {
  date: Date;
  events: Event[];
  isMobile: boolean;
  index: number;
  onEventClick: (eventData: { event: Event; date: string }) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  handleEventMove: (eventId: string, newDate: Date) => void;
  onDayChange: (dir: 'left' | 'right') => void;
  isClient: boolean;
}

const DayColumn: React.FC<DayColumnProps> = ({
  date,
  events,
  isMobile,
  index,
  onEventClick,
  onDragStart,
  onDragEnd,
  handleEventMove,
  onDayChange,
  isClient
}) => {
  const columnRef = useRef<HTMLDivElement>(null);

  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    return timeA - timeB;
  });

  const handleMove = (dir: 'up' | 'down') => {
    // ... existing code ...
  };

  return (
    <motion.div
      ref={columnRef}
      className={`flex-1 ${isMobile ? 'min-w-[calc(100vw-32px)]' : ''} bg-gray-50 rounded-lg p-2 relative`}
      data-day={index}
    >
      <div className="font-bold mb-2 text-black text-xl">
        {format(date, 'EEE, MMM d')}
      </div>

      <div className="relative z-10">
        {sortedEvents
          .filter(event => event && event.id)
          .map((event, index) => (
            <DraggableEvent
              key={event.id}
              event={event}
              date={format(date, 'yyyy-MM-dd')}
              onEventClick={(eventData) => onEventClick({ event: eventData.event, date: eventData.date })}
              onDragStart={() => onDragStart()}
              onDragEnd={() => onDragEnd()}
              onDayChange={(dir) => {
                onDayChange(dir);
                const newDate = addDays(date, dir === 'left' ? -1 : 1);
                handleEventMove(event.id, newDate);
              }}
              isClient={isClient}
            />
          ))}
      </div>
    </motion.div>
  );
};

export default DayColumn; 