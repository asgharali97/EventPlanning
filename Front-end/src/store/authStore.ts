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
  token: string | null;
  setAuth: (user: AuthState["user"], token: string) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<AuthState["user"]>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: "auth-storage" }
  )
);
