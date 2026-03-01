import api from "../lib/axios";
import type { LoginRequest, AuthResponse } from "../types/auth";

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post("/auths/login", data);
    return res.data;
  },

  logout: async () => {
    await api.post("/auths/logout");
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const res = await api.post("/auths/refresh-token", {
      refreshToken,
    });
    return res.data;
  },
};