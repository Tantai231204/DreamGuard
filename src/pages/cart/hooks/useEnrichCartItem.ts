import { useMemo } from "react"
import { useVariant } from "@/hooks/queries/useVariant"
import { useComboDetail } from "@/hooks/queries/useCombo"
import { useProductDetail } from "@/hooks/queries/useProduct"
import type { CartItem } from "@/store/cartTypes"
import type { VariantResponse, VariantAttributes } from "@/api/services/variantService"
import type { ComboResponse } from "@/api/services/comboService"

interface EnrichedCartItem {
    name?: string;
    color?: string;
    size?: string;
    image?: string;
    isCombo: boolean;
    subItems?: Array<{ name: string; quantity: number; image?: string; productVariantId?: string }>;
    sku?: string;
    price?: number;
    basePrice?: number;
}

export const useEnrichCartItem = (item: CartItem) => {
    const isCombo = !!item.comboId;
    const { data: variant, isLoading: isVarLoading } = useVariant(!isCombo ? (item.productVariantId || "") : "");
    const vData = variant as VariantResponse;
    const variantProductId = vData?.productId || "";
    const { data: product } = useProductDetail(variantProductId, !!variantProductId);
    const { data: combo, isLoading: isComboLoading } = useComboDetail(item.comboId || "", isCombo);

    // Parent Recovery: If it's a child combo with no image, fetch the parent combo
    const parentId = (combo as ComboResponse)?.comboParentId || "";
    const { data: parentCombo } = useComboDetail(parentId, isCombo && !!parentId && !(combo as ComboResponse)?.imageUrl);

    // Deep fallback: If it's a combo but the response has no image, fetch the first sub-item's variant to get its image
    const firstSubItemVariantId = (combo as ComboResponse)?.productItems?.[0]?.productVariantId ||
        (combo as ComboResponse)?.items?.[0]?.variantId || "";
    const { data: fallbackVariant } = useVariant(isCombo && !(combo as ComboResponse)?.imageUrl && !parentCombo?.imageUrl ? firstSubItemVariantId : "");

    const enriched = useMemo((): EnrichedCartItem => {
        // Base state from item
        const base: EnrichedCartItem = {
            name: item.name,
            color: item.color,
            size: item.size,
            image: (item.image && typeof item.image === 'string' && item.image.length > 2) ? item.image : undefined,
            isCombo,
            sku: item.sku,
            price: item.price,
            basePrice: item.price,
            // Recover sub-items from store to prevent flickering
            subItems: item.productCustomizeDetails && item.productCustomizeDetails.length > 0
                ? item.productCustomizeDetails.map(d => ({
                    name: d.customizeContent || d.customizeTypeName,
                    quantity: 1,
                }))
                : undefined
        };

        if (isCombo && combo) {
            const comboData = combo as ComboResponse;
            const subItems = comboData.productItems?.map(p => ({
                name: p.productName,
                quantity: p.quantity,
                image: (p.imageUrl && p.imageUrl.length > 2) ? p.imageUrl : undefined,
                productVariantId: p.productVariantId
            })) || [];

            // 4. Resolve the best possible image
            const firstSubItemImage = subItems.find(s => s.image)?.image;
            
            // Deep recovery for child combos: get image from first constituent variant
            const fallbackVarData = fallbackVariant as VariantResponse;
            const fallbackVarImg = (fallbackVarData?.attributes as VariantAttributes)?.imageUrl as string;
            
            // Final fallback: Use the product-level image if variant attributes are empty
            const pData = product as { imageUrls?: string[]; imageUrl?: string } | undefined;
            const productImg = pData?.imageUrls?.[0] || pData?.imageUrl;
            
            // If the current combo is empty, try: 
            // 1. Parent Combo Image
            // 2. First successful sub-item image from enriched list
            // 3. The dedicated fallback variant fetch (deep fetch)
            // 4. The root product image of that alternative variant
            const ultimateImg = (comboData?.imageUrl && comboData.imageUrl.length > 5)
                ? comboData.imageUrl
                : (comboData?.images?.[0] || parentCombo?.imageUrl || firstSubItemImage || fallbackVarImg || productImg || base.image);

            return {
                ...base,
                name: comboData.name || base.name,
                color: item.color || comboData.color || base.color,
                size: item.size || comboData.size || base.size,
                image: ultimateImg,
                sku: comboData.sku || base.sku,
                subItems: subItems.length > 0 ? subItems : base.subItems
            };
        }

        if (!isCombo && variant) {
            const variantData = variant as VariantResponse;
            const attrColor = variantData.attributes?.color || variantData.attributes?.colorHex || variantData.attributes?.hexColor;
            
            const pData = product as { imageUrls?: string[]; imageUrl?: string } | undefined;
            const productImg = pData?.imageUrls?.[0] || pData?.imageUrl;
            const variantImg = (variantData.attributes as VariantAttributes)?.imageUrl as string || productImg;

            return {
                ...base,
                name: variantData.sku || base.name,
                color: item.color || (typeof attrColor === 'string' ? attrColor : undefined) || base.color,
                size: item.size || variantData.size || (variantData.attributes?.size as string) || base.size,
                image: variantImg || base.image,
                sku: variantData.sku || base.sku,
                price: variantData.salePrice || base.price
            };
        }

        return base;
    }, [item, variant, combo, isCombo, parentCombo, fallbackVariant, product]);

    return {
        ...enriched,
        isLoading: isCombo ? isComboLoading : isVarLoading
    };
};
