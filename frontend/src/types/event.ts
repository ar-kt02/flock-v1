interface Event {
  duration: number;
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  imageUrl: string;
  maxAttendees: number;
  category: string;
  isVirtual: boolean;
  attendees?: { id: string }[];
  createdAt: string;
  isExpired: boolean;
}

export default Event;
