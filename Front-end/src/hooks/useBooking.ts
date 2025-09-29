import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";

interface Booking {
  _id: string;
  userId: string;
  eventId: string;
  bookingDate: Date;
  status: "confirmed" | "cancelled";
  numberOfTickets: number;
  totalPrice: number;
  paymentStatus: "paid" | "pending" | "failed";
  stripePaymentId?: string;
  reviewStatus?: "pending" | "approved" | "disputed";
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  return useMutation({
    mutationFn: (data: { eventId: string; numberOfTickets: number }) =>
      axios.post("/event-booking/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      addToast("Booking successful!");
    },
    onError: (error: any) =>
      addToast(
        error.response?.data?.message || "Booking failed",
        "destructive"
      ),
  });
};

export const useBookings = () => {
  const { user } = useAuthStore();
  return useQuery<Booking[]>({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      const { data } = await axios.get("/events/");
      return data;
    },
    enabled: !!user?.id,
  });
};
