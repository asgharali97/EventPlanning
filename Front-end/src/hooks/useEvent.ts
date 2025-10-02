import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import axios from '../lib/axios';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

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
  eventType: 'physical' | 'online';
  onlineDetails?: OnlineDetails;
  tags?: string[];
}

export const useEvents = () => {
  const { eventFilter, addToast } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const query = useQuery<Event[]>({
    queryKey: ['events'], 
    queryFn: async () => {
      try {
        const response = await axios.get('/events');
        console.log('API Response:', response);
        
        const eventsData = response.data?.data || response.data;
        
        if (!Array.isArray(eventsData)) {
          console.error('Invalid response format:', response.data);
          throw new Error('Expected an array of events');
        }
        
        return eventsData as Event[];
      } catch (error: any) {
        console.error('Fetch Events Error:', error);
        throw error;
      }
    },
    select: (data) => {
      let filtered = data;
      
      if (eventFilter.type !== 'all') {
        filtered = filtered.filter((event) => event.eventType === eventFilter.type);
      }
      
      if (eventFilter.date) {
        filtered = filtered.filter((event) => 
          new Date(event.date).toISOString().split('T')[0] === eventFilter.date
        );
      }
      
      if (eventFilter.search) {
        filtered = filtered.filter((event) =>
          event.title.toLowerCase().includes(eventFilter.search.toLowerCase())
        );
      }
      
      if (eventFilter.sortByPrice) {
        filtered = [...filtered].sort((a, b) =>
          eventFilter.sortByPrice === 'asc' ? a.price - b.price : b.price - a.price
        );
      }
      
      return filtered;
    },
    enabled: isAuthenticated, 
    staleTime: 5 * 60 * 1000, 
    retry: 2,
  });

  useEffect(() => {
    if (query.error) {
      const errorMessage = query.error instanceof Error 
        ? query.error.message 
        : 'Failed to fetch events';
      
      addToast(errorMessage, 'destructive');
    }
  }, [query.error, addToast]);

  return query;
};