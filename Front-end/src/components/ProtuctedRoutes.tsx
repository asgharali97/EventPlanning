import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import SignIn from "./SignIn";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
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
  if (user) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="w-full min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold satoshi-bold text-[var(--foreground)] mb-2">
            Authentication Required
          </h2>
          <p className="text-[var(--muted-foreground)] satoshi-regular">
            Please sign in to access this page
          </p>
        </div>
      </div>
      <GoogleOAuthProvider clientId={clientId}>
        <SignIn isOpen={isSignInOpen} onClose={handleClose} />
      </GoogleOAuthProvider>
    </>
  );
};

export default ProtectedRoute;
