// src/api/services/userService.ts
import apiClient from '../../lib/api';
import type { UserProfile, UpdateUserProfileRequest } from '../types';

const userService = {
  getProfile: (): Promise<UserProfile> =>
    apiClient.get('/UserProfiles').then((res) => res.data?.data ?? res.data),

  updateProfile: (data: UpdateUserProfileRequest): Promise<UserProfile> =>
    apiClient.put('/UserProfiles', data).then((res) => res.data?.data ?? res.data),
};

export default userService;
