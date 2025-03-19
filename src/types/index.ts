export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  time: string;
}

export interface EventsByDate {
  [date: string]: Event[];
}
