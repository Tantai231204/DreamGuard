import { useQuery } from "@tanstack/react-query";
import variantService from "@/api/services/variantService";

export const variantKeys = {
    all: ['variants'] as const,
    detail: (id: string) => [...variantKeys.all, 'detail', id] as const,
};

export const useVariant = (id: string) => {
    const normalizedId = String(id || '').trim();

    return useQuery({
        queryKey: variantKeys.detail(normalizedId),
        queryFn: () => variantService.getById(normalizedId),
        enabled: !!normalizedId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};
