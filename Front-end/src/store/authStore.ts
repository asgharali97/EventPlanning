import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: {
    id: string;
    role: "user" | "host";
    isVerified: boolean;
    depositHeld: boolean;
    stripePaymentId?: string;
    email: string;
    name: string;
    avatar: string;
  } | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthState["user"]) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<AuthState["user"]>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: "auth-storage" }
  )
);
