import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import SignIn from "./SignIn";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Button } from "./ui/button";

interface HostProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const HostProtectedRoute: React.FC<HostProtectedRouteProps> = ({
  children,
  redirectTo = "/events",
}) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { user } = useAuthStore();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      setIsSignInOpen(true);
    } else {
      setIsSignInOpen(false);
    }
  }, [user, location.pathname]);

  const handleClose = () => {
    setIsSignInOpen(false);
    if (!user) {
      navigate(redirectTo, { replace: true });
    }
  };

  const handleBecomeHost = () => {
    navigate("/host/become");
  };

  const handleGoBack = () => {
    navigate("/events");
  };

  if (!user) {
    return (
      <>
        <div className="w-full min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl md:text-3xl satoshi-bold text-[var(--foreground)] mb-3">
              Authentication Required
            </h2>
            <p className="text-[var(--muted-foreground)] satoshi-regular text-sm md:text-base">
              Please sign in to access the host dashboard
            </p>
          </div>
        </div>
        <GoogleOAuthProvider clientId={clientId}>
          <SignIn isOpen={isSignInOpen} onClose={handleClose} />
        </GoogleOAuthProvider>
      </>
    );
  }

  if (user.role !== "host") {
    return (
      <div className="w-full min-h-screen bg-[var(--background)] my-12 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl md:text-4xl clash-bold font-bold text-[var(--foreground)]">
            You are not Host yet 
          </h2>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-6">
            <Button
              onClick={handleBecomeHost}
              className="group w-full sm:w-auto px-4 py-2 bg-[var(--foreground)] text-[var(--background)] 
              rounded-md hover:bg-[var(--foreground)]/90 
              transition-all duration-200 shadow-sm hover:shadow-md
              flex items-center justify-center gap-2"
            >
              Become a Host
            </Button>
            <Button
              onClick={handleGoBack}
              className="w-full sm:w-auto px-4 py-2 bg-[var(--secondary)] text-[var(--secondary-foreground)]
              rounded-md hover:bg-[var(--secondary)]/80
              transition-all duration-200 border border-[var(--border)]"
            >
              Browse Events
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default HostProtectedRoute;
