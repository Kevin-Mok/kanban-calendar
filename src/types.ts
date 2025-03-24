export interface Event {
  id: string;
  title: string;
  time: string;
  description?: string;
  imageUrl?: string;
}

export type EventsByDate = {
  [date: string]: Event[];
}; 