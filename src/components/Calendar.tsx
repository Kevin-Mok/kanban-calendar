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

const Calendar = () => {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(true);
  const [isSwiping, setIsSwiping] = useState(false);
  const [offset, setOffset] = useState(0);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [isEventDragging, setIsEventDragging] = useState(false);

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

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

      const updatedEvent = { ...movedEvent, date: targetDate };

      newEvents[sourceDate] = (newEvents[sourceDate] || []).filter((e: Event) => e.id !== movedEvent.id);
      newEvents[targetDate] = [...(newEvents[targetDate] || []), updatedEvent];

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

  const handleSwipe = (dir: 'left' | 'right') => {
    if (isMobile) {
      setDirection(dir);
      setCurrentDate(prev => dir === 'left' ? addDays(prev, 1) : addDays(prev, -1));
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
      // Reset dragging state to enable future swipes
      setIsEventDragging(false);
      // Smooth transition
      setOffset(direction === 'left' ? -window.innerWidth : window.innerWidth);
      setTimeout(() => setOffset(0), 10);
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
    transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
  };

  const motionDivStyle = {
    opacity: 1 - Math.abs(offset)/(isClient ? (containerRef.current?.offsetWidth || 1) * 0.5 : 1),
    scale: 1 - Math.abs(offset)/(isClient ? (containerRef.current?.offsetWidth || 1) * 2 : 1),
  };

  const handleEventClick = useCallback(({ event, date }: { event: Event; date: string }) => {
    setSelectedEvent({
      ...event,
      date
    });
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Header 
        currentDate={currentDate} 
        isMobile={isMobile} 
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

const DraggableEvent = ({ 
  event, 
  date, 
  onEventClick,
  onDragStart,
  onDragEnd,
  onDayChange,
  isClient
}: { 
  event: Event; 
  date: string;
  onEventClick: (eventData: { event: Event; date: string }) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDayChange: (direction: 'left' | 'right') => void;
  isClient: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const screenWidth = useRef(isClient ? window.innerWidth : 0);
  const lastChangeTime = useRef(0);

  if (!event || typeof event !== 'object' || !event.id) {
    console.error('Invalid event object:', event);
    return null;
  }

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
      <h3 className="font-medium text-black">{event.title}</h3>
      <p className="text-sm text-gray-700">{event.time}</p>
    </motion.div>
  );
};

const Header = ({ 
  currentDate, 
  isMobile
}: { 
  currentDate: Date; 
  isMobile: boolean;
}) => {
  const weekRange = useMemo(() => {
    if (!isMobile) return '';
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = addDays(start, 6);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;
  }, [currentDate, isMobile]);

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-black">
          {isMobile ? weekRange : format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>
    </div>
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
