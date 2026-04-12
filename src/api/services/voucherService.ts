// src/api/services/voucherService.ts
import apiClient from "../../lib/api";
import type {
  VoucherResponse,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherPageResponse,
} from "../types";

const unwrapPayload = <T>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

const normalizeVoucherPage = (payload: unknown, pageNumber: number): VoucherPageResponse => {
  const data = unwrapPayload<unknown>(payload);

  if (Array.isArray(data)) {
    return {
      items: data as VoucherResponse[],
      pageNumber,
      pageSize: data.length,
      totalCount: data.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  if (data && typeof data === "object") {
    const page = data as Partial<VoucherPageResponse>;
    if (Array.isArray(page.items)) {
      const items = page.items as VoucherResponse[];
      const totalCount = typeof page.totalCount === "number" ? page.totalCount : items.length;
      const pageSize = typeof page.pageSize === "number" ? page.pageSize : items.length;
      const safePageNumber = typeof page.pageNumber === "number" ? page.pageNumber : pageNumber;

      return {
        items,
        pageNumber: safePageNumber,
        pageSize,
        totalCount,
        totalPages: typeof page.totalPages === "number" ? page.totalPages : 1,
        hasPreviousPage: typeof page.hasPreviousPage === "boolean" ? page.hasPreviousPage : safePageNumber > 1,
        hasNextPage: typeof page.hasNextPage === "boolean" ? page.hasNextPage : safePageNumber * Math.max(pageSize, 1) < totalCount,
      };
    }
  }

  return {
    items: [],
    pageNumber,
    pageSize: 0,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };
};

const fetchVoucherPage = (pageNumber: number) =>
  apiClient
    .get(`/Voucher?pageNumber=${pageNumber}`)
    .then((res) => normalizeVoucherPage(res.data, pageNumber));

const voucherService = {
  /** Lấy toàn bộ danh sách voucher cho admin CRUD */
  getAll: async (): Promise<VoucherPageResponse> => {
    const firstPage = await apiClient
      .get("/Voucher")
      .then((res) => normalizeVoucherPage(res.data, 1));

    if (firstPage.totalPages <= 1) {
      return firstPage;
    }

    const remainingPages = Array.from({ length: firstPage.totalPages - 1 }, (_, index) => index + 2);
    const nextPages = await Promise.all(remainingPages.map(fetchVoucherPage));
    const mergedItems = [
      ...firstPage.items,
      ...nextPages.flatMap((page) => page.items),
    ];

    return {
      ...firstPage,
      items: mergedItems,
      pageNumber: 1,
      pageSize: mergedItems.length,
      totalCount: mergedItems.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  },

  /** Lấy chi tiết voucher theo ID */
  getById: (id: string): Promise<VoucherResponse> =>
    apiClient.get(`/Voucher/${id}`).then((res) => unwrapPayload<VoucherResponse>(res.data)),

  /** Tạo mới voucher */
  create: (data: CreateVoucherRequest): Promise<VoucherResponse> =>
    apiClient.post("/Voucher", data).then((res) => unwrapPayload<VoucherResponse>(res.data)),

  /** Cập nhật voucher */
  update: (id: string, data: UpdateVoucherRequest): Promise<VoucherResponse> =>
    apiClient.put(`/Voucher/${id}`, data).then((res) => unwrapPayload<VoucherResponse>(res.data)),

  /** Xóa voucher */
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/Voucher/${id}`).then((res) => res.data),
};

export default voucherService;
