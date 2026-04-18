import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import productFeedbackService from '@/api/services/productFeedbackService';
import type { ProductFeedbackPayload } from '@/api/types/feedback';

export const feedbackKeys = {
  all: ['product-feedbacks'] as const,
  byOrderItem: (orderItemId: string) => [...feedbackKeys.all, 'order-item', orderItemId] as const,
  byProduct: (productId: string) => [...feedbackKeys.all, 'product', productId] as const,
};

export const useProductFeedback = (orderItemId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: feedbackKeys.byOrderItem(orderItemId),
    queryFn: () => productFeedbackService.getFeedbackByOrderItemId(orderItemId),
    enabled: options?.enabled !== undefined ? (options.enabled && !!orderItemId) : !!orderItemId,
    retry: false,
    staleTime: 30000,
  });
};

export const useProductFeedbacks = (productId: string, options?: { enabled?: boolean; staleTime?: number }) => {
  return useQuery({
    queryKey: feedbackKeys.byProduct(productId),
    queryFn: () => productFeedbackService.getProductFeedbacks(productId),
    enabled: options?.enabled !== undefined ? (options.enabled && !!productId) : !!productId,
    staleTime: options?.staleTime ?? 60000,
  });
};

export const useCreateProductFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderItemId, payload }: { orderItemId: string; payload: ProductFeedbackPayload }) =>
      productFeedbackService.createFeedback(orderItemId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.byOrderItem(variables.orderItemId) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
  });
};

export const useUpdateProductFeedbackStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, status }: { feedbackId: string; status: string }) =>
      productFeedbackService.updateStatus(feedbackId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
  });
};
