import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { logout } from "../api/api";
import { useLocation } from "react-router-dom";
const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout()
      .then((res) => {
        console.log(res);
        setUser(null);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  return (
    <>
    <header className="relative z-10 flex items-center justify-between px-8 py-4 satoshi-mdedium back-drop-blur-md"
    style={{
          backgroundColor: isHomePage ? "transparent" : "var(--background)",
          color: isHomePage ? "var(--foreground)" : "var(--foreground)",
        }}
    >
        <div className="flex items-center">
          <h1 className="text-[var(--primary-foreground)] text-3xl font-bold tracking-[var(--tracking-normal)] clash-bold">
            EventSphere
          </h1>
        </div>
        
        <nav className="flex items-center gap-12">
          <a 
            href="#discover" 
            className="text-[var(--primary-foreground)] text-lg font-medium"
          >
            Discover
          </a>
          <a 
            href="#bookings" 
            className="text-[var(--primary-foreground)] text-lg font-medium"
          >
            My bookings
          </a>
          <a 
            href="#host" 
            className="text-[var(--primary-foreground))] text-lg font-medium"
          >
            Host Event
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-[var(--primary-foreground)] ">
            {/* notifaction icon */}
          </button>
          {user ? (
              <div className="relative" ref={dropdownRef}>
               <button className="w-12 h-12 rounded-full bg-[(var(--background)] overflow-hidden border-2 border-[var(--border)]">
                  <img
                    src={user.avatar}
                    alt="user profile"
                    className="w-8 h-8 rounded-full"
                  />
                </button>
                </div>
            ) : (
              <Link to="/signin" className="text-[var(--primary-foreground)] px-4 py-2 rounded-md">
                Sign In
              </Link>
            )}
        </div>
      </header>
        {isHomePage && (
          <div className="w-full border-b border-[var(--popover)]"></div>
        )}
    </>
  );
};

export default Navbar;
