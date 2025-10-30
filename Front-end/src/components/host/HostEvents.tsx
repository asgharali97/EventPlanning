import { DashboardLayout } from "./DashboardLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventByHostId } from "@/hooks/useEvent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useHostDeleteEvent } from "@/hooks/useHostEvent";
import { toast } from "sonner";
import { Toaster } from "sonner";

export default function HostEvents() {
  const navigate = useNavigate();
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const { eventFilter, setEventFilter } = useUIStore();
  const [searchTerm, setSearchTerm] = useState(eventFilter.search || "");

  const { data: events, isLoading } = useEventByHostId();
  const { mutate: deleteEvent, isPending: isDeleting } = useHostDeleteEvent();
  const debounceSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setEventFilter({ search: debounceSearch });
  }, [debounceSearch, setEventFilter]);

  const handleDeleteConfirm = () => {
    if (!deleteEventId) return;
    setDeleteEventId(null);

    setTimeout(() => {
      deleteEvent(deleteEventId, {
        onSuccess: () => {
          toast.success("Event deleted successfully", {
            description: "The event has been permanently removed.",
          });
        },
        onError: (error: any) => {
          const errorData = error.response?.data;
          const statusCode = error.response?.status;
          const errorMessage = errorData?.message || error.message;

          console.log("Error data:", errorData);
          console.log("Status code:", statusCode);
          console.log("Error message:", errorMessage);

          if (statusCode === 400 && errorMessage?.startsWith("Cannot")) {
            toast.error("Cannot delete event", {
              description: errorMessage,
            });
          } else if (statusCode === 404) {
            toast.error("Event not found", {
              description: "This event may have already been deleted.",
            });
          } else if (statusCode === 403) {
            toast.error("Permission denied", {
              description: "You don't have permission to delete this event.",
            });
          } else {
            toast.error("Failed to delete event", {
              description:
                errorMessage || "Something went wrong. Please try again.",
            });
          }
        },
      });
    }, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  return (
    <DashboardLayout>
      <Toaster />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="clash-bold text-3xl md:text-4xl text-[var(--foreground)] mb-2">
            My Events
          </h1>
          <p className="satoshi-regular text-base text-[var(--muted-foreground)]">
            Manage your events, bookings, and coupons
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/host/events/create")}
            className="satoshi-medium w-full sm:w-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 satoshi-regular"
            />
          </div>

          <Select
            value={eventFilter.category}
            onValueChange={(value: string) =>
              setEventFilter({ category: value })
            }
          >
            <SelectTrigger
              className="w-full satoshi-regular"
              style={{ boxShadow: "var(--shadow-s)" }}
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="px-1 satoshi-regular">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="tech">Tech</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="arts">Arts</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="health">Health</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={eventFilter.type}
            onValueChange={(value: "all" | "physical" | "online") =>
              setEventFilter({ type: value })
            }
          >
            <SelectTrigger className="satoshi-regular">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && events && events.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[var(--border)]">
                  <TableHead className="satoshi-medium">Event</TableHead>
                  <TableHead className="satoshi-medium">Date</TableHead>
                  <TableHead className="satoshi-medium">Category</TableHead>
                  <TableHead className="satoshi-medium">Type</TableHead>
                  <TableHead className="satoshi-medium">Price</TableHead>
                  <TableHead className="satoshi-medium">Seats</TableHead>
                  <TableHead className="satoshi-medium">Status</TableHead>
                  <TableHead className="satoshi-medium text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow
                    key={event._id}
                    className="hover:bg-[var(--muted)]/50 cursor-pointer border-[var(--border)]"
                    onClick={() => navigate(`/host/events/${event._id}/edit`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="gap-3 h-14 w-20 shrink-0 overflow-hidden rounded border border-border bg-muted sm:h-16 sm:w-28">
                          <img
                            src={event.coverImage}
                            alt={event.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="satoshi-medium text-sm text-[var(--foreground)]">
                            {event.title.slice(0, 30) +
                              (event.title.length > 30 ? "..." : "")}
                          </p>
                          <p className="satoshi-regular text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {event.eventType === "physical"
                              ? event.location
                              : "Online"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="satoshi-regular text-sm">
                      {formatDate(event.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="satoshi-medium">
                        {event.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.eventType === "online" ? "default" : "secondary"
                        }
                        className="satoshi-medium"
                      >
                        {event.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell className="satoshi-medium text-sm">
                      ${event.price}
                    </TableCell>
                    <TableCell className="satoshi-regular text-sm">
                      {event.seats}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isUpcoming(event.date) ? "default" : "secondary"
                        }
                        className="satoshi-medium"
                      >
                        {isUpcoming(event.date) ? "Upcoming" : "Past"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/host/events/${event._id}/edit`)
                          }
                          className="cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteEventId(event._id)}
                          className="cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="lg:hidden divide-y divide-[var(--border)]">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => navigate(`/host/events/${event._id}/edit`)}
                className="p-4 hover:bg-[var(--muted)]/50 cursor-pointer"
              >
                <div className="flex gap-4">
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="satoshi-medium text-base text-[var(--foreground)] mb-1 truncate">
                      {event.title}
                    </h3>
                    <div className="space-y-1">
                      <p className="satoshi-regular text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.date)} • {event.time}
                      </p>
                      <p className="satoshi-regular text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.eventType === "physical"
                          ? event.location
                          : "Online Event"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className="satoshi-medium text-xs"
                      >
                        {event.category}
                      </Badge>
                      <Badge
                        variant={
                          isUpcoming(event.date) ? "default" : "secondary"
                        }
                        className="satoshi-medium text-xs"
                      >
                        {isUpcoming(event.date) ? "Upcoming" : "Past"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center gap-4 text-xs satoshi-regular text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {event.price}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.seats}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/host/events/${event._id}/edit`)}
                      className="cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteEventId(event._id)}
                      className="cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!isLoading && (!events || events.length === 0) && (
        <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h3 className="satoshi-medium text-lg text-[var(--foreground)] mb-2">
            {searchTerm ||
            eventFilter.category !== "all" ||
            eventFilter.type !== "all"
              ? "No events found"
              : "No events yet"}
          </h3>
          <p className="satoshi-regular text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
            {searchTerm ||
            eventFilter.category !== "all" ||
            eventFilter.type !== "all"
              ? "Try adjusting your filters"
              : "Create your first event to start managing bookings"}
          </p>
          <Button
            onClick={() => navigate("/host/events")}
            className="satoshi-medium cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      )}
      <AlertDialog
        open={!!deleteEventId}
        onOpenChange={(open) => !open && setDeleteEventId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="satoshi-bold">
              Delete Event?
            </AlertDialogTitle>
            <AlertDialogDescription className="satoshi-regular">
              This action cannot be undone. This will permanently delete the
              event and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="satoshi-medium cursor-pointer" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="satoshi-medium bg-red-500 hover:bg-red-600 cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}