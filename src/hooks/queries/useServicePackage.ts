import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import servicePackageService from '@/api/services/servicePackageService';

export const useAdminServicePackages = (params?: { pageNumber?: number; pageSize?: number; status?: string }) => {
    return useQuery({
        queryKey: ['admin-service-packages', params],
        queryFn: () => servicePackageService.getAllAdmin(params),
    });
};

export const useServicePackageDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['service-package', id],
        queryFn: () => servicePackageService.getById(id),
        enabled: !!id && enabled
    });
};

export const useCreateServicePackage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: servicePackageService.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-service-packages'] }),
    });
};

export const useUpdateServicePackage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<import('@/api/services/servicePackageService').ServicePackage> }) => 
            servicePackageService.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-service-packages'] }),
    });
};

export const useUpdateServicePackageStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'Active' | 'Inactive' }) => 
            servicePackageService.updateStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-service-packages'] }),
    });
};

export const useDeletePackageImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: servicePackageService.deleteImage,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-service-packages'] }),
    });
};

export const useReplacePackageImage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => servicePackageService.replaceImage(id, file),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-service-packages'] }),
    });
};
