// src/api/userApi.ts

import api from '../lib/api';
import type { UserProfileResponse, UpdateUserProfileRequest } from './schemas/userSchemas';


export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const res = await api.get<UserProfileResponse>('/user/profile');
  return res.data;
};


export const updateUserProfile = async (data: UpdateUserProfileRequest): Promise<UserProfileResponse> => {
  const res = await api.put<UserProfileResponse>('/user/profile', data);
  return res.data;
};
