import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userVoucherService } from "@/api";
import type { ClaimVoucherRequest } from "@/api";

interface UseUserVouchersOptions {
  enabled?: boolean;
  pageSize?: number;
  isUsed?: boolean;
}

export const userVoucherKeys = {
  all: ["user-vouchers"] as const,
  list: (options: Pick<UseUserVouchersOptions, "pageSize" | "isUsed">) => ["user-vouchers", options] as const,
  detail: (id: string) => ["user-vouchers", id] as const,
};

export const useUserVouchers = (optionsOrEnabled: boolean | UseUserVouchersOptions = true) => {
  const options =
    typeof optionsOrEnabled === "boolean"
      ? ({ enabled: optionsOrEnabled } satisfies UseUserVouchersOptions)
      : optionsOrEnabled;

  const { enabled = true, pageSize, isUsed } = options;

  return useQuery({
    queryKey: userVoucherKeys.list({ pageSize, isUsed }),
    queryFn: () => userVoucherService.getAll({ pageSize, isUsed }),
    enabled,
    staleTime: 30000,
  });
};

export const useUserVoucherDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: userVoucherKeys.detail(id),
    queryFn: () => userVoucherService.getById(id),
    enabled: enabled && !!id,
  });
};

export const useClaimVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClaimVoucherRequest) => userVoucherService.claimVoucher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userVoucherKeys.all });
    },
  });
};
