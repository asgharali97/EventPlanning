import React, { useEffect, useState } from "react";
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
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, set } from "date-fns";
import { cn } from "../lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "./ui/badge";
import BookEvent from "./BookEvent";
import SignIn from "./SignIn";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useDebounce } from "@/hooks/useDebounce";

const Event: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { isBookingDialogOpen, setBookingDialog, eventFilter, setEventFilter } =
    useUIStore();
  const { data: events, isLoading, error } = useEvents();
  const navigate = useNavigate();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(eventFilter.search || "");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const debounceSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    setEventFilter({ search: debounceSearch });
  }, [debounceSearch, setEventFilter]);

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

    const formatedTime = (time: string) => {
      const [hours, minutes] = time?.split(':').map(Number);
      const hour12 = hours % 12;
      const amPm = hours < 12 ? 'am' : 'pm';
      return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${amPm}`;
    }

  if (error)
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[40vh]">
        <Alert className="flex justify-center border-none bg-transparent satoshi-regular">
          <AlertDescription className="text-lg md:text-xl text-center">
            {error instanceof Error ? error.message : "Failed to load events"}
          </AlertDescription>
        </Alert>
      </div>
    );

  if (!events || events.length === 0)
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[40vh]">
        <Alert className="flex justify-center border-none bg-transparent satoshi-regular">
          <AlertDescription className="text-lg md:text-xl text-center">
            No events found matching your criteria
          </AlertDescription>
        </Alert>
        <Button
          className="mt-6 satoshi-medium shadow-sm hover:shadow-[var(--shadow-m)] cursor-pointer text-[var(--popover)] bg-[var(--foreground)] hover:bg-[var(--muted-foreground)] hover:text-[var(--primary-foreground)]"
          onClick={() =>
            setEventFilter({
              type: "all",
              search: "",
              date: "",
              sortByPrice: null,
              category: "",
            })
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );

  const handleEventClick = async (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const handleBookClick = (event) => {
    setSelectedEvent(event);
    setBookingDialog(true);
  };
  return (
    <>
      <div className="satoshi-medium">
        <div className="flex flex-col sm:flex-row gap-4 border-b border-[var(--border)] -mx-8 px-8 py-4">
          <Select
            value={eventFilter.type}
            onValueChange={(value: "all" | "physical" | "online") =>
              setEventFilter({ type: value })
            }
          >
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
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
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
                selected={
                  eventFilter.date ? new Date(eventFilter.date) : undefined
                }
                onSelect={(date) => {
                  if (date) {
                    const isoDate = date.toISOString();
                    setEventFilter({
                      date: isoDate,
                    });
                  } else {
                    setEventFilter({
                      date: undefined,
                    });
                  }
                }}
                initialFocus
                className="satoshi-regular"
              />
            </PopoverContent>
          </Popover>

          <Select
            value={eventFilter.sortByPrice || "none"}
            onValueChange={(value: "asc" | "desc") =>
              setEventFilter({ sortByPrice: value })
            }
          >
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

          <Select
            value={eventFilter.category}
            onValueChange={(value: string) =>
              setEventFilter({ category: value })
            }
          >
            <SelectTrigger
              className="w-full sm:w-32 satoshi-regular"
              style={{ boxShadow: "var(--shadow-s)" }}
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="px-1 satoshi-regular">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="tech">tech</SelectItem>
              <SelectItem value="sports">sports</SelectItem>
              <SelectItem value="arts">arts</SelectItem>
              <SelectItem value="music">music</SelectItem>
              <SelectItem value="health">health</SelectItem>
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
                        <div dangerouslySetInnerHTML={{__html: event.description || "No description available"}} />
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
                          {formatedTime(event.time) || "00"}
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
