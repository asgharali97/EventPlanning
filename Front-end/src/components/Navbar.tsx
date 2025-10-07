import { NavLink, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUser } from "@/hooks/useUser";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { useState } from "react";
import SignIn from "./SignIn";
import { GoogleOAuthProvider } from "@react-oauth/google";

const Navbar = () => {
  const { user, clearAuth } = useAuthStore();
  const { isLoading } = useUser();
  const location = useLocation();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const isHomePage = location.pathname === "/";
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    if (isHomePage) {
      return "text-[var(--primary-foreground)] text-lg font-medium";
    }

    if (isActive) {
      return "text-[var(--foreground)] text-lg font-medium";
    }

    return "text-[var(--secondary)] text-lg font-normal";
  };

  return (
    <>
      <header
        className={`relative z-10 flex items-center justify-between px-8 py-4 satoshi-mdedium back-drop-blur-md border-b ${
          isHomePage
            ? "border-[var(--popover)]"
            : "bg-[var(--background)]  border-[var(--border)]"
        }`}
      >
        <div className="flex items-center">
          <h1
            className={`${
              isHomePage
                ? "text-[var(--primary-foreground)]"
                : "text-[var(--foreground)]"
            } text-3xl font-bold tracking-[var(--tracking-normal)] clash-bold`}
          >
            EventSphere
          </h1>
        </div>

        <nav className="flex items-center gap-12">
          <NavLink to="/events" className={getNavLinkClass}>
            Discover
          </NavLink>
          <NavLink to="/my-bookings" className={getNavLinkClass}>
            My bookings
          </NavLink>
          <NavLink to="/host" className={getNavLinkClass}>
            Host Event
          </NavLink>
        </nav>

        <div className="flex items-center gap-6">
          <button
            className={`${
              isHomePage
                ? "text-[var(--primary-foreground)]"
                : "text-[var(--foreground)]"
            } hover:opacity-80 transition-opacity`}
          >
            <Bell className="w-5 h-5" />
          </button>
          {isLoading && <Skeleton className="h-10 w-10 rounded-full" />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-[(var(--background)] overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                  <img
                    src={user.avatar}
                    alt="user profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-74 border border-[var(--border)]"
                style={{ boxShadow: "var(--shadow-m)" }}
              >
                <div className="flex items-center gap-3 px-2 py-3">
                  <img
                    src={user.avatar}
                    alt="user profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Button
                  className="m-2 text-[var(--popover)] cursor-pointer hover:text-[var(--card)]"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => setIsSignInOpen(true)}
              className="satoshi-medium shadow-sm hover:shadow-[var-[--shadow-m] satoshi-medium cursor-pointer text-[var(--popover)] bg-[var(--foreground)] hover:bg-[var(--muted-foreground)] hover:text-[var(--primary-foreground)]"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>
      <GoogleOAuthProvider clientId={clientId}>
        <SignIn isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      </GoogleOAuthProvider>
    </>
  );
};

export default Navbar;
