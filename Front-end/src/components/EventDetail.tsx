import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEventById } from "@/hooks/useEvent";
import { useUIStore } from "@/store/uiStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserById } from "@/hooks/useUser";
import BookEvent from "./BookEvent";
import {
  useReviews,
  useAddReview,
  useReviewEligibility,
} from "@/hooks/useReview";
import { useAuthStore } from "@/store/authStore";
import EventReviews from "./EventReviews";

const EventDetail = () => {;

  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: event, isLoading, error } = useEventById(eventId);
  const hostId = event?.hostId;
  const { isBookingDialogOpen, setBookingDialog } = useUIStore();
  const {
    data: host,
    isLoading: hostLoading,
    error: hostError,
  } = useUserById(hostId);
  const [selectedEvent, setSelectedEvent] = useState(null);

   const userId = user._id
  if (isLoading || hostLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="w-full aspect-video rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || hostError) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load event details"}
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => navigate("/events")}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <Alert>
          <AlertDescription>Event not found</AlertDescription>
        </Alert>
        <Button
          onClick={() => navigate("/events")}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  const handleBookClick = (event) => {
    setSelectedEvent(event);
    setBookingDialog(true);
  };

  return (
    <>
      <div className="container mx-auto max-w-4xl min-h-screen pb-4 border-r border-l border-[var(--border)] satoshi-medium text-[var(--foreground)]">
        <img
          src={event.coverImage}
          className="w-full h-48 sm:h-64 md:h-80 lg:h-[400px] object-cover"
          alt={event.title}
        />

        <div className="py-4 sm:py-6 md:py-8 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h1 className="satoshi-bold text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--foreground)] flex-1">
              {event.title}
            </h1>
            <Button
              className="cursor-pointer shadow-[var(--shadow-m)] w-full sm:w-auto satoshi-medium"
              onClick={() => handleBookClick(event)}
            >
              Book Now
            </Button>
          </div>

          <Badge
            variant={"secondary"}
            className="my-2 bg-[var(--foreground)] text-[var(--popover)] text-xs sm:text-sm py-1 px-2 sm:px-3 shadow-[var(--shadow-s)]"
          >
            {event.category || "General"}
          </Badge>
          <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4 items-center border-t border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 py-3 sm:py-4">
            <img
              src={host?.avatar}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
              alt="Host avatar"
            />
            <h3 className="text-sm sm:text-base satoshi-medium">
              By {host?.name}
            </h3>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="text-lg sm:text-xl font-bold satoshi-bold">
                Location
              </h4>
              <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
                {event.location}
              </p>
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold satoshi-bold">
                Available Seats
              </h4>
              <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
                {event.seats}
              </p>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 pb-4 sm:pb-6">
            <div>
              <h4 className="text-lg sm:text-xl font-bold satoshi-bold">
                Date
              </h4>
              <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
                {event.date.toString().split("T")[0]} at{" "}
                {event.date.toString().split("T")[1].split(".")[0]}
              </p>
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold satoshi-bold">
                Price
              </h4>
              <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
                ${event.price}
              </p>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 pb-6">
            <h4 className="text-xl sm:text-2xl font-bold satoshi-bold mb-3 sm:mb-4">
              About This Event
            </h4>
            <p className="text-sm sm:text-base lg:text-lg text-[var(--secondary)] leading-relaxed satoshi-regular">
              {event.description || "No description available."}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 py-4 sm:py-6">
            {event.tags &&
              event.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={"secondary"}
                  className="bg-[var(--foreground)] text-[var(--popover)] text-xs sm:text-sm"
                >
                  {tag}
                </Badge>
              ))}
          </div>
          <EventReviews eventId={eventId}/>
        </div>
      </div>
      <BookEvent
        isOpen={isBookingDialogOpen}
        onClose={() => setBookingDialog(false)}
        event={selectedEvent}
      />
    </>
  );
};

export default EventDetail;