import React, { useState } from "react";
import { useEvents } from "../hooks/useEvent";
import { useUIStore } from "@/store/uiStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, MapPin, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, set } from "date-fns";
import { cn } from "../lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "./ui/badge";
import BookEvent from "./BookEvent";
import SignIn from "./SignIn";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "@/store/authStore";
const Event: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { isBookingDialogOpen, setBookingDialog } = useUIStore();
  const { eventFilter, setEventFilter } = useUIStore();
  const { data: events, isLoading, error } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (isLoading)
    return (
      <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-[var(--background)]">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
      </div>
    );

  if (error)
    return (
      <div className="py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load events"}
          </AlertDescription>
        </Alert>
      </div>
    );

  if (!events || events.length === 0)
    return (
      <div className="py-8">
        <Alert>
          <AlertDescription>
            No events found matching your criteria
          </AlertDescription>
        </Alert>
      </div>
    );

  const handleEventClick = async (eventId: string) => {
    if (!user) {
      setIsSignInOpen(true);
    }
    if(user){
      navigate(`/event/${eventId}`);
    }
  };

  const handleBookClick = (event) => {
    setSelectedEvent(event);
    setBookingDialog(true);
  };
  return (
    <>
      <div className="satoshi-medium">
        <div className="flex flex-col sm:flex-row gap-4 border-b border-[var(--border)] -mx-8 px-8 py-4">
          <Select>
            <SelectTrigger
              className="w-full sm:w-32 satoshi-regular"
              style={{ boxShadow: "var(--shadow-s)" }}
            >
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="px-1 satoshi-regular">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search events..."
            className="w-full sm:w-48 satoshi-regular"
            style={{ boxShadow: "var(--shadow-s)" }}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-48 justify-start text-left font-normal satoshi-regular hover:text-[var-(--secondary)]",
                  !eventFilter.date && "text-muted-foreground"
                )}
                style={{ boxShadow: "var(--shadow-s)" }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {eventFilter.date
                  ? format(new Date(eventFilter.date), "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-[var(--border)]">
              <Calendar
                mode="single"
                initialFocus
                className="satoshi-regular"
              />
            </PopoverContent>
          </Popover>

          <Select>
            <SelectTrigger
              className="w-full sm:w-32 satoshi-regular"
              style={{ boxShadow: "var(--shadow-s)" }}
            >
              <SelectValue placeholder="Sort Price" />
            </SelectTrigger>
            <SelectContent className="px-1 satoshi-regular">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="asc">Low to High</SelectItem>
              <SelectItem value="desc">High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 border-b  border-[var(--border)] py-4">
          {events?.map((event) => (
            <article
              key={event._id}
              className="group cursor-pointer transition-colors border border-[var(--border)] bg-[var(--card)] hover:shadow-[var(--shadow-m)] satoshi-regular  rounded-2xl"
            >
              <section onClick={() => handleEventClick(event._id)}>
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 rounded-t-2xl  group-hover:scale-105"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold satoshi-medium line-clamp-1 text-[var(--foreground)]">
                      {event.title}
                    </h3>
                    <div className="flex justify-between">
                      <p className="text-sm font-600 text-[var(--muted-foreground)] satoshi-regular">
                        {event.category || "General"}
                      </p>
                      <div>
                        <Badge
                          variant="outline"
                          className="px-2 py-1 rounded-md text-xs satoshi-medium  bg-[var(--foreground)] text-[var(--muted)]"
                          style={{ boxShadow: "var(--shadow-s)" }}
                        >
                          {event.eventType === "online" ? "Online" : "Physical"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-sm text-[var(--muted-foreground)] satoshi-regular line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-[var(--border)]">
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--muted-foreground)] satoshi-regular">
                          Date
                        </p>
                        <p className="text-sm satoshi-medium text-[var(--foreground)] truncate">
                          {format(new Date(event.date), "MMM dd, yyyy")}
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
                          {event.time || "6:00 PM"}
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
                          {event.location || "Online"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--muted-foreground)] satoshi-regular">
                          Seats
                        </p>
                        <p className="text-sm satoshi-medium text-[var(--foreground)]">
                          {event.seats} left
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <div className="p-4 space-y-3  flex items-center justify-between pt-1">
                <p className="text-2xl font-bold satoshi-bold text-[var(--foreground)]">
                  ${event.price}
                </p>
                <Button
                  size="sm"
                  className="satoshi-medium shadow-[var(--shadow-m)] transition-shadow cursor-pointer z-50"
                  onClick={() => {
                    handleBookClick(event);
                  }}
                >
                  Book Now
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <BookEvent
        isOpen={isBookingDialogOpen}
        onClose={() => setBookingDialog(false)}
        event={selectedEvent}
      />
      <GoogleOAuthProvider clientId={clientId}>
        <SignIn isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      </GoogleOAuthProvider>
    </>
  );
};

export default Event;
