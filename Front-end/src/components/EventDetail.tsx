import { useState } from "react";
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
  Tooltip, 
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/authStore";
import EventReviews from "./EventReviews";

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEventById(eventId);
  const { isBookingDialogOpen, setBookingDialog } = useUIStore();
  const [selectedEvent, setSelectedEvent] = useState(null);
  console.log(event)
  if (isLoading) {
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

  if (!event) {
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[40vh]">
        <Alert className="flex justify-center border-none bg-transparent satoshi-regular">
          <AlertDescription className="text-lg md:text-xl text-center">
            Event not Found
          </AlertDescription>
        </Alert>
        <Button
          className="mt-6 satoshi-medium shadow-sm hover:shadow-[var(--shadow-m)] cursor-pointer text-[var(--popover)] bg-[var(--foreground)] hover:bg-[var(--muted-foreground)] hover:text-[var(--primary-foreground)]"
          onClick={ () => navigate("/events")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }
  const formatedTime = (time: string) => {
      const [hours, minutes, seconds] = time?.split(':').map(Number);
      const hour12 = hours % 12;
      const amPm = hours < 12 ? 'am' : 'pm';
      return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${amPm}`;
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
              src={event.hostId.avatar}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
              alt="Host avatar"
            />
            <h3 className="text-sm sm:text-base satoshi-medium">
              By {event.hostId.name}
            </h3>
            {event.hostId.isVerified && (
              <Tooltip>
                <TooltipTrigger>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="fill-[var(--primary)] stroke-[var(--popover)] cursor-pointer"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1" />
                    <path d="M9 12l2 2l4 -4" />
                  </svg>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verified Host</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="mt-6 sm:mt-8 border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h4 className="text-lg sm:text-xl font-bold satoshi-bold">
                  Location
                </h4>
                <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
                  {event.location}
                </p>
              </div>
              <div className="sm:text-right">
                <h4 className="text-lg sm:text-xl font-bold satoshi-bold">
                  Available Seats
                </h4>
                <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
                  {event.seats}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8 pt-6 sm:pt-8">
              <div>
                <h4 className="text-lg sm:text-xl font-bold satoshi-bold">
                  Date
                </h4>
                <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
                  {event.date.toString().split("T")[0]} at{" "}
                  {formatedTime(event.time)}
                </p>
              </div>
              <div className="sm:text-right">
                <h4 className="text-lg sm:text-xl font-bold satoshi-bold">
                  Price
                </h4>
                <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
                  ${event.price}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 pb-6">
            <h4 className="text-xl sm:text-2xl font-bold satoshi-bold mb-3 sm:mb-4">
              About This Event
            </h4>
            <p className="text-sm sm:text-base lg:text-lg text-[var(--secondary)] leading-relaxed satoshi-regular">
              <div dangerouslySetInnerHTML={{__html: event.description || "<p>No description available.</p>"}} />
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
          <EventReviews eventId={eventId} />
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
