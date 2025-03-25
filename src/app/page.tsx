import Calendar from '@/components/Calendar';

export const metadata = {
  title: 'Kanban Calendar',
  icons: {
    icon: [
      { url: '/calendar.svg' } // Fallback icon
    ],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Calendar />
    </div>
  );
}
