import { useQuery } from "@tanstack/react-query";
import variantService from "@/api/services/variantService";

export const variantKeys = {
    all: ['variants'] as const,
    detail: (id: string) => [...variantKeys.all, 'detail', id] as const,
};

export const useVariant = (id: string) => {
    return useQuery({
        queryKey: variantKeys.detail(id),
        queryFn: () => variantService.getById(id),
        enabled: !!id,
    });
};
