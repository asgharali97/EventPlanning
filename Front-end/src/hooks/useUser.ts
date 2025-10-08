import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import axios from "../lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "host";
  isVerified: boolean;
  depositHeld: boolean;
  stripePaymentId?: string;
}

export const useUser = () => {
  const { isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const { addToast, setAppLoading } = useUIStore();

  const query = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response= await axios.get("/auth/user");
        const data = response.data?.data || response.data;

        return data;
      } catch (error: any) {
        setAppLoading(false);
        addToast(
          error.response?.data?.message || "Failed to fetch user",
          "destructive"
        );
        if (error.response?.status === 401) {
          clearAuth();
          window.location.href = "/signin";
        }
        throw error;
      } finally {
        setAppLoading(false);
      }
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      setAuth(query.data);
    }
  }, [query.data, setAuth]);

  return query;
};

export const useUserById = (userId: string) => {
  const query = useQuery<User>({
    queryKey: ["user", userId],

    queryFn: async () => {
      try {
        const response = await axios.post(`/auth/get-userById`, { userId });

        const userData = response.data?.data || response.data;

        if (!userData || typeof userData !== "object") {
          console.error("Invalid user response format:", response.data);
          throw new Error("Invalid user data received");
        }

        return userData as User;
      } catch (error: any) {
        console.error("Fetch User By ID Error:", error);
        if (error.response?.status === 404) {
          throw new Error("User not found");
        } else if (error.response?.status === 403) {
          throw new Error("You do not have permission to view this user");
        }

        throw error;
      }
    },
    enabled: !!userId,
  });
  return query;
};
