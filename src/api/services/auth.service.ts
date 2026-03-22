import api from "@/lib/api";
import type {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  ForgotPasswordRequest,
} from "../types/auth.types";
import type { CustomAxiosRequestConfig } from "@/lib/api";

export interface VerifyOtpRequest {
  email?: string;
  phoneNumber?: string;
  otpCode: string;
}

export interface ResetPasswordRequest {
  phoneNumber: string;
  otpCode: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post("/auths/login", data);
    return res.data?.data ?? res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auths/logout");
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const res = await api.post("/auths/refresh-token");
    return res.data?.data ?? res.data;
  },

  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<{ message: string }> => {
    const res = await api.post("/auths/forgotpassword", data);
    return res.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<{ message: string }> => {
    const res = await api.post("/auths/verify-otp", data);
    return res.data?.data ?? res.data;
  },

  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<{ message: string }> => {
    const config: CustomAxiosRequestConfig = {
      skipAuth: true,
    };

    const res = await api.post("/auths/resetpassword", data, config);
    return res.data;
  },

  register: async (data: RegisterRequest) => {
    const res = await api.post("/auths/register", data);
    return res.data?.data ?? res.data;
  },

  resendOtp: async (email: string): Promise<{ message: string }> => {
    const res = await api.post("/auths/resend-otp", { email });
    return res.data;
  },

  sendRegisterOtp: async (data: { email: string; phone: string }) => {
    const res = await api.post("/auths/register-otp", data);
    return res.data;
  },

  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<{ message: string }> => {
    const res = await api.post("/auths/changepassword", data);
    return res.data;
  },
};
