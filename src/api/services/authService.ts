// src/api/services/authService.ts
import apiClient from '../../lib/api';
import type { ApiResponse, Token, LoginRequest, RegisterRequest, ForgotPasswordRequest, VerifyTokenRequest, ResendTokenRequest } from '../types';

const authService = {
  login: (data: LoginRequest): Promise<ApiResponse<Token>> =>
    apiClient.post('/auth', data).then((res) => res.data),

  register: (data: RegisterRequest): Promise<ApiResponse<Token>> =>
    apiClient.post('/register', data).then((res) => res.data),

  forgotPassword: (data: ForgotPasswordRequest): Promise<ApiResponse<null>> =>
    apiClient.put('/auth/forgot-password', data).then((res) => res.data),

  verifyToken: (data: VerifyTokenRequest): Promise<ApiResponse<null>> =>
    apiClient.post('/auth/verify-token', data).then((res) => res.data),

  resendToken: (data: ResendTokenRequest): Promise<ApiResponse<null>> =>
    apiClient.post('/auth/resend-token', data).then((res) => res.data),
};

export default authService;
