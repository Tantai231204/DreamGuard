// src/hooks/queries/useVoucher.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { voucherService } from "@/api";
import type { CreateVoucherRequest, UpdateVoucherRequest } from "@/api";

// ========================
// Query Keys
// ========================
export const voucherKeys = {
  all: ["vouchers"] as const,
  detail: (id: string) => ["vouchers", id] as const,
};

// ========================
// Queries
// ========================

/** Lấy danh sách voucher cho admin */
export const useVouchers = () => {
  return useQuery({
    queryKey: voucherKeys.all,
    queryFn: () => voucherService.getAll(),
    staleTime: 0,
  });
};

/** Lấy chi tiết 1 voucher theo ID */
export const useVoucherDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: voucherKeys.detail(id),
    queryFn: () => voucherService.getById(id),
    enabled: enabled && !!id,
  });
};

// ========================
// Mutations
// ========================

/** Tạo mới voucher */
export const useCreateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVoucherRequest) => voucherService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
    },
  });
};

/** Cập nhật voucher */
export const useUpdateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVoucherRequest }) =>
      voucherService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
    },
  });
};

/** Xóa voucher */
export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => voucherService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.all });
    },
  });
};
