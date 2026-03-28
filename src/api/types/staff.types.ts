export interface StaffResponse {
  staffId: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  position?: string;
  role?: string;
  avatarUrl?: string;
  createdDate?: string;
  status?: string;
}

export interface StaffPageResponse {
  items: StaffResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface StaffParams {
  pageNumber?: number;
  pageSize?: number;
  key?: string;
  Role?: string;
}

export interface CreateStaffRequest {
  email: string;
  password?: string;
  phoneNumber: string;
  fullName: string;
  gender: string;
  dateOfBirth: string | null;
  address: string;
  position: string;
  role: string;
}

export interface UpdateStaffRequest {
  fullName: string;
  address: string;
  gender: string;
  dateOfBirth: string | null;
  avatarUrl: string;
}
export interface UpdateStaffAccountRequest {
  phoneNumber?: string;
  email?: string;
  password?: string;
}
