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
import { toast } from 'sonner';
// ========================
// Query Keys
// ========================
export const comboKeys = {
  all: ['combos'] as const,
  admin: (params: ComboParams) => ['combos', 'admin', params] as const,
  public: (params: ComboParams) => ['combos', 'public', params] as const,
  detail: (id: string) => ['combos', id] as const,
  slug: (slug: string, params?: { size?: string; color?: string }) => ['combos', 'slug', slug, params] as const,
};

// ========================
// Queries
// ========================

/** Fetch public paginated combos list */
export const usePublicCombos = (params: ComboParams = {}) => {
  return useQuery({
    queryKey: comboKeys.public(params),
    queryFn: () => comboService.getAllPublic(params),
    placeholderData: keepPreviousData,
  });
};

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

/** Lấy chi tiết 1 combo theo Slug */
export const useComboBySlug = (slug: string, params?: { size?: string; color?: string }, enabled = true) => {
  return useQuery({
    queryKey: comboKeys.slug(slug, params),
    queryFn: () => comboService.getBySlug(slug, params),
    enabled: !!slug && enabled,
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
      toast.success('Combo updated successfully');
      queryClient.invalidateQueries({ queryKey: comboKeys.all });
      queryClient.invalidateQueries({ queryKey: comboKeys.detail(variables.id) });
    },
    onError: (error) => {
       toast.error('Failed to update combo: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
};

/** Cập nhật items của combo - Optimistic UI */
export const useUpdateComboItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: import('@/api').ComboItemRequest[] }) =>
      comboService.updateItems(id, { items }),
    
    // ── Optimistic Update Logic ──
    onMutate: async ({ id, items }) => {
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: comboKeys.detail(id) });

      // 2. Snapshot the previous value
      const previousDetail = queryClient.getQueryData<import('@/api/services/comboService').ComboResponse>(comboKeys.detail(id));

      // 3. Optimistically update to the new value
      if (previousDetail) {
         const optimisticDetail = {
           ...previousDetail,
           productItems: previousDetail.productItems?.map((pi: import('@/api/services/comboService').ProductItemResponse) => {
             const newItem = items.find(ui => ui.productVariantId === pi.productVariantId);
             return newItem ? { ...pi, quantity: newItem.quantity } : pi;
           })
         };
         queryClient.setQueryData(comboKeys.detail(id), optimisticDetail);
      }

      return { previousDetail };
    },

    onSuccess: () => {
      toast.success('Component quantity synced');
    },

    onError: (err, { id }, context) => {
      // 4. If mutation fails, reload previous state
      if (context?.previousDetail) {
        queryClient.setQueryData(comboKeys.detail(id), context.previousDetail);
      }
      toast.error('Sync failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    },

    onSettled: (_data, _error, { id }) => {
      // 5. Always refetch after error or success to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: comboKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: comboKeys.all });
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
