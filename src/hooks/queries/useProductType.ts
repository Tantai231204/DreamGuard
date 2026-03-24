import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productTypeService from '@/api/services/productTypeService';
import type { 
    CreateProductTypeRequest, 
    UpdateProductTypeRequest 
} from '@/api/services/productTypeService';

export const productTypeKeys = {
    all: ['productTypes'] as const,
    lists: () => [...productTypeKeys.all, 'list'] as const,
    list: (params: { pageNumber?: number; pageSize?: number; isActive?: boolean; Key?: string }) => [...productTypeKeys.lists(), params] as const,
};

export const useProductTypes = (params: { 
    pageNumber?: number; 
    pageSize?: number; 
    isActive?: boolean; 
    Key?: string 
}) => {
    return useQuery({
        queryKey: productTypeKeys.list(params),
        queryFn: () => productTypeService.adminSearch(params),
    });
};

export const useCreateProductType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateProductTypeRequest) => productTypeService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
        },
    });
};

export const useUpdateProductType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductTypeRequest }) => 
            productTypeService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
        },
    });
};


export const useDeleteProductType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productTypeService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
        },
    });
};

export const useAssignPackagesToProductType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productTypeId, data }: { productTypeId: string; data: { requests: { servicePackageId: string, price: number }[] } }) => 
            productTypeService.assignPackages(productTypeId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productTypeKeys.all });
            // Should probably invalidate service packages too as they are interconnected
            queryClient.invalidateQueries({ queryKey: ['admin-service-packages'] });
        },
    });
};
