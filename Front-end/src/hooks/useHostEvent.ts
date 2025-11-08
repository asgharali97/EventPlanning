import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useEffect } from "react";

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
  status?: "active" | "past" | "canceled";
}

const useHostDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await axios.delete(
        `/host/event/delete-event/${eventId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["host-events"] });
      queryClient.invalidateQueries({ queryKey: ["hostStats"] });
      queryClient.invalidateQueries({ queryKey: ["recentEvents"] });
    },
  });
};

const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: any) => {
      const response = await axios.post("/host/event/create-event", eventData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["host-events"] });
      queryClient.invalidateQueries({ queryKey: ["hostStats"] });
      queryClient.invalidateQueries({ queryKey: ["recentEvents"] });
    },
    onError: (error: any) => {
      console.error(" Create event error:", error);
      console.error(" Error response:", error.response?.data);
    },
  });
};

const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      formData,
    }: {
      eventId: string;
      formData: FormData;
    }) => {
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}:`, value.name, `(${value.size} bytes)`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      const response = await axios.patch(
        `/host/event/update-event/${eventId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["host-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["hostStats"] });
    },
    onError: (error: any) => {
      console.error("Update event error:", error);
      console.error("Error response:", error.response?.data);
    },
  });
};

const useGetEeventByHostId = (eventId: string) => {
  const query = useQuery({
    queryKey: ["host-event", eventId],

    queryFn: async () => {
      try {
        const response = await axios.get(`/host/event/${eventId}`);
        const eventData = response.data?.data || response.data;
        if (!eventData || typeof eventData !== "object") {
          console.error("Invalid event response format:", response.data);
          throw new Error("Invalid event data received");
        }

        return eventData;
      } catch (error: any) {
        if (error.response?.status === 404) {
          throw new Error("Event not found");
        } else if (error.response?.status === 403) {
          throw new Error("You do not have permission to view this event");
        }

        throw error;
      }
    },
  });
  useEffect(() => {
    if (query.error) {
      const errorMessage =
        query.error instanceof Error
          ? query.error.message
          : "Failed to fetch event details";
    }
  }, [query.error]);

  return query;
};

export {
  useHostDeleteEvent,
  useCreateEvent,
  useUpdateEvent,
  useGetEeventByHostId,
};
