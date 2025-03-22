export interface Event {
  id: string;
  title: string;
  time: string;
  date: string;
  description?: string;
  imageUrl?: string;
  // add other properties as needed
}

export type EventsByDate = {
  [date: string]: Event[];
}; 