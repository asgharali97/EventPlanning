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
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "./ui/button";
import { motion } from "motion/react";

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
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: bookedEvents, isLoading, error } = useGetBookedEvent(user._id);
  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen py-8 bg-[var(--background)]">
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
      <div className="py-8 flex flex-col items-center justify-center min-h-[40vh]">
        <Alert className="flex justify-center border-none bg-transparent satoshi-regular">
          <AlertDescription className="text-lg md:text-xl text-center">
            {error instanceof Error ? error.message : "Failed to load events"}
          </AlertDescription>
        </Alert>
        <Button
          className="mt-6 satoshi-medium shadow-sm hover:shadow-[var(--shadow-m)] cursor-pointer text-[var(--popover)] bg-[var(--foreground)] hover:bg-[var(--muted-foreground)] hover:text-[var(--primary-foreground)]"
          onClick={() => navigate("/events")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  if (!bookedEvents || bookedEvents.length === 0) {
    const parentVariant = {
      hover: {},
      defualt: {
        opacity: 0,
        filter: "blur(5px)",
        scale: 0.96,
      },
    };
    const childVariant = {
      default: {
        x: 0,
        opacity: 1,
      },
      hover: {
        x: -40,
        opacity:0,
      },
    };
    const MotionButton = motion(Button);
    const MotionArrowLeft = motion(ArrowLeft);
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[40vh]">
        <Alert className="flex justify-center border-none bg-transparent satoshi-regular">
          <AlertDescription className="text-lg md:text-xl text-center">
            You haven't booked any events yet. Start exploring events to make
            your first booking!
          </AlertDescription>
        </Alert>
        <MotionButton
          variants={parentVariant}
          initial="default"
          animate={{
            opacity: 1,
            filter: "blur(0px)",
          }}
          whileHover="hover"
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="mt-6 satoshi-medium shadow-sm cursor-pointer text-[var(--popover)] bg-[var(--foreground)] hover:bg-[var(--muted-foreground)] hover:text-[var(--primary-foreground)]"
          onClick={() => navigate("/events")}
        >
          <MotionArrowLeft className="w-4 h-4 mr-2" variants={childVariant} 
          />
          Book Events
        </MotionButton>
      </div>
    );
  }

  const events = bookedEvents.map((event) => {
    const bookedEvent = event.eventId;
    const bookedEventDetail = event;
    return [bookedEvent, bookedEventDetail];
  });
  return (
    <div className="w-full min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto">
        <div className="pt-2">
          <h1 className="text-2xl font-bold satoshi-bold text-[var(--foreground)]">
            My Bookings
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)] satoshi-regular">
            {bookedEvents.length}{" "}
            {bookedEvents.length === 1 ? "booking" : "bookings"} found
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
          {events.map((event: BookedEvent) => {
            const bookedEvent = event[0];
            const booking = event[1];
            const isPaid = booking.paymentStatus === "paid";
            return (
              <article
                key={bookedEvent._id}
                className="group cursor-pointer transitio border border-[var(--border)] bg-[var(--card)] hover:shadow-[var(--shadow-m)] satoshi-regular rounded-2xl overflow-hidden"
                onClick={() => handleEventClick(bookedEvent._id)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={bookedEvent.coverImage}
                    alt={bookedEvent.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    {isPaid ? (
                      <span className="bg-[var(--foreground)] text-[var(--popover)] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 satoshi-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Paid
                      </span>
                    ) : (
                      <span className="bg-[var(--primary)] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 satoshi-medium">
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
                          {booking.numberOfTickets}{" "}
                          {booking.numberOfTickets === 1 ? "ticket" : "tickets"}
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
