import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';
import { useUIStore } from '../store/uiStore';

interface Review {
  _id: string;
  review: string;
  rating: number;
  images: string;
  userId: string;
  eventId: string;
}

export const useReviews = (eventId: string) => {
  const { addToast } = useUIStore();
  return useQuery<Review[]>({
    queryKey: ['reviews', eventId],
    queryFn: async () => {
      const { data } = await axios.get(`/review/:eventId/${eventId}`);
      return data;
    },
    onError: () => addToast('Failed to fetch reviews', 'destructive'),
  });
};