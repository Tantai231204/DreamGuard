export interface RatingPayload {
  comment: string;
  score: number;
}

export interface RatingResponse {
  id?: string;
  ratingId?: string;
  serviceOrderId?: string;
  staffId?: string;
  staffName?: string;
  customerId?: string;
  comment?: string;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RatingSearchParams {
  serviceOrderId?: string;
  staffId?: string;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface RatingListResponse {
  items: RatingResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface StaffRatingSummary {
  staffId: string;
  averageStars: number;
  totalRatings: number;
}
