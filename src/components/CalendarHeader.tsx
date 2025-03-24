import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

function CalendarHeader({ currentDate, onPrevWeek, onNextWeek }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-purple-500">
      <button 
        onClick={onPrevWeek}
        className="p-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 hover:from-indigo-500 hover:to-violet-500"
      >
        {/* Left arrow icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <h2 className="text-xl font-semibold text-purple-100 font-sans">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      
      <button 
        onClick={onNextWeek}
        className="p-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 hover:from-indigo-500 hover:to-violet-500"
      >
        {/* Right arrow icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default CalendarHeader; 