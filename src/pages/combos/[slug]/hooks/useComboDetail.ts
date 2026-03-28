import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useComboBySlug } from "@/hooks/queries/useCombo";
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

    // Cast response to our UI Combo type
    const combo = comboResponse as unknown as Combo | undefined;

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
        
        // If the user has picked something, look for it
        if (userSelectedVariantId) {
            if (userSelectedVariantId === combo.id) return combo;
            return childCombos.find(c => c.id === userSelectedVariantId) || null;
        }

        // Default logic: pick first child if available, otherwise parent
        return childCombos.length > 0 ? childCombos[0] : combo;
    }, [combo, userSelectedVariantId]);

    const selectedVariantId = useMemo(() => {
        if (userSelectedVariantId) return userSelectedVariantId;
        if (combo?.childCombos && combo.childCombos.length > 0) return combo.childCombos[0].id;
        return combo?.id || null;
    }, [combo, userSelectedVariantId]);

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

    return {
        combo,
        isLoading,
        isError,
        activeCombo: activeCombo as Combo | null,
        selectedVariantId,
        quantity,
        isWishlisted,
        setQuantity,
        setUserSelectedVariantId,
        handleAddToCart,
        toggleWishlist
    };
}
