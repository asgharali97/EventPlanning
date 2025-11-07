import { Calendar, Home, Tag, LogOut, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  {
    title: "Dashboard",
    url: "/host/dashboard",
    icon: Home,
  },
  {
    title: "Events",
    url: "/host/events",
    icon: Calendar,
  },
  {
    title: "Coupons",
    url: "/host/coupons",
    icon: Tag,
  },
];

function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate("/events");
  };

  const isActive = (url: string) => {
    return location.pathname === url;
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 pt-2">
            <h1 className="clash-bold tracking-wide text-xl text-[var(--foreground)]">
              EventSphere
            </h1>
            <p className="satoshi-regular text-sm text-[var(--muted-foreground)]">
              Host Dashboard
            </p>
          </div>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="satoshi-mdedium text-sm text-[var(--muted-foreground)] px-4">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={isActive(item.url)}
                    className={`
                      satoshi-medium transition-all duration-200 cursor-pointer
                      ${
                        isActive(item.url)
                          ? "bg-[var(--secondary)] text-[var(--foreground)]"
                          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)]"
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 p-2 border-t border-[var(--border)]">
              <img src={user?.avatar} alt="host avatar" className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-[8px]" />
              <div className="flex-1 min-w-0">
                <p className="satoshi-medium text-sm text-[var(--foreground)] truncate">
                  {user?.name || "Host User"}
                </p>
                <p className="satoshi-regular text-xs text-[var(--muted-foreground)] truncate">
                  {user?.email || "host@eventsphere.com"}
                </p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="satoshi-medium text-[var(--muted-foreground)]  hover:bg-[var(--hover)] hover:text-[var(--foreground)] transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default DashboardSidebar;
