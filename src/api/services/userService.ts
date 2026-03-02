// src/api/services/userService.ts
import apiClient from '../../lib/api';
import type { ApiResponse, UserProfile, UpdateUserProfileRequest } from '../types';

const userService = {
  getProfile: (): Promise<ApiResponse<UserProfile>> =>
    apiClient.get('/user/profile').then((res) => res.data),

  updateProfile: (data: UpdateUserProfileRequest): Promise<ApiResponse<UserProfile>> =>
    apiClient.put('/user/profile', data).then((res) => res.data),
};

export default userService;
