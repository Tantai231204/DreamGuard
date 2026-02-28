// src/api/publicApiService.ts
import apiClient from '../lib/api';
import { API_BASE_URL } from '../lib/constants';
import type { ApiResponse } from './schemas/apiResponse';
import type { Token, ApiResponseWithDataNull } from './schemas/authSchemas';

const publicApiService = {
  login: (infoLogin: object): Promise<ApiResponse<Token>> =>
    apiClient.post(API_BASE_URL + '/auth', infoLogin).then((res) => res.data),

  register: async (infoRegister: object): Promise<ApiResponse<Token>> => {
    const response = await apiClient.post(API_BASE_URL + '/register', infoRegister);
    return response.data;
  },

  forgetPass: (emailInfo: object): Promise<ApiResponse<ApiResponseWithDataNull>> =>
    apiClient.put(API_BASE_URL + '/auth/forgot-password', emailInfo).then((res) => res.data),

  verifyToken: (token: object): Promise<ApiResponse<ApiResponseWithDataNull>> =>
    apiClient.post(API_BASE_URL + '/auth/verify-token', token).then((res) => res.data),

  resendToken: (emailInfo: object): Promise<ApiResponse<ApiResponseWithDataNull>> =>
    apiClient.post(API_BASE_URL + '/auth/resend-token', emailInfo).then((res) => res.data),
};

export default publicApiService;
