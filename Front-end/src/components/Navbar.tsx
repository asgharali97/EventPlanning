import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuthStore } from '@/store/authStore';
import { useUser } from '@/hooks/useUser';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';

const Navbar = () => {
  const { user, clearAuth } = useAuthStore();
  const { isLoading } = useUser();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/';
  };

  return (
    <>
      <header
        className={`relative z-10 flex items-center justify-between px-8 py-4 satoshi-mdedium back-drop-blur-md border-b ${isHomePage ? "border-[var(--popover)]" : "bg-[var(--background)]  border-[var(--border)]" }`}
      >
        <div className="flex items-center">
          <h1 className={`${isHomePage ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]" } text-3xl font-bold tracking-[var(--tracking-normal)] clash-bold`}>
            EventSphere
          </h1>
        </div>

        <nav className="flex items-center gap-12">
          <Link to="/events"
            className={`${isHomePage ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]" } text-lg font-medium`}
          >
            Discover
          </Link>
          <Link to="/my-bookings"
            className={`${isHomePage ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]" } text-lg font-medium`}
          >
            My bookings
          </Link>
          <Link to="/"
            className={`${isHomePage ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]" } text-lg font-medium`}
          >
            Host Event
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className={`${isHomePage ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]" }`}>
            {/* notifaction icon */}
          </button>
          {isLoading && <Skeleton className="h-10 w-10 rounded-full" />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-[(var(--background)] overflow-hidden hover:opacity-80 transition-opacity">
                  <img
                    src={user.avatar}
                    alt="user profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-74">
                <div className="flex items-center gap-3 px-2 py-3">
                  <img
                    src={user.avatar}
                    alt="user profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                >
                  <Button
                  className="text-[var(--foreground)] cursor-pointer hover:text-[var(--card-foreground)]"
                  onClick={handleLogout}
                  >Logout</Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/signin"
              className={`${isHomePage ? 'text-[var(--primary-foreground)]' : "text-[var(--foreground)]"} px-4 py-2 rounded-md`}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;