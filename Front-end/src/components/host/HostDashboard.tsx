import { DashboardLayout } from "./DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { useHostStats, useRecentEvents } from "@/hooks/useHostStats";
import { Plus } from "lucide-react";
import {
  IconCalendarWeek,
  IconUsers,
  IconCashBanknote,
  IconTagPlus,
  IconTrendingUp3,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentEventCard } from "./RecentEventsCards";
import axios from "@/lib/axios";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  isLoading?: boolean;
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  isLoading,
}: StatCardProps) {
 if (isLoading) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm satoshi-regular text-[var(--muted-foreground)] mb-1">
            {title}
          </p>
          <h3 className="text-3xl satoshi-bold text-[var(--foreground)] mb-2">
            {value}
          </h3>
          {trend && (
            <div className="flex items-center gap-1">
              <IconTrendingUp3
                className={`w-3 h-3 ${
                  trendUp ? "text-green-500" : "text-red-500 rotate-180"
                }`}
              />
              <span
                className={`text-xs satoshi-medium ${
                  trendUp ? "text-green-500" : "text-red-500"
                }`}
              >
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-[var(--background)] flex items-center justify-center text-[var(--secondary)] shadow-[inset_0_1px_1px_rgba(0,0,0,0.05),inset_0_4px_6px_rgba(34,42,53,0.04),inset_0_24px_68px_rgba(47,48,55,0.05),inset_0_2px_3px_rgba(0,0,0,0.04)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  icon,
  onClick,
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 
                 hover:border-[var(--foreground)] hover:shadow-md transition-all duration-200 
                 text-left group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-[var(--foreground)] flex items-center justify-center text-[var(--background)] shadow-[var(--shadow-l)]">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="satoshi-medium text-base text-[var(--foreground)] mb-1">
            {title}
          </h4>
          <p className="satoshi-regular text-sm text-[var(--muted-foreground)]">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function HostDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const { data: stats, isLoading: statsLoading, error: statsError } = useHostStats();
  const { data: recentEvents, isLoading: eventsLoading, error: eventsError } = useRecentEvents(5);
  

  const formattedRevenue = stats?.totalRevenue
    ? `$${stats.totalRevenue.toLocaleString()}`
    : "$0";

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="clash-bold text-3xl md:text-4xl text-[var(--foreground)] mb-2">
          Welcome back, {user?.name || "Host"}! 👋
        </h1>
        <p className="satoshi-regular text-base text-[var(--muted-foreground)]">
          Here's what's happening with your events today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Events"
          value={stats?.totalEvents ?? 0}
          icon={<IconCalendarWeek className="w-6 h-6" />}
          trend="+2 this month"
          trendUp={true}
          isLoading={statsLoading}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings ?? 0}
          icon={<IconUsers className="w-6 h-6" />}
          trend="+12% from last month"
          trendUp={true}
          isLoading={statsLoading}
        />
        <StatCard
          title="Total Revenue"
          value={formattedRevenue ?? 0}
          icon={<IconCashBanknote className="w-6 h-6" />}
          trend="+8% from last month"
          trendUp={true}
          isLoading={statsLoading}
        />
        <StatCard
          title="Active Coupons"
          value={stats?.activeCoupons ?? 0}
          isLoading={statsLoading}
          icon={<IconTagPlus className="w-6 h-6" />}
        />
      </div>
      <div className="mb-8">
        <h2 className="satoshi-bold text-xl text-[var(--foreground)] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionCard
            title="Create New Event"
            description="Set up a new event and start selling tickets"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => navigate("/host/events/create")}
          />
          <QuickActionCard
            title="Create Coupon"
            description="Add a discount code for your events"
            icon={<IconTagPlus className="w-5 h-5" />}
            onClick={() => navigate("/host/coupons")}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="satoshi-bold text-xl text-[var(--foreground)]">
            Recent Events
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/host/events")}
            className="satoshi-medium cursor-pointer"
          >
            View All
          </Button>
        </div>
        {eventsLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        )}
        {!eventsLoading && recentEvents && recentEvents.length > 0 && (
          <div className="space-y-4">
            {recentEvents.map((event) => (
              <RecentEventCard key={event._id} event={event} />
            ))}
          </div>
        )}
        {!eventsLoading && (!recentEvents || recentEvents.length === 0) && (
          <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
            <IconCalendarWeek className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
            <h3 className="satoshi-medium text-lg text-[var(--foreground)] mb-2">
              No events yet
            </h3>
            <p className="satoshi-regular text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
              Create your first event to start managing bookings and growing
              your audience.
            </p>
            <Button
              onClick={() => navigate("/host/events/create")}
              className="satoshi-medium cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Event
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
