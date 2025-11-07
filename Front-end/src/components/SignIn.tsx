import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface TokenResponse {
  authuser: string;
  code: string;
  prompt: string;
  scope: string;
}

interface SignInProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignIn: React.FC<SignInProps> = ({ isOpen, onClose }) => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (tokenResponse: TokenResponse) => {
    setIsLoading(true);
    
    try {
      const { data } = await googleAuth(tokenResponse.code);
      
      const user = data.data.user;
      
      if (user) {
        setAuth(user);
        
        queryClient.setQueryData(["user"], user);
        
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        
        
        onClose();
        setTimeout(() => {
          setIsLoading(false);
          navigate("/events", { replace: true });
        }, 200);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleError = (err: any) => {
    setIsLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleSuccess,
    onError: handleError,
    flow: "auth-code",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[var(--card)] border border-[var(--border)] satoshi-regular">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold satoshi-bold text-[var(--foreground)] text-center">
            Welcome to EventSphere
          </DialogTitle>
          <DialogDescription className="text-[var(--muted-foreground)] satoshi-regular text-center">
            Sign in to book your favorite events easily and safely
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-6">
          <Button
            onClick={() => googleLogin()}
            disabled={isLoading}
            className="w-full max-w-xs bg-[var(--foreground)] hover:bg-[var(--foreground)] text-[var(--background)] satoshi-medium shadow-[var(--shadow-l)] transition-all duration-200 py-6 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20"
                  viewBox="0 0 24 24"
                  width="20"
                  className="mr-3"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-xs text-[var(--muted-foreground)] satoshi-regular text-center max-w-xs">
            By continuing, you agree to EventSphere's Terms of Service and
            Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignIn;