// src/api/types/user.types.ts

export interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  avatarUrl?: string;
}

export interface UpdateUserProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
}
