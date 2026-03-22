import { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import productTypeService from '@/api/services/productTypeService';
import apiClient from '@/lib/api';

export interface ServiceTier {
    tierId: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    badge?: string;
    featured?: boolean;
}

export interface ProductType {
    id: string;
    label: string;
    description: string;
    icon: string;
    tiers: ServiceTier[];
}

export interface ServicePackageResponse {
    servicePackageId: string;
    packageName: string;
    status?: string;
    duration?: number;
    suitableFor?: string;
    benefits?: string;
    serviceContent?: string;
    imageUrl?: string;
}

export interface ServicePackageMapping {
    servicePackageMappingId: string;
    productTypeId: string;
    servicePackageId: string;
    duration?: number;
    price?: number;
    servicePackage?: ServicePackageResponse;
}

import { type ProductAssetIconKey } from '@/components/common/icons';

export const resolveAssetIcon = (name: string): ProductAssetIconKey => {
    const lower = name.toLowerCase();
    
    // Blanket / Thảm / Chăn
    if (lower.includes('thảm') || lower.includes('chăn') || lower.includes('blanket')) return "BLANKET";
    
    // Crib / Mattress / Giường / Nôi / Cũi / Nệm
    if (lower.includes('nôi') || lower.includes('cũi') || lower.includes('giường') || lower.includes('cradle') || lower.includes('bed') || lower.includes('mattress') || lower.includes('nệm')) return "CRIB";
    
    // Pillow / Set / Ngủ / Bé / Mẹ
    if (lower.includes('ngủ') || lower.includes('mẹ') || lower.includes('bé') || lower.includes('set') || lower.includes('pillow') || lower.includes('gối') || lower.includes('baby')) return "BABY_SLEEP";
    
    // Sofa / Gấp / Quây
    if (lower.includes('gấp') || lower.includes('xếp') || lower.includes('sofa') || lower.includes('sheet') || lower.includes('fold') || lower.includes('quây')) return "FOLDING";
    
    if (lower.includes('xe') || lower.includes('car')) return "PRODUCT_CATEGORIES";
    
    return "PRODUCT_CATEGORIES";
};

export function useBookingData(selectedProducts: string[] = []) {
    const { data: productTypesData, isLoading: isLoadingTypes } = useQuery({
        queryKey: ['productTypes_get_all'],
        queryFn: () => productTypeService.getAll({ pageSize: 100 })
    });

    const items = useMemo(() => productTypesData?.items ?? [], [productTypesData]);

    const mappingsQueries = useQueries({
        queries: items.map((pt) => ({
            queryKey: ['product-mapping-booking', pt.productTypeId],
            queryFn: () => apiClient.get<ServicePackageMapping[]>(`/ProductTypes/${pt.productTypeId}/service-package-mapping`).then((res) => res.data),
            staleTime: 60000,
            enabled: selectedProducts.includes(pt.productTypeId)
        }))
    });

    const productTypes: ProductType[] = useMemo(() => {
        return items.map((pt, index) => {
            const mappings = mappingsQueries[index]?.data ?? [];
            const safeMappings = Array.isArray(mappings) ? mappings : [];

            return {
                id: pt.productTypeId,
                label: pt.productTypeName,
                description: "Professional cleaning with premium quality.",
                icon: resolveAssetIcon(pt.productTypeName),
                tiers: safeMappings.map((m: ServicePackageMapping) => {
                    const pkg = m.servicePackage;
                    const benefitsStr = pkg?.benefits || "";
                    const features = benefitsStr ? benefitsStr.split('\r\n').filter((f: string) => f.trim()) : ["Standard Wash", "Expert Verification"];
                    const isPremium = (pkg?.packageName || "").toLowerCase().includes('premium') || (pkg?.packageName || "").toLowerCase().includes('deep');

                    return {
                        tierId: m.servicePackageMappingId, 
                        name: pkg?.packageName || "Package",
                        price: m.price || 0,
                        description: pkg?.serviceContent || "Professional cleaning quality guarantees.",
                        features: features,
                        badge: isPremium ? "Popular" : undefined,
                        featured: isPremium
                    };
                })
            };
        });
    }, [items, mappingsQueries]);

    const getProductTierPrice = (productId: string, tierId: string) => {
        const product = productTypes.find((p) => p.id === productId);
        const tier = product?.tiers.find((t) => t.tierId === tierId);
        return tier?.price ?? 0;
    };

    const isLoading = isLoadingTypes;

    return { productTypes, getProductTierPrice, isLoading };
}
