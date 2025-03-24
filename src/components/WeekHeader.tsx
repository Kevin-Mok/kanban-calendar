import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

interface WeekHeaderProps {
  currentDate: Date;
}

const WeekHeader = ({ currentDate }: WeekHeaderProps) => {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  return (
    <div className="flex justify-between px-2 py-3 bg-gradient-to-r from-blue-500 to-purple-500">
      {weekDays.map((day, index) => (
        <motion.div
          key={day.toISOString()}
          className="flex flex-col items-center flex-1"
          initial={false}
          animate={{ backgroundColor: 'transparent' }}
          transition={{ duration: 0.3 }}
        >
          <div className={`w-full px-2 py-2 rounded-md flex flex-col items-center gap-1 ${
            isSameDay(day, currentDate) 
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white' 
              : 'text-purple-100'
          }`}>
            <div className="text-sm font-medium">
              {format(day, 'EEE')}
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              {format(day, 'd')}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default WeekHeader; 