import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ratingService from '@/api/services/ratingService';
import type { RatingPayload } from '@/api/types/rating';
import { serviceOrderKeys } from './useServiceOrder';

export const ratingKeys = {
  all: ['ratings'] as const,
  byServiceOrder: (serviceOrderId: string) => [...ratingKeys.all, 'service-order', serviceOrderId] as const,
  detail: (ratingId: string) => [...ratingKeys.all, ratingId] as const,
};

export const useRatingByServiceOrder = (serviceOrderId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ratingKeys.byServiceOrder(serviceOrderId),
    queryFn: () => ratingService.getRatingByServiceOrderId(serviceOrderId),
    enabled: options?.enabled !== undefined ? (options.enabled && !!serviceOrderId) : !!serviceOrderId,
    staleTime: 30000,
  });
};

export const useCreateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceOrderId, payload }: { serviceOrderId: string; payload: RatingPayload }) =>
      ratingService.createRating(serviceOrderId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.byServiceOrder(variables.serviceOrderId) });
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(variables.serviceOrderId) });
    },
  });
};

export const useUpdateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ratingId,
      payload,
    }: {
      ratingId: string;
      payload: RatingPayload;
      serviceOrderId: string;
    }) => ratingService.updateRating(ratingId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.byServiceOrder(variables.serviceOrderId) });
      queryClient.invalidateQueries({ queryKey: ratingKeys.detail(variables.ratingId) });
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(variables.serviceOrderId) });
    },
  });
};
