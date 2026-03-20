import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@prisma/client";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  hotelId?: string | null;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "heo-auth",
    },
  ),
);
