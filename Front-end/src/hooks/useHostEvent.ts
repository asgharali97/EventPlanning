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

export { useHostDeleteEvent };
