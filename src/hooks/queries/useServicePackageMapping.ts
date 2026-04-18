import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import servicePackageMappingService, { type ServicePackageMapping } from '@/api/services/servicePackageMappingService';

export const mappingKeys = {
    all: ['service-package-mappings'] as const,
    list: (params?: Record<string, unknown>) => [...mappingKeys.all, 'list', params] as const,
    byPackage: (id?: string) => [...mappingKeys.all, 'byPackage', id] as const,
};

export const usePackageMappings = (pkgId?: string, enabled = true) => {
    return useQuery({
        queryKey: mappingKeys.byPackage(pkgId),
        queryFn: () => servicePackageMappingService.getAll({ servicePackageId: pkgId, pageSize: 200 }),
        enabled: enabled && !!pkgId,
    });
};

export const useAllPackageMappings = () => {
    return useQuery({
        queryKey: [...mappingKeys.all, 'global-all'],
        queryFn: async () => {
            const data = await servicePackageMappingService.getAll({ pageSize: 1000 });
            return (Array.isArray(data) ? data : (data?.items ?? [])) as ServicePackageMapping[];
        },
    });
};

export const useAssignMapping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { productTypeId: string; servicePackageId: string; price: number }) =>
            servicePackageMappingService.assign(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: mappingKeys.all });
        }
    });
};

export const useUpdateMapping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { 
            mappingId: string; 
            price: number; 
            duration: number; 
            servicePackageId?: string;
            productTypeId?: string;
            servicePackage: { 
                packageName: string; 
                duration: number; 
                suitableFor: string; 
                benefits: string; 
                serviceContent: string 
            } 
        }) =>
            servicePackageMappingService.update(data.mappingId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: mappingKeys.all });
        }
    });
};
