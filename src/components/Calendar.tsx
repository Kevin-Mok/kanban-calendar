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
import WeekHeader from '@/components/WeekHeader';
import DayColumn from '@/components/DayColumn';

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
    
    if (Math.abs(swipeDelta) > 5 && Date.now() - touchStartTime.current > 50) {
      setOffset(swipeDelta);
      
      if (swipeDelta < -30 && !tempDate) {
        setTempDate(addDays(currentDate, 1));
      } else if (swipeDelta > 30 && !tempDate) {
        setTempDate(addDays(currentDate, -1));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchDuration = Date.now() - touchStartTime.current;
    setIsSwiping(false);
    onTouchEnd(e);
    
    if (Math.abs(swipeDelta) > 30 && touchDuration > 100) {
      const containerWidth = isClient ? (containerRef.current?.offsetWidth || window.innerWidth) : 0;
      const targetIndex = Math.round(offset / containerWidth);
      const newDate = addDays(currentDate, -targetIndex);
      
      if (!isSameDay(newDate, currentDate)) {
        setCurrentDate(newDate);
      }
    }
    
    requestAnimationFrame(() => {
      setOffset(0);
    });
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
    x: offset,
    width: '300%',
    transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const motionDivStyle = {
    opacity: 1 - Math.abs(offset)/(isClient ? (containerRef.current?.offsetWidth || 1) * 0.5 : 1),
    scale: 1 - Math.abs(offset)/(isClient ? (containerRef.current?.offsetWidth || 1) * 2 : 1),
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const handleEventClick = useCallback(({ event, date }: { event: Event; date: string }) => {
    setSelectedEvent(event);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Fix the date array for mobile view
  const mobileDates = useMemo(() => [
    currentDate,
    addDays(currentDate, 1),
    addDays(currentDate, -1)
  ], [currentDate]);

  return (
    <div className="h-screen flex flex-col">
      <CalendarHeader 
        currentDate={currentDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />
      {isMobile && <WeekHeader currentDate={currentDate} onDayClick={handleDayClick} />}
      
      <div 
        ref={containerRef}
        className={`flex-1 ${isMobile ? 'overflow-hidden' : 'overflow-y-auto'} bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe]`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`flex ${!isMobile && 'gap-4'} ${isMobile ? 'h-full' : 'min-h-full'} p-4`}>
          {isMobile ? (
            <motion.div 
              className="flex h-full"
              style={mobileViewStyle}
            >
              {mobileDates.map((date, index) => (
                <div
                  key={date.toISOString()}
                  className="w-[100vw] flex-shrink-0 h-full px-2"
                  style={{
                    transform: `translateX(${index === 1 ? offset : 0}px)`, // Only transform middle column
                    transition: motionDivStyle.transition,
                    contain: 'strict',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <DayColumn
                    date={date}
                    events={events[format(date, 'yyyy-MM-dd')] || []}
                    index={index}
                    onEventClick={handleEventClick}
                    onDragStart={() => setIsEventDragging(true)}
                    onDragEnd={() => setIsEventDragging(false)}
                    handleEventMove={handleEventMove}
                    onDayChange={handleDayChange}
                    isClient={isClient}
                  />
                </div>
              ))}
            </motion.div>
          ) : (
            getWeekDays(currentDate).map((date, index) => (
              <DayColumn
                key={date.toISOString()}
                date={date}
                events={events[format(date, 'yyyy-MM-dd')] || []}
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

export default Calendar;
