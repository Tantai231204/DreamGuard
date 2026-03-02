// src/api/types/user.types.ts

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  avatarUrl?: string;
}
