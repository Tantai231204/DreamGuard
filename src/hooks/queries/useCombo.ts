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
import { isComboParent } from '@/api/services/comboService';

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
export const useCombos = (enabled = true) => {
  return useQuery({
    queryKey: comboKeys.all,
    queryFn: comboService.getAllList,
    enabled,
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

/** Fetch only parent combos (no comboParentId) for selection dropdowns */
export const useComboParents = (enabled = true) => {
  return useQuery({
    queryKey: [...comboKeys.all, 'parents'] as const,
    queryFn: async () => {
      const all = await comboService.getAllList();
      return all.filter(isComboParent);
    },
    enabled,
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

/** Cập nhật items của combo */
export const useUpdateComboItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: import('@/api').ComboItemRequest[] }) =>
      comboService.updateItems(id, { items }),
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

/** Upload ảnh cho combo */
export const useUploadComboImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ comboId, files }: { comboId: string; files: File[] }) =>
      comboService.uploadImage(comboId, files),
    onSuccess: (_, { comboId }) => {
      queryClient.invalidateQueries({ queryKey: comboKeys.detail(comboId) });
      queryClient.invalidateQueries({ queryKey: comboKeys.all });
    },
  });
};

/** Xóa ảnh của combo */
export const useDeleteComboImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => comboService.deleteImage(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comboKeys.all });
    },
  });
};
