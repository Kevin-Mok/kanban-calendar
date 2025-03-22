export interface Event {
  id: string;
  title: string;
  time: string;
  date: Date;
  description?: string;
  imageUrl?: string;
  // add other properties as needed
}

export type EventsByDate = {
  [date: string]: Event[];
}; 