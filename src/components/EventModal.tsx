import { motion } from 'framer-motion';
import { Event } from '@/types';

const EventModal = ({ event, onClose }: { event: Event; onClose: () => void }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        layoutId={event.id}
        className="bg-white rounded-lg p-6 max-w-md w-full"
        onClick={onClose}
      >
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <motion.h2 className="text-2xl font-bold">{event.title}</motion.h2>
        <motion.p className="text-gray-600 mt-2">{event.description}</motion.p>
        <motion.p className="text-sm text-gray-500 mt-4">
          {event.time}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default EventModal;
