import { useState, useMemo, useEffect, useCallback } from "react";
import { useQueries } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import variantService from "@/api/services/variantService";
import { useComboBySlug, useComboDetail as useComboDetailQuery } from "@/hooks/queries/useCombo";
import { useCartStore } from "@/store/useCartStore";
import { useBreadcrumb } from "@/components/common/BreadcrumbNav";
import { toast } from "sonner";
import type { Combo } from "../../types";

export function useComboDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { addItem } = useCartStore(); // Using correct store
    const { data: comboResponse, isLoading, isError } = useComboBySlug(slug || "");
    const { setItems: setBreadcrumb } = useBreadcrumb();

    const [userSelectedVariantId, setUserSelectedVariantId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Initial parent combo
    const combo = comboResponse as unknown as Combo | undefined;

    // Determine currently selected ID (default to first variant or parent)
    const selectedVariantId = useMemo(() => {
        if (userSelectedVariantId) return userSelectedVariantId;
        if (combo?.childCombos && combo.childCombos.length > 0) return combo.childCombos[0].id;
        return combo?.id || null;
    }, [combo, userSelectedVariantId]);

    // FETCH SPECIFIC VARIANT DETAIL (to get productItems)
    const { data: variantDetailResp, isLoading: isLoadingVariant } = useComboDetailQuery(
        selectedVariantId || "",
        !!selectedVariantId
    );

    const variantDetail = variantDetailResp as unknown as Combo | undefined;

    // Sync Breadcrumbs
    useEffect(() => {
        if (combo) {
            setBreadcrumb([
                { label: 'Home', href: '/' },
                { label: 'Combos', href: '/combos' },
                { label: combo.name, active: true },
            ]);
        }
        return () => setBreadcrumb([]);
    }, [combo, setBreadcrumb]);

    // Derive active variant
    const activeCombo = useMemo(() => {
        if (!combo) return null;
        const childCombos = combo.childCombos || [];

        // Base variant info
        let base: Combo | null = null;
        if (userSelectedVariantId) {
            if (userSelectedVariantId === combo.id) base = combo;
            else base = childCombos.find(c => c.id === userSelectedVariantId) || null;
        } else {
            base = childCombos.length > 0 ? childCombos[0] : combo;
        }

        // Merge with fetched detail (items, productItems, etc.)
        if (variantDetail && base && variantDetail.id === base.id) {
            return {
                ...base,
                ...variantDetail,
                // Ensure we prefer names/descriptions from the rich detail if available
                items: variantDetail.items || base.items,
                productItems: variantDetail.productItems || base.productItems
            } as Combo;
        }

        return base as Combo;
    }, [combo, userSelectedVariantId, variantDetail]);



    const handleAddToCart = useCallback(() => {
        if (!combo) return;

        // Strict Business Rule: If the selection doesn't result in a valid combo variant, block
        if (!activeCombo) {
            toast.error("The selected combination is not available for this bundle.");
            return;
        }

        // Check stock
        if (activeCombo.stock !== undefined && activeCombo.stock === 0) {
            toast.error("This selection is currently out of stock.");
            return;
        }

        addItem({
            id: activeCombo.id,
            productId: activeCombo.id, // Compatibility with cart store expectation
            productVariantId: null, // Combos are treated as unique IDs in our store
            comboId: activeCombo.id,
            name: combo.name + (activeCombo.id !== combo.id ? ` - (${activeCombo.color} / ${activeCombo.size})` : ""),
            price: activeCombo.salePrice,
            image: activeCombo.imageUrl || combo.imageUrl,
            quantity: quantity,
            color: activeCombo.color,
            size: activeCombo.size,
            sku: activeCombo.sku,
            isCustom: false
        });
    }, [activeCombo, combo, quantity, addItem]);

    const toggleWishlist = () => {
        setIsWishlisted(prev => !prev);
        if (!isWishlisted) toast.success("Added to wishlist!");
    };

    // ─────────────────────────────────────────────────────────────
    // NEW: FETCH DATA FOR INDIVIDUAL PRODUCT VARIANTS IN COMBO
    // ─────────────────────────────────────────────────────────────
    const productVariantIds = useMemo(() => {
        return activeCombo?.productItems?.map(i => i.productVariantId).filter(Boolean) as string[] || [];
    }, [activeCombo]);

    const variantQueries = useQueries({
        queries: productVariantIds.map(id => ({
            queryKey: ['variants', id],
            queryFn: () => variantService.getById(id),
            staleTime: 5 * 60 * 1000,
        }))
    });

    const isAnyVariantLoading = variantQueries.some(q => q.isLoading);

    const enrichedItems = useMemo(() => {
        if (!activeCombo?.productItems) return [];
        return activeCombo.productItems.map((item) => {
            // Find query by variantId to be safer (ids are unique)
            const query = variantQueries.find(q => q.data?.id === item.productVariantId);
            return {
                ...item,
                enrichedDetail: query?.data || null
            };
        });
    }, [activeCombo, variantQueries]);

    // SMART IMAGE FALLBACK: If combo has no image, use the first component's image if available
    const displayImage = useMemo(() => {
        if (activeCombo?.imageUrl) return activeCombo.imageUrl;
        if (combo?.imageUrl) return combo.imageUrl;

        // Find first item with an image in enriched metadata
        const firstWithImage = enrichedItems.find(i => i.imageUrl || i.enrichedDetail?.attributes?.imageUrl);
        return firstWithImage?.imageUrl || (firstWithImage?.enrichedDetail?.attributes?.imageUrl as string) || null;
    }, [activeCombo, combo, enrichedItems]);

    const totalIndividualPrice = useMemo(() => {
        if (!enrichedItems || enrichedItems.length === 0) return 0;
        return enrichedItems.reduce((acc, item) => {
            const price = item.enrichedDetail?.salePrice || item.salePrice || 0;
            return acc + (price * item.quantity);
        }, 0);
    }, [enrichedItems]);

    const totalBundleSavings = useMemo(() => {
        if (!totalIndividualPrice || !activeCombo?.salePrice) return 0;
        return Math.max(0, totalIndividualPrice - activeCombo.salePrice);
    }, [totalIndividualPrice, activeCombo]);

    return {
        combo,
        displayImage,
        isLoading: isLoading || (!!selectedVariantId && isLoadingVariant && !activeCombo?.items?.length),
        isLoadingVariant: isLoadingVariant || isAnyVariantLoading,
        isError,
        activeCombo: activeCombo as Combo | null,
        enrichedItems,
        totalIndividualPrice,
        totalBundleSavings,
        selectedVariantId,
        quantity,
        isWishlisted,
        setQuantity,
        setUserSelectedVariantId,
        handleAddToCart,
        toggleWishlist
    };
}
