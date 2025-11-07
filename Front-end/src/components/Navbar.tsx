import { NavLink,Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useUser } from "@/hooks/useUser";
import { Bell, Menu, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHomePage = location.pathname === "/";
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    if (isHomePage) {
      return "satoshi-mdedium text-[var(--primary-foreground)] text-lg font-medium";
    }

    if (isActive) {
      return "satoshi-mdedium text-[var(--foreground)] text-lg font-medium";
    }

    return "satoshi-regular text-[var(--secondary)] text-lg font-normal";
  };

  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    if (isActive) {
      return "text-[var(--foreground)] text-2xl font-semibold satoshi-medium";
    }
    return "text-[var(--muted-foreground)] text-2xl font-normal satoshi-regular";
  };

  return (
    <>
      <header
        className={`relative z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 satoshi-medium backdrop-blur-md border-b ${
          isHomePage
            ? "border-[var(--popover)]"
            : "bg-[var(--background)] border-[var(--border)]"
        }`}
      >
        <div className="hidden md:flex items-center">
          <h1
            className={`${
              isHomePage
                ? "text-[var(--primary-foreground)]"
                : "text-[var(--foreground)]"
            } text-2xl lg:text-3xl font-bold tracking-[var(--tracking-normal)] clash-bold`}
          >
            <Link to="/">EventSphere</Link>
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-6 lg:gap-12">
          <NavLink to="/events" className={getNavLinkClass}>
            Discover
          </NavLink>
          <NavLink to="/my-bookings" className={getNavLinkClass}>
            My bookings
          </NavLink>
          <NavLink to={
            user && user.role === "host" ? "/host/dashboard" : "/host/become"
          } className={getNavLinkClass}>
            Host Event
          </NavLink>
        </nav>

        <div className="absolute right-0 px-4 md:px-0 md:relative flex items-center md:flex items-center gap-6">
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
                    <span className="text-sm font-medium satoshi-medium">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground satoshi-regular">
                      {user.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Button
                  className="m-2 satoshi-medium text-sx px-4 py-2  cursor-pointer text-[var(--popover)] bg-[var(--foreground)] hover:bg-[var(--muted-foreground)] shadow-[var(--shadow-m)]"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => setIsSignInOpen(true)}
              className="satoshi-medium shadow-[var(--shadow-m)] cursor-pointer text-[var(--popover)] bg-[var(--foreground)] hover:bg-[var(--muted-foreground)] hover:text-[var(--primary-foreground)]"
            >
              Sign In
            </Button>
          )}
        </div>
        <div className="flex md:hidden items-center justify-between w-full">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`${
              isHomePage
                ? "text-[var(--primary-foreground)]"
                : "text-[var(--foreground)]"
            } hover:opacity-80 transition-opacity`}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-[var(--foreground)]" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={closeMobileMenu}>
          <div className="absolute inset-0 bg-[var(--background)]/95 backdrop-blur-lg" />
          <div className="relative h-full flex flex-col items-center justify-center">
            <nav className="flex flex-col items-center gap-8 mb-12">
              <NavLink
                to="/events"
                className={getMobileNavLinkClass}
                onClick={closeMobileMenu}
              >
                Discover
              </NavLink>
              <NavLink
                to="/my-bookings"
                className={getMobileNavLinkClass}
                onClick={closeMobileMenu}
              >
                My bookings
              </NavLink>
              <NavLink
                to="/host"
                className={getMobileNavLinkClass}
                onClick={closeMobileMenu}
              >
                Host Event
              </NavLink>
            </nav>
          </div>
        </div>
      )}

      <GoogleOAuthProvider clientId={clientId}>
        <SignIn isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      </GoogleOAuthProvider>
    </>
  );
};

export default Navbar;
