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
import { format, addDays, startOfWeek, differenceInDays, parseISO } from 'date-fns';
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
  const [dragPreview, setDragPreview] = useState<{
    event: Event;
    targetDate: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

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

      // Update the event's date when moving between weeks
      const updatedEvent = { ...movedEvent, date: targetDate };

      newEvents[sourceDate] = (newEvents[sourceDate] || []).filter((e: Event) => e.id !== movedEvent.id);
      newEvents[targetDate] = [...(newEvents[targetDate] || []), updatedEvent];

      setEvents(newEvents);
    }
    setDragPreview(null); 
  }, []);

  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop: handleDragEnd,
      onDrag: ({ source, location }) => {
        //console.log('Drag source data:', source?.data);
        //console.log('Current drop targets:', location?.current?.dropTargets);

        if (!source?.data) {
          console.warn('No drag data found. Source:', source);
          setDragPreview(null);
          return;
        }

        const dropTarget = location?.current?.dropTargets[0]?.data;
        if (dropTarget?.date) {
          const movedEvent = Object.values(events)
            .flat()
            .find((e: Event) => e.id === source.data.id);
          
          if (movedEvent) {
            setDragPreview({
              event: movedEvent,
              targetDate: dropTarget.date
            });
          }
        } else {
          setDragPreview(null);
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

  useEffect(() => {
    if (width !== undefined) {
      setIsMobile(width < 768);
    }
  }, [width]);

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
    
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const targetIndex = Math.round(-offset / containerWidth);
    const newDate = addDays(currentDate, targetIndex);
    
    // Animate to the new center position
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
    setEvents(prev => {
      const newEvents = { ...prev };
      const oldDateKey = Object.keys(newEvents).find(key => 
        newEvents[key].some((e: Event) => e.id === eventId)
      );
      
      if (oldDateKey) {
        const event = newEvents[oldDateKey].find((e: Event) => e.id === eventId);
        if (event) {
          const newDateKey = format(newDate, 'yyyy-MM-dd');
          
          // Remove from old date
          newEvents[oldDateKey] = newEvents[oldDateKey].filter((e: Event) => e.id !== eventId);
          
          // Add to new date
          newEvents[newDateKey] = [
            ...(newEvents[newDateKey] || []),
            { ...event, date: newDateKey }
          ];
        }
      }
      return newEvents;
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <Header 
        currentDate={currentDate} 
        isMobile={isMobile} 
      />
      
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
              style={{ 
                x: offset - (containerRef.current?.offsetWidth || 0),
                width: '300%',
                transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
              }}
            >
              {[addDays(currentDate, -1), currentDate, addDays(currentDate, 1)].map((date, index) => (
                <motion.div
                  key={date.toISOString()}
                  className="w-[100vw] flex-shrink-0 h-full px-2"
                  style={{
                    opacity: 1 - Math.abs(offset)/(containerRef.current?.offsetWidth || 1 * 0.5),
                    scale: 1 - Math.abs(offset)/(containerRef.current?.offsetWidth || 1 * 2),
                  }}
                >
                  <DayColumn
                    date={date}
                    events={events[format(date, 'yyyy-MM-dd')] || []}
                    isMobile={isMobile}
                    index={index}
                    onEventClick={setSelectedEvent}
                    dragPreview={dragPreview?.targetDate === format(date, 'yyyy-MM-dd') ? dragPreview.event : null}
                    onDragStart={() => setIsEventDragging(true)}
                    onDragEnd={() => setIsEventDragging(false)}
                    handleEventMove={handleEventMove}
                    onDayChange={handleDayChange}
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
                onEventClick={setSelectedEvent}
                dragPreview={dragPreview?.targetDate === format(date, 'yyyy-MM-dd') ? dragPreview.event : null}
                onDragStart={() => setIsEventDragging(true)}
                onDragEnd={() => setIsEventDragging(false)}
                handleEventMove={handleEventMove}
                onDayChange={handleDayChange}
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
  onEventClick: (event: Event) => void;
  dragPreview: Event | null;
  onDragStart: () => void;
  onDragEnd: () => void;
  handleEventMove: (eventId: string, newDate: Date) => void;
  onDayChange: (direction: 'left' | 'right') => void;
}

const PreviewComponent = ({ event }: { event: Event }) => (
  <motion.div
    className="bg-blue-100 p-4 rounded shadow mb-2 mx-1 border-2 border-blue-300  pointer-events-none"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 0.4, scale: 1 }}
    exit={{ opacity: 0 }}
  >
    <h3 className="font-medium">{event.title}</h3>
    <p className="text-sm text-gray-500">{event.time}</p>
  </motion.div>
);

const DayColumn = ({ 
  date, 
  events, 
  dragPreview, 
  onDragStart, 
  onDragEnd,
  onEventClick,
  handleEventMove,
  onDayChange
}: DayColumnProps) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false); // Default to false for SSR

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

  const sortedEvents = useMemo(() => 
    [...events].sort((a, b) => 
      parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
    ),
    [events]
  );


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

  const previewPosition = useMemo(() => {
    if (!dragPreview) return -1;
    
    const previewMinutes = parseTimeToMinutes(dragPreview.time);
    
    return sortedEvents.findIndex(event => {
      const eventMinutes = parseTimeToMinutes(event.time);
      return eventMinutes >= previewMinutes;
    });
  }, [sortedEvents, dragPreview]);

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
        {sortedEvents.map((event, index) => (
          <DraggableEvent
            key={event.id}
            event={event}
            date={format(date, 'yyyy-MM-dd')}
            onEventClick={onEventClick}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDayChange={(dir) => {
              // Update calendar view first
              onDayChange(dir);
              // Then move the event to the new date
              const newDate = addDays(date, dir === 'left' ? -1 : 1);
              handleEventMove(event.id, newDate);
            }}
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
  onDayChange
}: { 
  event: Event; 
  date: string;
  onEventClick: (event: Event) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDayChange: (direction: 'left' | 'right') => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const screenWidth = useRef(window.innerWidth);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const cleanup = draggable({
      element,
      onDragStart: () => {
        screenWidth.current = window.innerWidth;
        setIsDragging(true);
        onDragStart();
      },
      onDrag: ({ location }) => {
        const currentX = location.current.input.clientX;
        
        // Simple edge detection without delta checks
        if (currentX < 50) {
          onDayChange('left');
        } else if (currentX > screenWidth.current - 50) {
          onDayChange('right');
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
      onClick={() => !isDragging && onEventClick(event)}
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
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-black">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>
    </div>
  );
};

export default Calendar;
