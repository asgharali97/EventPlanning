import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from 'store/authStore';

interface OnlineDetails {
  link: string;
  password?: string;
  platfrom?: string;
}

interface Event {
  _id: string;
  title: string;
  price: number;
  seats: number;
  category: string;
  date: Date;
  time: string;
  description?: string;
  coverImage: string;
  location: string;
  hostId: string;
  isVerified: boolean;
  eventType: "physical" | "online";
  onlineDetails?: OnlineDetails;
  tags?: string[];
}

export const useEvents = () => {
  const { eventFilter } = useUIStore();
  return useQuery<Event[]>({
    queryKey: ['events', eventFilter.type, eventFilter.date, eventFilter.sortByPrice],
    queryFn: async () => {
      const params = {
        type: eventFilter.type === 'all' ? undefined : eventFilter.type,
        date: eventFilter.date,
      };
      const { data } = await axios.get('/api/events', { params });
      return data;
    },
    select: (data) => {
      let filtered = data;
      if (eventFilter.search) {
        filtered = filtered.filter((event) =>
          event.title.toLowerCase().includes(eventFilter.search.toLowerCase())
        );
      }
      if (eventFilter.sortByPrice) {
        filtered = filtered.sort((a, b) =>
          eventFilter.sortByPrice === 'asc' ? a.price - b.price : b.price - a.price
        );
      }
      return filtered;
    },
    enabled: !!useAuthStore.getState().token,
  });
};