"use client";

import { 
  useState, 
  useEffect,
  useRef,
  useCallback,
  useMemo } from 'react';
import { 
  dropTargetForElements,
  monitorForElements,
  draggable
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipe } from '@/hooks/useSwipe';
import { format, addDays, startOfWeek, differenceInDays, parseISO, isSameDay } from 'date-fns';
import { useWindowSize } from '@/hooks/useWindowSize';
import EventModal from '@/components/EventModal';
import eventsData from '@/data/events';
import { Event, EventsByDate } from '@/types';
import CalendarHeader from '@/components/CalendarHeader';
import DraggableEvent from './DraggableEvent';

const Calendar = () => {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(true);
  const [isSwiping, setIsSwiping] = useState(false);
  const [offset, setOffset] = useState(0);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [isEventDragging, setIsEventDragging] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<EventsByDate>(eventsData);

  const containerRef = useRef<HTMLDivElement>(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const screenWidth = useRef(isClient ? window.innerWidth : 0);

  const handleDragEnd = useCallback((event: any) => {
    const { source, location } = event;
    if (!location?.current?.dropTargets[0]) return;

    const dropTarget = location.current.dropTargets[0].data;
    const movedEvent = Object.values(eventsRef.current)
      .flat()
      .find((e: Event) => e.id === source.data.id);

    if (movedEvent) {
      const newEvents = { ...eventsRef.current };
      const sourceDate = source.data.date;
      const targetDate = dropTarget.date;

      newEvents[sourceDate] = (newEvents[sourceDate] || []).filter((e: Event) => e.id !== movedEvent.id);
      newEvents[targetDate] = [...(newEvents[targetDate] || []), movedEvent];

      setEvents(newEvents);
    }
  }, []);

  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop: handleDragEnd,
    });

    return () => cleanup();
  }, [handleDragEnd]);

  const eventsRef = useRef(eventsData);
  eventsRef.current = events;

  useEffect(() => {
    document.body.style.touchAction = 'manipulation';
    return () => {
      document.body.style.touchAction = '';
    };
  }, []);

  useEffect(() => {
    if (width !== undefined) {
      setIsMobile(width < 768);
    }
  }, [width]);

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const handlePrevWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedEvent) return; // Ignore if modal is open
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevWeek();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNextWeek();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevWeek, handleNextWeek, selectedEvent]);

  const handleSwipe = (dir: 'left' | 'right') => {
    if (isMobile) {
      setDirection(dir);
      setCurrentDate(prev => addDays(prev, dir === 'left' ? 7 : -7));
    }
  };

  const { onTouchStart, onTouchMove, onTouchEnd, swipeDelta } = useSwipe();

  const touchStartTime = useRef(Date.now());

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsSwiping(true);
    touchStartTime.current = Date.now();
    onTouchStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isEventDragging || !isSwiping) return;
    onTouchMove(e);
    setOffset(swipeDelta);
    
    if (swipeDelta < -50 && !tempDate) {
      setTempDate(addDays(currentDate, 1));
    } else if (swipeDelta > 50 && !tempDate) {
      setTempDate(addDays(currentDate, -1));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsSwiping(false);
    onTouchEnd(e);
    
    const containerWidth = isClient ? (containerRef.current?.offsetWidth || window.innerWidth) : 0;
    const targetIndex = Math.round(-offset / containerWidth);
    const newDate = addDays(currentDate, targetIndex);
    
    setCurrentDate(newDate);
    setOffset(0);
    setTempDate(null);
  };

  useEffect(() => {
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    if (!events[todayKey]) {
      setEvents((prev: EventsByDate) => ({
        ...prev,
        [todayKey]: []
      }));
    }
  }, []);

  const handleDayChange = useCallback((direction: 'left' | 'right') => {
    setCurrentDate(prev => {
      const newDate = addDays(prev, direction === 'left' ? -1 : 1);
      setIsEventDragging(false);
      setOffset(direction === 'left' ? -window.innerWidth : window.innerWidth);
      setTimeout(() => setOffset(0), 500);
      return newDate;
    });
  }, []);

  const handleEventMove = (eventId: string, newDate: Date) => {
    setEvents((prev: EventsByDate) => {
      const newEvents = { ...prev };
      const oldDateKey = Object.keys(newEvents).find(key => 
        newEvents[key].some((e: Event) => e.id === eventId)
      );
      
      if (oldDateKey) {
        const event = newEvents[oldDateKey].find((e: Event) => e.id === eventId);
        if (event) {
          const newDateKey = format(newDate, 'yyyy-MM-dd');
          newEvents[oldDateKey] = newEvents[oldDateKey].filter((e: Event) => e.id !== eventId);
          newEvents[newDateKey] = [
            ...(newEvents[newDateKey] || []),
            event
          ];
        }
      }
      return newEvents;
    });
  };

  const mobileViewStyle = {
    x: offset - (isClient ? (containerRef.current?.offsetWidth || window.innerWidth) : 0),
    width: '300%',
    transition: isSwiping ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const motionDivStyle = {
    opacity: 1 - Math.abs(offset)/(isClient ? (containerRef.current?.offsetWidth || 1) * 0.5 : 1),
    scale: 1 - Math.abs(offset)/(isClient ? (containerRef.current?.offsetWidth || 1) * 2 : 1),
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const handleEventClick = useCallback(({ event, date }: { event: Event; date: string }) => {
    setSelectedEvent(event);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <CalendarHeader 
        currentDate={currentDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />
      {isMobile && <WeekHeader currentDate={currentDate} />}
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`flex ${!isMobile && 'gap-4'} h-full p-4`}>
          {isMobile ? (
            <motion.div 
              className="flex h-full"
              style={mobileViewStyle}
            >
              {[addDays(currentDate, -1), currentDate, addDays(currentDate, 1)].map((date, index) => (
                <motion.div
                  key={date.toISOString()}
                  className="w-[100vw] flex-shrink-0 h-full px-2"
                  style={motionDivStyle}
                >
                  <DayColumn
                    date={date}
                    events={events[format(date, 'yyyy-MM-dd')] || []}
                    isMobile={isMobile}
                    index={index}
                    onEventClick={handleEventClick}
                    onDragStart={() => setIsEventDragging(true)}
                    onDragEnd={() => setIsEventDragging(false)}
                    handleEventMove={handleEventMove}
                    onDayChange={handleDayChange}
                    isClient={isClient}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            getWeekDays(currentDate).map((date, index) => (
              <DayColumn
                key={date.toISOString()}
                date={date}
                events={events[format(date, 'yyyy-MM-dd')] || []}
                isMobile={isMobile}
                index={index}
                onEventClick={handleEventClick}
                onDragStart={() => setIsEventDragging(true)}
                onDragEnd={() => setIsEventDragging(false)}
                handleEventMove={handleEventMove}
                onDayChange={handleDayChange}
                isClient={isClient}
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            date={format(currentDate, 'yyyy-MM-dd')}
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
  onEventClick: (eventData: { event: Event; date: string }) => void;
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
      hours += 12; // Convert PM times to 24-hour format
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0; // Handle midnight (12:00 AM)
    }

    return hours * 60 + minutes;
  };

  const sortedEvents = useMemo(() => {
    const seenIds = new Set<string>();
    return [...events]
      .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time))
      .filter(event => {
        if (seenIds.has(event.id)) {
          //console.warn(`Duplicate event ID detected: ${event.id}`);
          return false;
        }
        seenIds.add(event.id);
        return true;
      });
  }, [events]);

  useEffect(() => {
    setIsMobile(width < 768); // Update isMobile after hydration
  }, [width]);

  const dayOffset = differenceInDays(date, startOfWeek(date));
  const isActive = isMobile ? true : true;

  useEffect(() => {
    const element = columnRef.current;
    if (!element) return;

    const cleanup = dropTargetForElements({
      element,
      getData: () => ({ date: format(date, 'yyyy-MM-dd') }),
    });

    return cleanup;
  }, [date]);

  console.log('Date value:', date);
  console.log('Is valid date:', date instanceof Date && !isNaN(date.getTime()));

  return (
    <motion.div
      ref={columnRef}
      className={`flex-1 ${isMobile ? 'min-w-[calc(100vw-32px)]' : ''} bg-gray-50 rounded-lg p-2 relative`}
      data-day={dayOffset}
    >
      <div className="font-bold mb-2 text-black text-xl">
        {format(date, 'EEE, MMM d')}
      </div>

      <div className="relative z-10">
        {sortedEvents
          .filter(event => event && event.id) // Filter out invalid events
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

const WeekHeader = ({ currentDate }: { currentDate: Date }) => {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Start week on Sunday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  return (
    <div className="flex justify-between px-2 py-3 border-b">
      {weekDays.map((day, index) => (
        <motion.div
          key={day.toISOString()}
          className="flex flex-col items-center flex-1"
          initial={false}
          animate={{ backgroundColor: isSameDay(day, currentDate) ? '#3B82F6' : 'transparent' }}
          transition={{ duration: 0.3 }}
        >
          <div className={`text-sm font-medium ${
            isSameDay(day, currentDate) ? 'text-white' : 'text-gray-600'
          }`}>
            {format(day, 'EEE')}
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isSameDay(day, currentDate) ? 'bg-blue-500 text-white' : 'text-gray-900'
          }`}>
            {format(day, 'd')}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Calendar;
