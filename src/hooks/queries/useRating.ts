import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ratingService from '@/api/services/ratingService';
import type { RatingPayload } from '@/api/types/rating';
import { serviceOrderKeys } from './useServiceOrder';

export const ratingKeys = {
  all: ['ratings'] as const,
  byServiceOrder: (serviceOrderId: string, staffId?: string) => [...ratingKeys.all, 'service-order', serviceOrderId, staffId || 'no-staff'] as const,
  byStaff: (staffId: string) => [...ratingKeys.all, 'staff', staffId] as const,
  detail: (ratingId: string) => [...ratingKeys.all, ratingId] as const,
};

export const useRatingByServiceOrder = (
  serviceOrderId: string,
  staffId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ratingKeys.byServiceOrder(serviceOrderId, staffId),
    queryFn: () => ratingService.getRatingByServiceOrderId(serviceOrderId, staffId),
    enabled: options?.enabled !== undefined ? (options.enabled && !!serviceOrderId && !!staffId) : (!!serviceOrderId && !!staffId),
    retry: false,
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
      queryClient.invalidateQueries({ queryKey: ratingKeys.all });
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(variables.serviceOrderId) });
    },
  });
};

export const useStaffRatingSummary = (staffId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ratingKeys.byStaff(staffId),
    queryFn: () => ratingService.getStaffRatingSummary(staffId),
    enabled: options?.enabled !== undefined ? (options.enabled && !!staffId) : !!staffId,
    staleTime: 30000,
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
      queryClient.invalidateQueries({ queryKey: ratingKeys.all });
      queryClient.invalidateQueries({ queryKey: ratingKeys.detail(variables.ratingId) });
      queryClient.invalidateQueries({ queryKey: serviceOrderKeys.detail(variables.serviceOrderId) });
    },
  });
};
