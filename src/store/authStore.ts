import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  isAuthenticated: boolean;

  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    roleName: string;
  }) => void;

  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,

      setAuth: (data) =>
        set({
          token: data.accessToken,
          refreshToken: data.refreshToken,
          role: data.roleName,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          token: null,
          refreshToken: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);