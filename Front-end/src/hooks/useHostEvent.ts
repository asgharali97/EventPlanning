import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface OnlineDetails {
  link: string;
  password?: string;
  platfrom?: string;
}

interface Event {
  title: string;
  price: number;
  seats: number;
  category: string;
  date: Date;
  time: string;
  description?: string;
  coverImage: string;
  location: string;
  eventType: "physical" | "online";
  onlineDetails?: OnlineDetails;
  tags?: string[];
  rating?: number;
}

const useHostDeleteEvent = () => {
    const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await axios.delete(`/host/event/delete-event/${eventId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-events'] });
      queryClient.invalidateQueries({ queryKey: ['hostStats'] });
      queryClient.invalidateQueries({ queryKey: ['recentEvents'] });
    },
  })
};

 const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: any) => {
      
      const response = await axios.post('/host/create-event', eventData);
      
      console.log("Create event response:", response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log(" Event created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['host-events'] });
      queryClient.invalidateQueries({ queryKey: ['hostStats'] });
      queryClient.invalidateQueries({ queryKey: ['recentEvents'] });
    },
    onError: (error: any) => {
      console.error(" Create event error:", error);
      console.error(" Error response:", error.response?.data);
    },
  });
};

export { useHostDeleteEvent, useCreateEvent };
