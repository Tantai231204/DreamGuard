// src/api/types/auth.types.ts

export interface Token {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  roleName: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface ResendTokenRequest {
  email: string;
}
