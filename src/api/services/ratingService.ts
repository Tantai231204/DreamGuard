import apiClient from '@/lib/api';
import type {
  RatingListResponse,
  RatingPayload,
  RatingResponse,
  RatingSearchParams,
  StaffRatingSummary,
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

  getAllRatingsByStaffId: async (
    staffId: string,
    params?: { pageNumber?: number; pageSize?: number }
  ): Promise<RatingListResponse> => {
    const normalizedStaffId = String(staffId || '').trim();
    if (!normalizedStaffId) {
      return normalizeListPayload({ items: [] });
    }

    const res = await apiClient.get(`/Ratings/GetAllRatingsByStaffId/${normalizedStaffId}`, {
      params,
    });
    const payload = res.data?.data ?? res.data;

    if (Array.isArray(payload)) {
      return normalizeListPayload({ items: payload });
    }

    return normalizeListPayload(payload);
  },

  getRatingByServiceOrderId: async (serviceOrderId: string, staffId?: string): Promise<RatingResponse | null> => {
    const normalizedServiceOrderId = String(serviceOrderId || '').trim();
    const normalizedStaffId = String(staffId || '').trim();

    if (!normalizedServiceOrderId || !normalizedStaffId) return null;

    try {
      const firstPage = await ratingService.getAllRatingsByStaffId(normalizedStaffId, {
        pageNumber: 1,
        pageSize: 50,
      });

      let allItems = [...(firstPage.items || [])];
      const totalPages = Math.max(1, firstPage.totalPages || 1);

      if (totalPages > 1) {
        const pageRequests: Promise<RatingListResponse>[] = [];
        for (let page = 2; page <= totalPages; page += 1) {
          pageRequests.push(
            ratingService.getAllRatingsByStaffId(normalizedStaffId, {
              pageNumber: page,
              pageSize: 50,
            })
          );
        }

        const pages = await Promise.all(pageRequests);
        pages.forEach((pageData) => {
          allItems = allItems.concat(pageData.items || []);
        });
      }

      const found = allItems.find((item) => String(item.serviceOrderId || '').trim() === normalizedServiceOrderId);
      return found ?? null;
    } catch (error) {
      const status = (error as { status?: number })?.status;
      if (status === 403) return null;
      throw error;
    }
  },

  getStaffRatingSummary: async (staffId: string): Promise<StaffRatingSummary> => {
    const normalizedStaffId = String(staffId || '').trim();
    if (!normalizedStaffId) {
      return { staffId: '', averageStars: 0, totalRatings: 0 };
    }

    const firstPage = await ratingService.getAllRatingsByStaffId(normalizedStaffId, {
      pageNumber: 1,
      pageSize: 50,
    });

    let allItems = [...firstPage.items];
    const totalPages = Math.max(1, firstPage.totalPages || 1);

    if (totalPages > 1) {
      const pageRequests: Promise<RatingListResponse>[] = [];
      for (let page = 2; page <= totalPages; page += 1) {
        pageRequests.push(
          ratingService.getAllRatingsByStaffId(normalizedStaffId, {
            pageNumber: page,
            pageSize: 50,
          })
        );
      }

      const pages = await Promise.all(pageRequests);
      pages.forEach((pageData) => {
        allItems = allItems.concat(pageData.items || []);
      });
    }

    const scores = allItems
      .map((item) => Number(item.score))
      .filter((value) => Number.isFinite(value) && value > 0);

    const totalRatings = scores.length;
    if (!totalRatings) {
      return { staffId: normalizedStaffId, averageStars: 0, totalRatings: 0 };
    }

    const totalScore = scores.reduce((sum, value) => sum + value, 0);
    const averageStars = totalScore / totalRatings;

    return {
      staffId: normalizedStaffId,
      averageStars,
      totalRatings,
    };
  },
};

export default ratingService;
