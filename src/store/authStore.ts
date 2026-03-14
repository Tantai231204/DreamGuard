import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  role: string | null;
  isAuthenticated: boolean;

  setAuth: (data: {
    roleName?: string;
    role?: string;
  }) => void;

  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      isAuthenticated: false,

      setAuth: (data) => {
        const role = data.roleName || data.role || "";
        set({
          role,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          role: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "dreamguard-auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Security: ONLY persist UI-related state. 
      partialize: (state) => ({
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
