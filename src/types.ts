export interface Event {
  id: string;
  title: string;
  time: string;
  date: string;
  // add other properties as needed
}

export type EventsByDate = {
  [date: string]: Event[];
}; 