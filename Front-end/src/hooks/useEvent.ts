import { useMutation, useQuery } from '@tanstack/react-query';
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
  rating?: number;
}

export const useEvents = () => {
  const { eventFilter, addToast } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const query = useQuery<Event[]>({
    queryKey: ['events'], 
    queryFn: async () => {
      try {
        const response = await axios.get('/events');
        
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

export const useEventById = (eventId: string | undefined) => {
  const { addToast } = useUIStore();

  const query = useQuery<Event>({
    queryKey: ['event', eventId],
    
    queryFn: async () => {
      try {
        const response = await axios.get(`/events/${eventId}`);
        
        const eventData = response.data?.data || response.data;
        
        if (!eventData || typeof eventData !== 'object') {
          console.error('Invalid event response format:', response.data);
          throw new Error('Invalid event data received');
        }
        
        return eventData as Event;
      } catch (error: any) {
        console.error('Fetch Event By ID Error:', error);
        if (error.response?.status === 404) {
          throw new Error('Event not found');
        } else if (error.response?.status === 403) {
          throw new Error('You do not have permission to view this event');
        }
        
        throw error;
      }
    },
    enabled: !!eventId,
    
    staleTime: 5 * 60 * 1000,
    
    gcTime: 10 * 60 * 1000,
    
    retry: 2,
    
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.error) {
      const errorMessage = query.error instanceof Error 
        ? query.error.message 
        : 'Failed to fetch event details';
      
      addToast(errorMessage, 'destructive');
    }
  }, [query.error, addToast]);

  return query;
};

export const useGetBookedEvent = (userId:string) => {
  const { addToast } = useUIStore();

  const query = useQuery<Event>({
    queryKey: ['event', userId],
    
    queryFn: async () => {
      try {
        const response = await axios.get(`/booking/get-booked-events`);
        
        const eventData = response.data?.data || response.data;
        if (!eventData || typeof eventData !== 'object') {
          console.error('Invalid event response format:', response.data);
          throw new Error('Invalid event data received');
        }
        
        return eventData as Event;
      } catch (error: any) {
        console.error('Fetch Event By ID Error:', error);
        if (error.response?.status === 404) {
          throw new Error('Event not found');
        } else if (error.response?.status === 403) {
          throw new Error('You do not have permission to view this event');
        }
        
        throw error;
      }
    },
    enabled: !!userId,
    
    staleTime: 5 * 60 * 1000,
    
    gcTime: 10 * 60 * 1000,
    
    retry: 2,
    
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.error) {
      const errorMessage = query.error instanceof Error 
        ? query.error.message 
        : 'Failed to fetch event details';
      
      addToast(errorMessage, 'destructive');
    }
  }, [query.error, addToast]);

  return query;
};
export type { Event };