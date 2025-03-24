import { useRef, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays, startOfWeek, addDays } from 'date-fns';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import DraggableEvent from './DraggableEvent';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Event } from '@/types';

interface DayColumnProps {
  date: Date;
  events: Event[];
  index: number;
  onEventClick: ({ event, date }: { event: Event; date: string }) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  handleEventMove: (eventId: string, newDate: Date) => void;
  onDayChange: (direction: 'left' | 'right') => void;
  isClient: boolean;
}

const DayColumn = ({ 
  date, 
  events, 
  onDragStart, 
  onDragEnd,
  onEventClick,
  handleEventMove,
  onDayChange,
  isClient
}: DayColumnProps) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false);

  const parseTimeToMinutes = (time: string) => {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  const sortedEvents = useMemo(() => {
    const seenIds = new Set<string>();
    return [...events]
      .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time))
      .filter(event => {
        if (seenIds.has(event.id)) {
          return false;
        }
        seenIds.add(event.id);
        return true;
      });
  }, [events]);

  useEffect(() => {
    setIsMobile(width < 768);
  }, [width]);

  const dayOffset = differenceInDays(date, startOfWeek(date));

  useEffect(() => {
    const element = columnRef.current;
    if (!element) return;

    const cleanup = dropTargetForElements({
      element,
      getData: () => ({ date: format(date, 'yyyy-MM-dd') }),
    });

    return cleanup;
  }, [date]);

  return (
    <motion.div
      ref={columnRef}
      className={`flex-1 ${isMobile ? 'min-w-[calc(100vw-32px)]' : ''} bg-gray-50 rounded-lg p-2 relative`}
      data-day={dayOffset}
    >
      <div className="font-bold mb-2 text-purple-500 text-med">
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