// src/api/schemas/userSchemas.ts

// Định nghĩa schema cho response API user

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  // Thêm các trường khác nếu cần
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  avatarUrl?: string;
  // Thêm các trường khác nếu cần
}
                                                                                                                                                                                                                                                    