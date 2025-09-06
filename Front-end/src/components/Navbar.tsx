import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { logout } from "../api/api";
import { useAuthContext } from "../context/AuthContext";
const Navbar = () => {
  const {user, setUser} = useAuthContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);


    useEffect(() => {
    const handleClickOutside = (event : MouseEvent) => {
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
    logout().then((res) => {
      console.log(res)
      setUser(null)
    }).catch((err) => {
      console.log(err)
    })
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
    return (
    <div className="py-4 px-6 w-full bg-[#3d4045] ">
      <div className="flex justify-between items-center">
        <div className="font-bold text-xl md:text-2xl cursor-pointer">
          <Link to="/" className="cursor-pointer">
            {" "}
            EventSphare{" "}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/events" className="text-white px-4 py-2">
            Events
          </Link>
          <Link to="/Allbooked-events" className="text-white px-4 py-2 rounded-md">
            Booked Events
          </Link>
          {
            user ? (
              (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center text-white px-4 py-2 rounded-md hover:bg-[#4a4f54] transition-colors duration-200"
              >
                <img
                  src={user.avatar}
                  alt="user profile"
                  className="w-8 h-8 rounded-full"
                />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-3 px-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt="user profile"
                        className="w-12 h-12 rounded-full cursor-pointer"
                      />
                      <div>
                        <p className="text-gray-900 font-medium text-sm">
                          {user.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-violet-600 hover:bg-violet-50 transition-colors duration-150 curosr-pointer"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
            ) : (
              <Link to="/signin" className="text-white px-4 py-2 rounded-md">
                Sign In
              </Link>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Navbar;
