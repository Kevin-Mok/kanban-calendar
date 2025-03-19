"use client";

import { useState, useEffect, useRef } from 'react';
import { dropTargetForElements, monitorForElements, draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { format, addDays, startOfWeek, differenceInDays } from 'date-fns';
import { useWindowSize } from '@/hooks/useWindowSize';
import EventModal from '@/components/EventModal';
import eventsData from '@/data/events';
import { Event, EventsByDate } from '@/types';

const Calendar = () => {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(width < 768); // Update isMobile after hydration
  }, [width]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDay, setActiveDay] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<EventsByDate>(eventsData);

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const handleDragEnd = (event: any) => {
    const { source, location } = event;
    if (!location?.current?.dropTargets[0]) return;

    const dropTarget = location.current.dropTargets[0].data;
    const movedEvent = Object.values(events)
      .flat()
      .find(e => e.id === source.data.id);

    if (movedEvent) {
      const newEvents = { ...events };
      const sourceDate = source.data.date;
      const targetDate = dropTarget.date;

      // Remove from source date
      newEvents[sourceDate] = newEvents[sourceDate].filter(e => e.id !== movedEvent.id);
      // Add to target date
      newEvents[targetDate] = [...(newEvents[targetDate] || []), movedEvent];

      setEvents(newEvents);
    }
  };

  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop: handleDragEnd,
    });
    return () => cleanup();
  }, [events]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
  });

  const handleSwipe = (dir: 'left' | 'right') => {
    if (isMobile) {
      setActiveDay(prev => dir === 'left' ? prev + 1 : prev - 1);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header 
        currentDate={currentDate} 
        isMobile={isMobile} 
        activeDay={activeDay}
      />
      
      <div {...swipeHandlers} className="flex-1 overflow-hidden">
        <div className={`flex ${!isMobile && 'gap-4'} h-full p-4`}>
          {getWeekDays(currentDate).map((date, index) => (
            <DayColumn
              key={date.toISOString()}
              date={date}
              events={events[format(date, 'yyyy-MM-dd')] || []}
              isMobile={isMobile}
              index={index}
              activeDay={activeDay}
              onEventClick={setSelectedEvent}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const DayColumn = ({ date, events, index, activeDay, onEventClick }: any) => {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false); // Default to false for SSR

  useEffect(() => {
    setIsMobile(width < 768); // Update isMobile after hydration
  }, [width]);

  const dayOffset = differenceInDays(date, startOfWeek(date));
  const isActive = isMobile ? activeDay === dayOffset : true;

  useEffect(() => {
    const element = document.querySelector(`[data-day="${dayOffset}"]`);
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ date: format(date, 'yyyy-MM-dd') }),
    });
  }, [date, dayOffset]);

  return (
    <motion.div
      className={`flex-1 ${isMobile ? 'min-w-[90vw]' : ''}`}
      data-day={dayOffset}
      style={{ transform: `translateX(-${activeDay * 100}%)` }}
      animate={{ x: isMobile ? -activeDay * 100 + '%' : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="h-full bg-gray-50 rounded-lg p-2">
        <div className="font-bold mb-2">
          {format(date, 'EEE, MMM d')}
        </div>
        {events.map((event: Event) => (
          <DraggableEvent
            key={event.id}
            event={event}
            date={format(date, 'yyyy-MM-dd')}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </motion.div>
  );
};

const DraggableEvent = ({ event, date, onEventClick }: { event: Event; date: string; onEventClick: (event: Event) => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return draggable({
      element,
      getInitialData: () => ({ id: event.id, date }),
    });
  }, [event.id, date]);

  return (
    <motion.div
      ref={ref}
      layoutId={event.id}
      onClick={() => onEventClick(event)}
      className="bg-white p-4 rounded shadow mb-2"
    >
      <h3 className="font-medium">{event.title}</h3>
      <p className="text-sm text-gray-500">{event.time}</p>
    </motion.div>
  );
};

const Header = ({ currentDate, activeDay }: { currentDate: Date; activeDay: number }) => {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false); // Default to false for SSR

  useEffect(() => {
    setIsMobile(width < 768); // Update isMobile after hydration
  }, [width]);

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        {isMobile ? (
          <h2 className="text-xl font-bold">
            {format(addDays(startOfWeek(currentDate), activeDay), 'MMMM yyyy')}
          </h2>
        ) : (
          <div className="flex gap-4">
            <button>Previous Week</button>
            <h2>{format(currentDate, 'MMMM yyyy')}</h2>
            <button>Next Week</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
