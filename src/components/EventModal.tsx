import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';

interface Event {
  id: string;
  title: string;
  time: string;
  description?: string;
  imageUrl?: string;
}

interface EventModalProps {
  event: Event;
  date: string;
  onClose: () => void;
}

const EventModal = ({ event, date, onClose }: EventModalProps) => {
  const eventDate = parseISO(date);
  const formattedDate = isValid(eventDate) ? format(eventDate, 'MMM d, yyyy') : 'Invalid date';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-lg p-6 max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <motion.h2 className="text-lg mb-4 font-sans">{event.title}</motion.h2>
          <motion.p className="text-gray-600 mb-2 font-sans">Date: {formattedDate}</motion.p>
          <motion.p className="text-gray-600 font-sans">Time: {event.time}</motion.p>
          {event.description && (
            <motion.p className="text-gray-600 font-sans">
              Description: {event.description}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventModal;
