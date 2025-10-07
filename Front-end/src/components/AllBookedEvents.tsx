import React from "react";
import { useGetBookedEvent } from "@/hooks/useEvent";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface BookedEvent {
  _id: string;
  bookingDate: string;
  eventId: string;
  numberOfTickets: number;
  paymentStatus: string;
  status: string;
  totalPrice: number;
  userId: string;
  eventId: {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    coverImage: string;
    price: number;
    seats: number;
    eventType: string;
  };
}


const AllBookedEvents: React.FC = () => {
  const { user } = useAuthStore();
  const { data: bookedEvents, isLoading, error } = useGetBookedEvent(user.data?._id);
  const navigate = useNavigate();
  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen py-8 px-4 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[450px] w-full rounded-2xl" />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen py-8 px-4 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load booked events"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!bookedEvents || bookedEvents.length === 0) {
    return (
      <div className="w-full min-h-screen py-8 px-4 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold satoshi-bold text-[var(--foreground)] mb-8">
            My Bookings
          </h1>
          <Alert>
            <AlertDescription className="satoshi-regular">
              You haven't booked any events yet. Start exploring events to make
              your first booking!
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const events = bookedEvents.map((event) =>{
    const bookedEvent = event.eventId
    const bookedEventDetail = event
     return [bookedEvent,bookedEventDetail]
  })
  return (
    <div className="w-full min-h-screen py-8 px-4 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold satoshi-bold text-[var(--foreground)] mb-2">
            My Bookings
          </h1>
          <p className="text-[var(--muted-foreground)] satoshi-regular">
            {bookedEvents.length} {bookedEvents.length === 1 ? "booking" : "bookings"} found
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: BookedEvent) => {
            const bookedEvent = event[0]
            const booking = event[1]
            const isPaid = booking.paymentStatus === "paid";
            return (
              <article
                key={bookedEvent._id}
                className="group cursor-pointer transition-colors hover:bg-[var(--card)] border border-[var(--border)] bg-[var(--card)] hover:shadow-[0px_4px_6px_-2px_#5c5c5c] satoshi-regular rounded-2xl overflow-hidden"
                onClick={() => handleEventClick(bookedEvent._id)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={bookedEvent.coverImage}
                    alt={bookedEvent.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[var(--foreground)] text-[var(--background)] px-3 py-1 rounded-full text-xs font-medium satoshi-medium">
                      {bookedEvent.category || "General"}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {isPaid ? (
                      <span className="bg-green-600 text-[var(--popover)] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 satoshi-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Paid 
                      </span>
                    ) : (
                      <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 satoshi-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold satoshi-medium line-clamp-1 text-[var(--foreground)]">
                      {bookedEvent.title}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] satoshi-regular line-clamp-2">
                      {bookedEvent.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-[var(--border)]">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--muted-foreground)] satoshi-regular">
                          Date
                        </p>
                        <p className="text-sm satoshi-medium text-[var(--foreground)] truncate">
                          {format(new Date(bookedEvent.date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--muted-foreground)] satoshi-regular">
                          Time
                        </p>
                        <p className="text-sm satoshi-medium text-[var(--foreground)] truncate">
                          {bookedEvent.time || "6:00 PM"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--muted-foreground)] satoshi-regular">
                          Location
                        </p>
                        <p className="text-sm satoshi-medium text-[var(--foreground)] truncate">
                          {bookedEvent.location || "Online"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--muted-foreground)] satoshi-regular">
                          Tickets
                        </p>
                        <p className="text-sm satoshi-medium text-[var(--foreground)]">
                          {booking.numberOfTickets} {booking.numberOfTickets === 1 ? "ticket" : "tickets"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)] satoshi-regular">
                        Total Price
                      </p>
                      <p className="text-2xl font-bold satoshi-bold text-[var(--foreground)]">
                        ${booking.finalAmount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--muted-foreground)] satoshi-regular">
                        Booked on
                      </p>
                      <p className="text-xs satoshi-medium text-[var(--foreground)]">
                        {format(new Date(booking.bookingDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AllBookedEvents;