// src/api/types/user.types.ts

export interface UserProfile {
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  avatarUrl?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
}
