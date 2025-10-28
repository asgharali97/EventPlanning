import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import axios from "../lib/axios";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

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
  hostId: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    isVerified: boolean;
  };
  eventType: "physical" | "online";
  onlineDetails?: OnlineDetails;
  tags?: string[];
  rating?: number;
}

interface FetchEventsParams {
  type?: "all" | "physical" | "online";
  search?: string;
  date?: string;
  sortByPrice?: "asc" | "desc" | null;
  category?: string
}

const fetchEvents = async (params: FetchEventsParams, url: string) => {
  const { type, search, date, sortByPrice, category } = params;
  const query = new URLSearchParams();

  if (search) query.append("q", search);
  if(category) query.append("category", category)
  if (type && type !== "all") query.append("eventType", type);
  if (date) query.append("date", date);
  if (sortByPrice)
    query.append("sortBy", "price") && query.append("sortDir", sortByPrice);

  const res = await axios.get<{ data: Event[] }>(`${url}?${query.toString()}`);
  if (!res.data.data.events) {
    throw new Error("Not found events");
  }
  return res.data.data?.events;
};

export const useEvents = () => {
  const { eventFilter, addToast } = useUIStore();

  const query = useQuery<Event[]>({
    queryKey: ["events", eventFilter],
    queryFn: () => fetchEvents(eventFilter,"events"),
    select: (data) => {
      let filtered = data;
      if (eventFilter.type !== "all") {
        filtered = filtered.filter(
          (event) => event.eventType === eventFilter.type
        );
      }

      if (eventFilter.search) {
        filtered = filtered.filter((event) =>
          event.title.toLowerCase().includes(eventFilter.search.toLowerCase())
        );
      }

      if (eventFilter.sortByPrice) {
        filtered = [...filtered].sort((a, b) =>
          eventFilter.sortByPrice === "asc"
            ? a.price - b.price
            : b.price - a.price
        );
      }
      return filtered;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (query.error) {
      const errorMessage =
        query.error instanceof Error
          ? query.error.message
          : "Failed to fetch events";

      addToast(errorMessage, "destructive");
    }
  }, [query.error, addToast]);

  return query;
};

export const useEventByHostId = () => {
  const { eventFilter, addToast } = useUIStore();
  const query = useQuery<Event[]>({
    queryKey: ["host-events", eventFilter],
    queryFn: () => fetchEvents(eventFilter,"events/host/me"),
    select: (data) => {
      let filtered = data;
      if (eventFilter.type !== "all") {
        filtered = filtered.filter(
          (event) => event.eventType === eventFilter.type
        );
      }

      if (eventFilter.search) {
        filtered = filtered.filter((event) =>
          event.title.toLowerCase().includes(eventFilter.search.toLowerCase())
        );
      }

      if (eventFilter.sortByPrice) {
        filtered = [...filtered].sort((a, b) =>
          eventFilter.sortByPrice === "asc"
            ? a.price - b.price
            : b.price - a.price
        );
      }
      return filtered;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (query.error) {
      const errorMessage =
        query.error instanceof Error
          ? query.error.message
          : "Failed to fetch events";

      addToast(errorMessage, "destructive");
    }
  }, [query.error, addToast]);

  return query;
};

export const useEventById = (eventId: string | undefined) => {
  const { addToast } = useUIStore();

  const query = useQuery<Event>({
    queryKey: ["event", eventId],

    queryFn: async () => {
      try {
        const response = await axios.get(`/events/${eventId}`);

        const eventData = response.data?.data || response.data;

        if (!eventData || typeof eventData !== "object") {
          console.error("Invalid event response format:", response.data);
          throw new Error("Invalid event data received");
        }

        return eventData as Event;
      } catch (error: any) {
        console.error("Fetch Event By ID Error:", error);
        if (error.response?.status === 404) {
          throw new Error("Event not found");
        } else if (error.response?.status === 403) {
          throw new Error("You do not have permission to view this event");
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
      const errorMessage =
        query.error instanceof Error
          ? query.error.message
          : "Failed to fetch event details";

      addToast(errorMessage, "destructive");
    }
  }, [query.error, addToast]);

  return query;
};

export const useGetBookedEvent = (userId: string) => {
  const { addToast } = useUIStore();

  const query = useQuery<Event>({
    queryKey: ["event", userId],

    queryFn: async () => {
      try {
        const response = await axios.get(`/booking/get-booked-events`);

        const eventData = response.data?.data || response.data;
        if (!eventData || typeof eventData !== "object") {
          console.error("Invalid event response format:", response.data);
          throw new Error("Invalid event data received");
        }

        return eventData as Event;
      } catch (error: any) {
        console.error("Fetch Event By ID Error:", error);
        if (error.response?.status === 404) {
          throw new Error("Event not found");
        } else if (error.response?.status === 403) {
          throw new Error("You do not have permission to view this event");
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
      const errorMessage =
        query.error instanceof Error
          ? query.error.message
          : "Failed to fetch event details";

      addToast(errorMessage, "destructive");
    }
  }, [query.error, addToast]);

  return query;
};
export type { Event };
