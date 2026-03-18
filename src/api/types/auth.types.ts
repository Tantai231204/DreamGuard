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
  roleName: string;
}

// Note: Tokens are handled via HttpOnly cookies (Pure Cookie Approach).
// They are not stored in the frontend state for security.

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
}

export interface ForgotPasswordRequest {
  phoneNumber: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface ResendTokenRequest {
  email: string;
}
