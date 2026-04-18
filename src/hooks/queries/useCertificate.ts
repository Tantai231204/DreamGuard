// src/hooks/queries/useCertificate.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { certificateService } from '@/api';
import type { CreateCertificateRequest, CertificateParams } from '@/pages/admin/products/types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { isAdminOrManager } from '@/lib/role';

export const certificateKeys = {
  all: ['certificates'] as const,
  admin: (params: CertificateParams) => ['certificates', 'admin', params] as const,
  detail: (id: string) => ['certificates', id] as const,
  byProduct: (productId: string) => ['certificates', 'product', productId] as const,
};

/** Fetch certificates by product ID */
export const useProductCertificates = (productId: string, options?: { enabled?: boolean; staleTime?: number }) => {
  return useQuery({
    queryKey: certificateKeys.byProduct(productId),
    queryFn: () => certificateService.getByProductId(productId),
    enabled: options?.enabled !== undefined ? (options.enabled && !!productId) : !!productId,
    staleTime: options?.staleTime,
  });
};

/** Fetch paginated certificates */
export const useAdminCertificates = (params: CertificateParams = {}, options?: { enabled?: boolean }) => {
  const role = useAuthStore((s) => s.role);

  return useQuery({
    queryKey: certificateKeys.admin(params),
    queryFn: () => certificateService.getAll(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== undefined 
      ? (options.enabled && isAdminOrManager(role)) 
      : isAdminOrManager(role),
  });
};

/** Fetch all certificates list (for dropdowns) */
export const useCertificates = (enabled = true) => {
  return useQuery({
    queryKey: [...certificateKeys.all, 'list'] as const,
    queryFn: () => certificateService.getAllList(),
    enabled,
  });
};

/** Create new certificate */
export const useCreateCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCertificateRequest) => certificateService.create(data),
    onSuccess: () => {
      toast.success('Certificate created successfully');
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    },
    onError: (error) => {
      toast.error('Failed to create certificate: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
};

/** Update certificate */
export const useUpdateCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCertificateRequest> }) =>
      certificateService.update(id, data),
    onSuccess: () => {
      toast.success('Certificate updated successfully');
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    },
    onError: (error) => {
      toast.error('Failed to update certificate: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
};

/** Update certificate status */
export const useUpdateCertificateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      certificateService.updateStatus(id, isActive),
    onSuccess: () => {
      toast.success('Certificate status updated successfully');
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
};

/** Delete certificate */
export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => certificateService.delete(id),
    onSuccess: () => {
      toast.success('Certificate deleted successfully');
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    },
    onError: (error) => {
      toast.error('Failed to delete certificate: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });
};
