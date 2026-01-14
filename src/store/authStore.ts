import { create } from "zustand";
import { queryClient } from "../lib/queryClient";

export type UserRole = 'user' | 'admin';

interface AuthState {
  token: string | null;
  role: UserRole | null;
  setToken: (token: string | null, role?: UserRole | null) => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  role: null,
  setToken: (token, role = 'user') => set({ token, role }),
  clearToken: () => set({ token: null, role: null }),
  isAuthenticated: () => Boolean(get().token),
  isAdmin: () => get().role === 'admin',
  logout: () => {
    set({ token: null, role: null });
    queryClient.clear();
    window.location.href = "/login";
  },
}));
