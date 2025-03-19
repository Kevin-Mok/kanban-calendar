"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  dropTargetForElements,
  monitorForElements,
  draggable,
  attachClosestEdge,
  getClosestEdge
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { format, addDays, startOfWeek, differenceInDays, parseISO } from 'date-fns';
import { useWindowSize } from '@/hooks/useWindowSize';
import EventModal from '@/components/EventModal';
import eventsData from '@/data/events';
//import { Event, EventsByDate } from '@/types';
import types from '@/types';

type Event = types.Event;
type EventsByDate = types.EventsByDate;

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
  const [dragPreview, setDragPreview] = useState<{
    event: Event;
    targetDate: string;
  } | null>(null);

  const handleDragEnd = useCallback((event: any) => {
    const { source, location } = event;
    if (!location?.current?.dropTargets[0]) return;

    const dropTarget = location.current.dropTargets[0].data;
    const movedEvent = Object.values(eventsRef.current)
      .flat()
      .find(e => e.id === source.data.id);

    if (movedEvent) {
      const newEvents = { ...eventsRef.current };
      const sourceDate = source.data.date;
      const targetDate = dropTarget.date;

      // Update the event's date when moving between weeks
      const updatedEvent = { ...movedEvent, date: targetDate };

      newEvents[sourceDate] = (newEvents[sourceDate] || []).filter(e => e.id !== movedEvent.id);
      newEvents[targetDate] = [...(newEvents[targetDate] || []), updatedEvent];

      setEvents(newEvents);
    }
    setDragPreview(null); 
  }, []);

  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop: handleDragEnd,
      onDrag: ({ location }) => {
        const dropTarget = location?.current?.dropTargets[0]?.data;
        if (dropTarget?.date) {
          const movedEvent = Object.values(events)
            .flat()
            .find(e => e.id === location?.initial.data.id);
          
          if (movedEvent) {
            setDragPreview({
              event: movedEvent,
              targetDate: dropTarget.date
            });
          }
        } else {
          setDragPreview(null); // Clear preview if not over a valid drop target
        }
      }
    });
    return () => cleanup();
  }, [events, handleDragEnd]);

  const eventsRef = useRef(eventsData);
  eventsRef.current = events;

  useEffect(() => {
    document.body.style.touchAction = 'manipulation';
    return () => {
      document.body.style.touchAction = '';
    };
  }, []);

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const handlePreviousWeek = useCallback(() => {
    setCurrentDate(prev => addDays(prev, -7));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentDate(prev => addDays(prev, 7));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedEvent) return; // Ignore if modal is open
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePreviousWeek();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNextWeek();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePreviousWeek, handleNextWeek, selectedEvent]);


  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop: handleDragEnd,
    });
    return () => cleanup();
  }, [handleDragEnd]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (e) => {
      if (!e.event.target?.closest?.('[data-draggable-event]')) {
        setActiveDay(prev => Math.min(6, prev + 1));
      }
    },
    onSwipedRight: (e) => {
      if (!e.event.target?.closest?.('[data-draggable-event]')) {
        setActiveDay(prev => Math.max(0, prev - 1));
      }
    },
    trackTouch: true,
    delta: 50, // Minimum swipe distance
    preventScrollOnSwipe: true
  });

  const handleSwipe = (dir: 'left' | 'right') => {
    if (isMobile) {
      setActiveDay(prev => dir === 'left' ? prev + 1 : prev - 1);
    }
  };

  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop: handleDragEnd,
      onDrag: ({ location }) => {
        const dropTarget = location?.current?.dropTargets[0]?.data;
        if (dropTarget?.date) {
          const movedEvent = Object.values(events)
            .flat()
            .find(e => e.id === location?.initial.data.id);
          
          if (movedEvent) {
            setDragPreview({
              event: movedEvent,
              targetDate: dropTarget.date
            });
          }
        }
      }
    });
    return () => cleanup();
  }, [events, handleDragEnd]);

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
              dragPreview={dragPreview?.targetDate === format(date, 'yyyy-MM-dd') ? dragPreview.event : null}
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

interface DayColumnProps {
  date: Date;
  events: Event[];
  isMobile: boolean;
  index: number;
  activeDay: number;
  onEventClick: (event: Event) => void;
  dragPreview: Event | null;
}

//const DayColumn = ({ date, events, index, activeDay, onEventClick }: any) => {
const DayColumn = ({ date, events, activeDay, dragPreview, ...props }: DayColumnProps) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false); // Default to false for SSR

  useEffect(() => {
    setIsMobile(width < 768); // Update isMobile after hydration
  }, [width]);

  const dayOffset = differenceInDays(date, startOfWeek(date));
  const isActive = isMobile ? activeDay === dayOffset : true;

  useEffect(() => {
    const element = columnRef.current;
    if (!element) return;

    const cleanup = dropTargetForElements({
      element,
      getData: () => ({ date: format(date, 'yyyy-MM-dd') }),
    });

    return cleanup;
  }, [date, activeDay]);

  return (
    <motion.div
      ref={columnRef}
      className={`flex-1 ${isMobile ? 'min-w-[90vw]' : ''}`}
      data-day={dayOffset}
      style={{ 
        transform: `translateX(-${activeDay * 100}%)`,
        // Ensure all columns are rendered in DOM for desktop
        display: isMobile ? undefined : 'block'
      }}
      animate={{ x: isMobile ? -activeDay * 100 + '%' : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="h-full bg-gray-50 rounded-lg p-2">
        <div className="font-bold mb-2">
          {format(date, 'EEE, MMM d')}
        </div>
        {/* Preview element */}
        {dragPreview && (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="bg-blue-100 p-4 rounded shadow mb-2 m-2 border-2 border-blue-300"
            >
              <h3 className="font-medium">{dragPreview.title}</h3>
              <p className="text-sm text-gray-500">{dragPreview.time}</p>
            </motion.div>
          </div>
        )}

        {/* Real events */}
        <div className="relative z-10">
          {events.map((event: Event) => (
            <DraggableEvent
              key={event.id}
              event={event}
              date={format(date, 'yyyy-MM-dd')}
              onEventClick={props.onEventClick}
            />
          ))}
        </div>
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
      onDragStart: () => {
        element.style.opacity = '0.5';
        element.style.transform = 'scale(0.98)';
      },
      onDrop: () => {
        element.style.opacity = '';
        element.style.transform = '';
      }
    });
  }, [event.id, date]);

  return (
    <motion.div
      ref={ref}
      layoutId={event.id}
      onClick={() => onEventClick(event)}
      className="bg-white p-4 rounded shadow mb-2 cursor-grab active:cursor-grabbing transition-all"
      whileHover={{ scale: 1.01 }}
    >
      <h3 className="font-medium">{event.title}</h3>
      <p className="text-sm text-gray-500">{event.time}</p>
    </motion.div>
  );
};

const Header = ({ 
  currentDate, 
  activeDay,
  onPreviousWeek,
  onNextWeek
}: { 
  currentDate: Date; 
  activeDay: number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}) => {
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
            <button onClick={onPreviousWeek}>Previous Week</button>
            <h2>{format(currentDate, 'MMMM yyyy')}</h2>
            <button onClick={onNextWeek}>Next Week</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
