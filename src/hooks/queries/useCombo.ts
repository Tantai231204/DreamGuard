// src/hooks/queries/useCombo.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { comboService } from '@/api';
import type {
  CreateComboRequest,
  UpdateComboRequest,
  ComboParams,
} from '@/api';

// ========================
// Query Keys
// ========================
export const comboKeys = {
  all: ['combos'] as const,
  admin: (params: ComboParams) => ['combos', 'admin', params] as const,
  detail: (id: string) => ['combos', id] as const,
};

// ========================
// Queries
// ========================

/** Fetch admin paginated combos list */
export const useAdminCombos = (params: ComboParams = {}) => {
  return useQuery({
    queryKey: comboKeys.admin(params),
    queryFn: () => comboService.getAll(params),
    placeholderData: keepPreviousData,
  });
};

/** Fetch all combos (non-paginated) */
export const useCombos = () => {
  return useQuery({
    queryKey: comboKeys.all,
    queryFn: comboService.getAllList,
  });
};

/** Lấy chi tiết 1 combo theo ID */
export const useComboDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: comboKeys.detail(id),
    queryFn: () => comboService.getById(id),
    enabled: !!id && enabled,
  });
};

// ========================
// Mutations
// ========================

/** Tạo mới combo */
export const useCreateCombo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateComboRequest) => comboService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comboKeys.all });
    },
  });
};

/** Cập nhật combo */
export const useUpdateCombo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateComboRequest }) =>
      comboService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: comboKeys.all });
      queryClient.invalidateQueries({ queryKey: comboKeys.detail(variables.id) });
    },
  });
};

/** Xóa combo */
export const useDeleteCombo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => comboService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comboKeys.all });
    },
  });
};
