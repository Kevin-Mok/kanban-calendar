import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { DraggableEvent } from './DraggableEvent';

interface DayColumnProps {
  date: Date;
  events: Event[];
  isMobile: boolean;
  index: number;
  onEventClick: (event: Event) => void;
  onDragStart: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onDragEnd: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
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

  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

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
              onEventClick={onEventClick}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
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