import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  role: string | null;
  isAuthenticated: boolean;
  logoutReason: string | null;
  isLoggingOut: boolean;

  setAuth: (data: {
    roleName?: string;
    role?: string;
  }) => void;

  clearAuth: (reason?: string) => void;
  setLoggingOut: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      isAuthenticated: false,
      logoutReason: null,
      isLoggingOut: false,

      setAuth: (data) => {
        const role = data.roleName || data.role || "";
        set({
          role,
          isAuthenticated: true,
          logoutReason: null,
        });
      },

      clearAuth: (reason) => {
        set({
          role: null,
          isAuthenticated: false,
          logoutReason: reason || null,
        });
        // Side effect: clean up tokens
        sessionStorage.removeItem('signalr_token');
      },

      setLoggingOut: (value) => {
        set({ isLoggingOut: value });
      },
    }),
    {
      name: "dreamguard-auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Security: ONLY persist UI-related state. 
      partialize: (state) => ({
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        // logoutReason intentionally NOT persisted
      }),
    }
  )
);
