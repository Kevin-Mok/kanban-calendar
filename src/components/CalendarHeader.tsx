import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

function CalendarHeader({ currentDate, onPrevWeek, onNextWeek }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button 
        onClick={onPrevWeek}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        {/* Left arrow icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <h2 className="text-xl font-semibold">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      
      <button 
        onClick={onNextWeek}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        {/* Right arrow icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default CalendarHeader; 