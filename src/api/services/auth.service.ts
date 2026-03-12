import api from "@/lib/api";
import type {
  LoginRequest,
  AuthResponse,
  RegisterRequest
} from "../types/auth.types";

// chĩnh lại format code cho clear hơn
export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  phoneNumber: string;
  otpCode: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}


// export interface RegisterRequest {
//   email: string;
//   password: string;
//   firstName: string;
//   lastName: string;
//   phoneNumber: string;
//   gender: "Male" | "Female";
//   dateOfBirth: string;
// }

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
    data: ForgotPasswordRequest
  ): Promise<{ message: string }> => {
    const res = await api.post("/auths/forgot-password", data);
    return res.data?.data ?? res.data;
  },

  verifyOtp: async (
    data: VerifyOtpRequest
  ): Promise<{ message: string }> => {
    const res = await api.post("/auths/verify-otp", data);
    return res.data?.data ?? res.data;
  },

  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<{ message: string }> => {
    const res = await api.post("/auths/reset-password", data);
    return res.data?.data ?? res.data;
  },

  register: async (data: RegisterRequest) => {
    const res = await api.post("/auths/register", data);
    return res.data?.data ?? res.data;
  },

  resendOtp: async (email: string): Promise<{ message: string }> => {
    const res = await api.post("/auths/resend-otp", { email });
    return res.data?.data ?? res.data;
  },

  sendRegisterOtp: async (data: {
    email: string
    phone: string
  }) => {
    const res = await api.post("/auths/register-otp", data)
    return res.data?.data ?? res.data
  }
};