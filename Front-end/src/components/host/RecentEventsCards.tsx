import { IconCalendarWeek } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

interface RecentEventCardProps {
  event: {
    _id: string;
    title: string;
    coverImage: string;
    date: string;
    time: string;
    price: number;
    category: string;
    eventType: "physical" | "online";
    location: string;
  };
}

export function RecentEventCard({ event }: RecentEventCardProps) {
  const navigate = useNavigate();
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={() => navigate(`/host/events/${event._id}`)}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden 
                 hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <div className="flex gap-4 p-4">
        <div className="w-42 h-28 rounded overflow-hidden flex-shrink-0 bg-[var(--muted)]">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="satoshi-medium text-base text-[var(--foreground)] line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
              {event.title}
            </h4>
            <span className="satoshi-bold text-sm text-[var(--foreground)] flex-shrink-0">
              ${event.price}
            </span>
          </div>

          <div className="space-y-1">
            <p className="satoshi-regular text-sm text-[var(--muted-foreground)] flex items-center gap-1">
              <IconCalendarWeek className="w-3 h-3" />
              {formattedDate} • {event.time}
            </p>
            <p className="satoshi-regular text-xs text-[var(--muted-foreground)] line-clamp-1">
              {event.eventType === "physical" ? event.location : "Online Event"}
            </p>
          </div>

          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-[var(--secondary)] text-[var(--secondary-foreground)] text-xs satoshi-medium">
              {event.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
