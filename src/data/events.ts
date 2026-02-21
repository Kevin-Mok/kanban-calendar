import { format } from 'date-fns';
import { Event, EventsByDate } from '@/types';

type EventTemplate = {
  title: string;
  description: string;
};

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAILY_EVENT_PATTERN = [1, 2, 2, 2, 1, 2, 1]; // Sun-Sat: baseline 11 events/week

const EVENT_TIMES = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
];

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    title: 'Sprint Planning',
    description: 'Align priorities and finalize the upcoming sprint scope.',
  },
  {
    title: 'Product Roadmap Review',
    description: 'Review milestone progress and adjust delivery priorities.',
  },
  {
    title: 'Client Check-In',
    description: 'Share updates, gather feedback, and confirm next milestones.',
  },
  {
    title: 'Design Critique',
    description: 'Evaluate current UI work and agree on final refinements.',
  },
  {
    title: 'Engineering Sync',
    description: 'Coordinate implementation details and unblock dependencies.',
  },
  {
    title: 'QA Triage',
    description: 'Prioritize defects and confirm fixes for the next release.',
  },
  {
    title: 'Stakeholder Update',
    description: 'Summarize progress, risks, and upcoming release targets.',
  },
  {
    title: 'Team Retrospective',
    description: 'Capture lessons learned and define clear improvement actions.',
  },
  {
    title: 'Metrics Review',
    description: 'Analyze delivery and product metrics to guide planning.',
  },
  {
    title: 'Release Readiness',
    description: 'Validate release checklist and finalize deployment timing.',
  },
];

const getDailyEventCount = (date: Date): number => DAILY_EVENT_PATTERN[date.getDay()];

const parseDateKey = (dateKey: string): Date | null => {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    return null;
  }

  const parsedDate = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return format(parsedDate, 'yyyy-MM-dd') === dateKey ? parsedDate : null;
};

const getDateSeed = (date: Date): number =>
  date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate();

const createEvent = (dateKey: string, eventIndex: number, seed: number): Event => {
  const template = EVENT_TEMPLATES[(seed + eventIndex) % EVENT_TEMPLATES.length];
  const time = EVENT_TIMES[(seed + eventIndex * 2) % EVENT_TIMES.length];
  const imageSeed = ((seed + 1) * 31 + eventIndex * 17) % 1000;

  return {
    id: `event-${dateKey}-${eventIndex + 1}`,
    title: template.title,
    description: template.description,
    imageUrl: `https://picsum.photos/1920/1080?random=${imageSeed + 1}`,
    time,
  };
};

export const generateEventsForDate = (dateKey: string): Event[] => {
  const date = parseDateKey(dateKey);
  if (!date) {
    return [];
  }

  const daySeed = getDateSeed(date);
  const eventCount = getDailyEventCount(date);

  return Array.from({ length: eventCount }, (_, eventIndex) =>
    createEvent(dateKey, eventIndex, daySeed + eventIndex)
  );
};

const createInfiniteEventStore = (): EventsByDate => {
  const cache: EventsByDate = {};

  return new Proxy(cache, {
    get(target, prop, receiver) {
      if (typeof prop !== 'string') {
        return Reflect.get(target, prop, receiver);
      }

      if (
        !Object.prototype.hasOwnProperty.call(target, prop) &&
        DATE_KEY_PATTERN.test(prop)
      ) {
        target[prop] = generateEventsForDate(prop);
      }

      return Reflect.get(target, prop, receiver);
    },
  });
};

const events: EventsByDate = createInfiniteEventStore();

export default events;
