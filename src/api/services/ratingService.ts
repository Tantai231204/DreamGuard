import apiClient from '@/lib/api';
import type {
  RatingListResponse,
  RatingPayload,
  RatingResponse,
  RatingSearchParams,
} from '@/api/types/rating';

function normalizeListPayload(payload: unknown): RatingListResponse {
  const data = payload as {
    items?: RatingResponse[];
    pageNumber?: number;
    pageSize?: number;
    totalPages?: number;
    totalCount?: number;
  };

  return {
    items: Array.isArray(data?.items) ? data.items : [],
    pageNumber: data?.pageNumber ?? 1,
    pageSize: data?.pageSize ?? (Array.isArray(data?.items) ? data.items.length : 0),
    totalPages: data?.totalPages ?? 1,
    totalCount: data?.totalCount ?? (Array.isArray(data?.items) ? data.items.length : 0),
  };
}

const ratingService = {
  createRating: async (serviceOrderId: string, payload: RatingPayload): Promise<RatingResponse> => {
    const res = await apiClient.post(`/Ratings/${serviceOrderId}`, payload);
    return (res.data?.data ?? res.data) as RatingResponse;
  },

  updateRating: async (ratingId: string, payload: RatingPayload): Promise<RatingResponse> => {
    const res = await apiClient.put(`/Ratings/${ratingId}`, payload);
    return (res.data?.data ?? res.data) as RatingResponse;
  },

  getRatingById: async (ratingId: string): Promise<RatingResponse> => {
    const res = await apiClient.get(`/Ratings/${ratingId}`);
    return (res.data?.data ?? res.data) as RatingResponse;
  },

  adminSearchRatings: async (params?: RatingSearchParams): Promise<RatingListResponse> => {
    const res = await apiClient.get('/Ratings/AdminSearchRatings', { params });
    const payload = res.data?.data ?? res.data;

    if (Array.isArray(payload)) {
      return normalizeListPayload({ items: payload });
    }

    return normalizeListPayload(payload);
  },

  getRatingByServiceOrderId: async (serviceOrderId: string): Promise<RatingResponse | null> => {
    const result = await ratingService.adminSearchRatings({
      serviceOrderId,
      pageNumber: 1,
      pageSize: 1,
    });

    return result.items[0] ?? null;
  },
};

export default ratingService;
