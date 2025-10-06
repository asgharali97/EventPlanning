import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from "@/lib/axios";
import { useUIStore } from "@/store/uiStore";

interface Review {
  _id: string;
  review: string;
  rating: number;
  images: string;
  userId: string;
  eventId: string;
}

interface ReviewEligibility {
  canReview: boolean;
  reason: string;
  eventDate?: string;
  existingReview?: any;
}

export const useReviews = (eventId: string) => {
  const { addToast } = useUIStore();
  return useQuery<Review[]>({
    queryKey: ["reviews", eventId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/review/${eventId}`);
        const reveiwData = response.data?.data || response.data;

        if (!reveiwData || typeof reveiwData !== "object") {
          console.error("Invalid event response format:", response.data);
          throw new Error("Invalid event data received");
        }

        return reveiwData as Review;
      } catch (error: any) {
        console.error("Fetch review Error:", error);
        if (error.response?.status === 404) {
          throw new Error("reveiw not found");
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
};


interface AddReviewPayload {
  eventId: string;
  review: string;
  rating: number;
  images?: File[];
}

export const useAddReview = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (payload: AddReviewPayload) => {
      const formData = new FormData();
      formData.append('eventId', payload.eventId);
      formData.append('review', payload.review);
      formData.append('rating', Number(Math.floor(payload.rating)));

      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const { data } = await axios.post('/review', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.eventId] });
      addToast('Review submitted successfully!', 'default');
    },
    onError: (error: any) => {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Failed to submit review. Please try again.';
      addToast(errorMessage, 'destructive');
    },
  });
};


export const useReviewEligibility = (eventId: string | undefined, userId: string | undefined) => {
  return useQuery<ReviewEligibility>({
    queryKey: ['reviewEligibility', eventId, userId],
    queryFn: async () => {

      try {
        const response = await axios.get(`/review/eligibility/${eventId}`);
        const eligibleData = response.data?.data || response.data;

        if (!eligibleData || typeof eligibleData !== "object") {
          throw new Error("Invalid eligibility data received");
        }
        return eligibleData;
      } catch (error: any) {
        
        if (error.response?.status === 404) {
          throw new Error("Event not found");
        }
        throw error;
      }
    },
    enabled: !!eventId && !!userId,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};