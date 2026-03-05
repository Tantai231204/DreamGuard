/**
 * useComboForm — Custom hook encapsulating all combo dialog state & logic
 *
 * Handles:
 *  - Form reducer (name, slug, items, etc.)
 *  - Data fetching (variant options, combo parents, all combos)
 *  - Auto-name generation for variants: "<parent name> #N"
 *  - Item enrichment from live variant data
 *  - Field setters, name change, items change, submission
 *  - Validation, keyboard shortcut
 */

import { useCallback, useReducer, useEffect, useRef } from "react";
import { useAllVariantOptions } from "@/hooks/queries/useProduct";
import { useComboParents, useCombos, useComboDetail } from "@/hooks/queries/useCombo";
import type { CreateComboRequest } from "@/api/services/comboService";
import type { Combo } from "../../types";
import {
    formReducer,
    getInitialState,
    toSlug,
    type ComboDialogMode,
    type ComboFormState,
    type ComboItemEntry,
} from "./index";

// ── Hook Props ───────────────────────────────────────────
interface UseComboFormOptions {
    open: boolean;
    combo?: Combo | null;
    mode: ComboDialogMode | null;
    defaultParentId?: string;
    onSubmit: (data: CreateComboRequest) => void | Promise<void>;
}

// ── Hook ─────────────────────────────────────────────────
export function useComboForm({
    open,
    combo,
    mode,
    defaultParentId,
    onSubmit,
}: UseComboFormOptions) {
    const isEdit = !!combo;

    // ── Form state ───────────────────────────────────────
    const initial = getInitialState(combo);
    if (defaultParentId && !initial.comboParentId) {
        initial.comboParentId = defaultParentId;
    }
    const [form, dispatch] = useReducer(formReducer, initial);

    // ── Data fetching ────────────────────────────────────
    const isVariantMode = mode === 'variant';
    const { data: variantOptions = [], isLoading: isLoadingVariants } =
        useAllVariantOptions(open && isVariantMode);
    const { data: comboParents = [], isLoading: isLoadingParents } =
        useComboParents(open && isVariantMode);
    // Fetch ALL combos to find parent name + count existing variants
    const { data: allCombos = [] } = useCombos(open && isVariantMode);

    // Fetch full detail to ensure we have description, etc.
    const { data: detail, isLoading: isLoadingDetail } = useComboDetail(
        combo?.id ?? "",
        open && isEdit
    );

    // Sync form when detail is loaded
    useEffect(() => {
        if (detail && isEdit) {
            dispatch({ type: "RESET", payload: getInitialState(detail as any) });
        }
    }, [detail, isEdit]);

    // ── Auto-generate variant name ───────────────────────
    const autoNameAppliedRef = useRef<string | null>(null);
    useEffect(() => {
        if (isEdit || mode !== 'variant') return;
        const parentId = form.comboParentId;
        if (!parentId) return;
        // Only auto-generate once per parentId change
        if (autoNameAppliedRef.current === parentId) return;
        // Wait until allCombos is loaded
        if (allCombos.length === 0) return;

        // Find parent from allCombos (contains both parents and variants)
        const parent = allCombos.find(c => c.id === parentId);
        if (!parent) return;

        // Count existing variants for this parent
        // Use parent.childCombos.length if nested, fallback to flat filter
        const existingVariantCount = parent.childCombos?.length ?? allCombos.filter(
            c => c.comboParentId === parentId
        ).length;
        const nextNumber = existingVariantCount + 1;

        const generatedName = `${parent.name} #${nextNumber}`;
        autoNameAppliedRef.current = parentId;
        dispatch({ type: 'SET_FIELD', field: 'name', payload: generatedName });
        dispatch({ type: 'SET_FIELD', field: 'slug', payload: toSlug(generatedName) });
    }, [isEdit, mode, form.comboParentId, allCombos]);

    // ── Enrich existing items with live variant data ─────
    const enrichedRef = useRef(false);
    useEffect(() => {
        if (!open || enrichedRef.current || variantOptions.length === 0) return;
        if (form.items.length === 0) return;

        let changed = false;
        const enriched = form.items.map((item) => {
            if (!item.productVariantId) return item;
            const opt =
                variantOptions.find((v) => v.variantId === item.productVariantId) ??
                variantOptions.find((v) => v.productId === item.productVariantId);
            if (!opt) return item;
            if (item.salePrice > 0 && item.color !== undefined) return item;
            changed = true;
            return {
                ...item,
                productVariantId: opt.variantId,
                label: opt.label,
                productName: opt.productName,
                sku: opt.sku,
                color: opt.color,
                size: opt.size,
                salePrice: opt.salePrice,
                basePrice: opt.basePrice,
            };
        });

        enrichedRef.current = true;
        if (changed) {
            dispatch({ type: "SET_ITEMS", payload: enriched });
        }
    }, [open, variantOptions, form.items]);

    // ── Field setters ────────────────────────────────────
    const setField = useCallback(
        (field: keyof Omit<ComboFormState, "items">, value: string) =>
            dispatch({ type: "SET_FIELD", field, payload: value }),
        [],
    );

    const handleNameChange = useCallback(
        (value: string) => {
            setField("name", value);
            setField("slug", toSlug(value));
        },
        [setField],
    );

    const handleItemsChange = useCallback(
        (items: ComboItemEntry[]) => dispatch({ type: "SET_ITEMS", payload: items }),
        [],
    );

    // ── Submission ───────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'parent') {
            if (!form.name.trim() || !form.slug.trim()) return;
            onSubmit({
                name: form.name.trim(),
                slug: form.slug.trim(),
                ageGroup: form.ageGroup ? Number(form.ageGroup) : 0,
                color: '',
                size: '',
                basePrice: Number(form.basePrice) || 0,
                salePrice: Number(form.salePrice) || 0,
                description: form.description.trim(),
                imageUrl: form.imageUrl.trim(),
                imagePublicId: form.imagePublicId.trim(),
                comboParentId: undefined,
                status: form.status,
                items: [],
            });
        } else {
            const validItems = form.items.filter((i) => i.productVariantId);
            if (validItems.length === 0) return;
            if (!form.comboParentId) return;

            let finalName = form.name.trim();
            let finalSlug = form.slug.trim();

            // Fallback if empty
            if (!finalName || !finalSlug) {
                const parent = allCombos.find(c => c.id === form.comboParentId);
                const existingVariantCount = parent?.childCombos?.length ?? allCombos.filter(
                    c => c.comboParentId === form.comboParentId
                ).length;
                const nextNumber = existingVariantCount + 1;

                if (!finalName) finalName = parent ? `${parent.name} #${nextNumber}` : `Variant #${nextNumber}`;
                if (!finalSlug) finalSlug = toSlug(finalName);
            }

            onSubmit({
                name: finalName,
                slug: finalSlug,
                ageGroup: form.ageGroup ? Number(form.ageGroup) : 0,
                color: form.color,
                size: form.size,
                basePrice: Number(form.basePrice) || 0,
                salePrice: Number(form.salePrice) || 0,
                description: form.description.trim(),
                imageUrl: form.imageUrl.trim(),
                imagePublicId: form.imagePublicId.trim(),
                comboParentId: form.comboParentId.trim() || undefined,
                status: form.status,
                items: validItems.map((i) => ({
                    productVariantId: i.productVariantId,
                    quantity: i.quantity,
                })),
            });
        }
    };

    // ── Cmd/Ctrl + Enter shortcut ────────────────────────
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                document.getElementById("combo-submit")?.click();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    // ── Validation ───────────────────────────────────────
    const isValid = mode === 'parent'
        ? form.name.trim() !== "" && form.slug.trim() !== ""
        : form.comboParentId.trim() !== "" &&
        form.items.some((i) => i.productVariantId);

    return {
        form,
        isEdit,
        isValid,
        // Data
        variantOptions,
        isLoadingVariants,
        comboParents,
        isLoadingParents,
        isLoadingDetail,
        // Handlers
        setField,
        handleNameChange,
        handleItemsChange,
        handleSubmit,
    };
}
