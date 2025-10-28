import { DashboardLayout } from "./DashboardLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Users,
  DollarSign,
} from "lucide-react";

interface Event {
  _id: string;
  title: string;
  description?: string;
  price: number;
  seats: number;
  category: string;
  date: string;
  time: string;
  coverImage: string;
  location: string;
  eventType: "physical" | "online";
  createdAt: string;
}

export default function HostEvents() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Fetch host's events
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["host-events"],
    queryFn: async () => {
      const response = await axios.get("/events/host/me");
      return response.data?.data || response.data;
    },
  });

  // Filter events based on search and filters
  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || event.category === categoryFilter;
    const matchesType = typeFilter === "all" || event.eventType === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Check if event is upcoming or past
  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="clash-bold text-3xl md:text-4xl text-[var(--foreground)] mb-2">
            My Events
          </h1>
          <p className="satoshi-regular text-base text-[var(--muted-foreground)]">
            Manage your events, bookings, and coupons
          </p>
        </div>
        <Button
          onClick={() => navigate("/host/events/create")}
          className="satoshi-medium w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 satoshi-regular"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="satoshi-regular">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tech">Tech</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="arts">Arts</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {/* Events Table/List */}
      {!isLoading && filteredEvents && filteredEvents.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          {/* Desktop Table View */}
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
                {filteredEvents.map((event) => (
                  <TableRow
                    key={event._id}
                    className="hover:bg-[var(--muted)]/50 cursor-pointer border-[var(--border)]"
                    onClick={() => navigate(`/host/events/${event._id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={event.coverImage}
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="satoshi-medium text-sm text-[var(--foreground)]">
                            {event.title}
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
                          event.eventType === "online"
                            ? "default"
                            : "secondary"
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
                          onClick={() => navigate(`/host/events/${event._id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/host/events/${event._id}/edit`)
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-[var(--border)]">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                onClick={() => navigate(`/host/events/${event._id}`)}
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
                      onClick={() =>
                        navigate(`/host/events/${event._id}/edit`)
                      }
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!filteredEvents || filteredEvents.length === 0) && (
        <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h3 className="satoshi-medium text-lg text-[var(--foreground)] mb-2">
            {searchQuery || categoryFilter !== "all" || typeFilter !== "all"
              ? "No events found"
              : "No events yet"}
          </h3>
          <p className="satoshi-regular text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
            {searchQuery || categoryFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first event to start managing bookings"}
          </p>
          <Button
            onClick={() => navigate("/host/events/create")}
            className="satoshi-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}