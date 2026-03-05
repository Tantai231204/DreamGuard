// src/api/services/voucherService.ts
import apiClient from "../../lib/api";
import type {
  VoucherResponse,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherPageResponse,
} from "../types";

const voucherService = {
  /** Lấy danh sách vouchers với phân trang */
  getAll: (pageNumber = 1): Promise<VoucherPageResponse> =>
    apiClient.get(`/Voucher?pageNumber=${pageNumber}`).then((res) => res.data),

  /** Lấy chi tiết voucher theo ID */
  getById: (id: string): Promise<VoucherResponse> =>
    apiClient.get(`/Voucher/${id}`).then((res) => res.data),

  /** Tạo mới voucher */
  create: (data: CreateVoucherRequest): Promise<VoucherResponse> =>
    apiClient.post("/Voucher", data).then((res) => res.data),

  /** Cập nhật voucher */
  update: (id: string, data: UpdateVoucherRequest): Promise<VoucherResponse> =>
    apiClient.put(`/Voucher/${id}`, data).then((res) => res.data),

  /** Xóa voucher */
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/Voucher/${id}`).then((res) => res.data),
};

export default voucherService;
