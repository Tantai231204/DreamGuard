export interface CustomerResponse {
  customerId: string;
  fullName: string;
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  email: string;
}

export interface CustomerPageResponse {
  items: CustomerResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CustomerParams {
  pageNumber?: number;
  pageSize?: number;
  key?: string;
}
