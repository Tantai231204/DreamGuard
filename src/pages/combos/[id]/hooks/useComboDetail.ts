import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useComboDetail as useComboDetailQuery } from "@/hooks/queries/useCombo";
import { useCart } from "@/store/useCart";
import { useBreadcrumb } from "@/components/common/BreadcrumbNav";
import { toast } from "sonner";
import type { Combo } from "../../types";

export function useComboDetail() {
    const { id } = useParams<{ id: string }>();
    const { addItem } = useCart();
    const { data: comboResponse, isLoading, isError } = useComboDetailQuery(id || "");
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
        const defaultVariantId = childCombos.length > 0 ? childCombos[0].id : null;
        const currentId = userSelectedVariantId || defaultVariantId;

        if (!currentId || currentId === combo.id) return combo;
        return childCombos.find(c => c.id === currentId) || combo;
    }, [combo, userSelectedVariantId]);

    const selectedVariantId = userSelectedVariantId || (combo?.childCombos && combo.childCombos.length > 0 ? combo.childCombos[0].id : null);

    const handleAddToCart = () => {
        if (!activeCombo || !combo) return;

        addItem({
            id: activeCombo.id,
            comboId: activeCombo.id,
            name: combo.name + (activeCombo.id !== combo.id ? ` - ${activeCombo.name}` : ""),
            price: activeCombo.salePrice,
            image: activeCombo.imageUrl || combo.imageUrl,
            quantity: quantity,
            color: activeCombo.color,
            size: activeCombo.size,
            sku: activeCombo.sku
        });

        toast.success("Added bundle to your bag!");
    };

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
