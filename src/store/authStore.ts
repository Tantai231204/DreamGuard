import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  role: string | null;
  isAuthenticated: boolean;

  setAuth: (data: {
    roleName?: string;
    role?: string;
    [key: string]: any;
  }) => void;

  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      isAuthenticated: false,

      setAuth: (data: any) => {
        const roleName = data.roleName || data.role || data.RoleName || data.Role || "";
        set({
          role: roleName,
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
