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
import { toast } from "sonner";
import { useAllVariantOptions } from "@/hooks/queries/useProduct";
import { useComboParents, useCombos, useComboDetail } from "@/hooks/queries/useCombo";
import type { CreateComboRequest } from "@/api/services/comboService";
import type { Combo } from "../../types";
import {
    formReducer,
    getInitialState,
    normalizeStatus,
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

    // ── Local refs for sync control (Compiler-safe patterns) ──
    const syncedParentRef = useRef<string | null>(null);
    const enrichedRef = useRef(false);


    // ── Data fetching ────────────────────────────────────
    const isVariantMode = mode === 'variant';
    const { data: variantOptions = [], isLoading: isLoadingVariants } =
        useAllVariantOptions(open && isVariantMode);
    const { data: comboParents = [], isLoading: isLoadingParents } =
        useComboParents(open && isVariantMode);
    // Fetch ALL combos to find parent name + count existing variants + price calculation
    const { data: allCombos = [] } = useCombos(open);

    // Fetch full detail to ensure we have description, etc.
    const { data: detail, isLoading: isLoadingDetail } = useComboDetail(
        combo?.id ?? "",
        open && isEdit
    );

    // Sync form when detail is loaded
    // IMPORTANT: The detail endpoint is PUBLIC (/combo/{id}) and may NOT return
    // the correct `status` for Draft/Hidden combos. The original `combo` prop
    // comes from the ADMIN list (/combo/admin) which always has the correct status.
    // We merge detail data but preserve the authoritative status from the admin list.
    useEffect(() => {
        if (detail && isEdit) {
            const state = getInitialState(detail);

            // Preserve the status from the original combo prop (admin list data)
            // because the public detail endpoint may not return status correctly.
            if (combo?.status) {
                state.status = normalizeStatus(combo.status);
            }

            dispatch({ type: "RESET", payload: state });
            // Allow re-enrichment when new data arrives
            enrichedRef.current = false;
        }
    }, [detail, isEdit, combo]);

    // ── Auto-generate variant name & Sync Age Group ─────
    useEffect(() => {
        if (!open) {
            syncedParentRef.current = null;
            return;
        }
        if (isEdit || mode !== 'variant') return;

        const parentId = form.comboParentId;
        if (!parentId || syncedParentRef.current === parentId || allCombos.length === 0) return;

        const parent = allCombos.find(c => c.id === parentId);
        if (!parent) return;

        // 1. Sync Age Group
        if (parent.ageGroup && String(parent.ageGroup) !== form.ageGroup) {
            dispatch({ type: 'SET_FIELD', field: 'ageGroup', payload: String(parent.ageGroup) });
        }

        // 2. Auto-generate Name
        const existingVariantCount = parent.childCombos?.length ?? allCombos.filter(
            c => c.comboParentId === parentId
        ).length;
        const nextNumber = existingVariantCount + 1;
        const generatedName = `${parent.name} #${nextNumber}`;

        syncedParentRef.current = parentId;
        dispatch({ type: 'SET_FIELD', field: 'name', payload: generatedName });
        dispatch({ type: 'SET_FIELD', field: 'slug', payload: toSlug(generatedName) });

        // 3. Auto-select Color/Size from first sibling
        if (parent.childCombos?.[0]) {
            const first = parent.childCombos[0];
            if (first.color && !form.color) dispatch({ type: 'SET_FIELD', field: 'color', payload: first.color });
            if (first.size && !form.size) dispatch({ type: 'SET_FIELD', field: 'size', payload: first.size });
        } else {
            // Sensible defaults if first child
            if (!form.color) dispatch({ type: 'SET_FIELD', field: 'color', payload: '#f5f5f5' });
            if (!form.size) dispatch({ type: 'SET_FIELD', field: 'size', payload: 'Standard' });
        }
    }, [isEdit, mode, form.comboParentId, allCombos, form.ageGroup, open, form.color, form.size]);

    // ── Enrich existing items with live variant data ─────
    useEffect(() => {
        if (!open) {
            enrichedRef.current = false;
            return;
        }
        if (enrichedRef.current || variantOptions.length === 0 || form.items.length === 0) return;

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

        if (changed) {
            enrichedRef.current = true;
            dispatch({ type: "SET_ITEMS", payload: enriched });
        }
    }, [open, variantOptions, form.items]);


    // ── Auto-calculate Prices & Price Change Notification ──
    const lastCalculatedBaseRef = useRef<number | null>(null);

    useEffect(() => {
        if (!open) {
            lastCalculatedBaseRef.current = null;
            return;
        }

        if (mode === 'parent' && isEdit && combo) {
            // Parent mode: Derive from children (if any)
            const children = allCombos.filter(c => c.comboParentId === combo.id);
            if (children.length > 0) {
                const minBase = Math.min(...children.map(c => c.basePrice));
                const minSale = Math.min(...children.map(c => c.salePrice));

                if (Number(form.basePrice) !== minBase) {
                    dispatch({ type: "SET_FIELD", field: "basePrice", payload: String(minBase) });
                }
                if (Number(form.salePrice) !== minSale) {
                    dispatch({ type: "SET_FIELD", field: "salePrice", payload: String(minSale) });
                }
            }
        } else if (mode === 'variant') {
            // Variant mode: basePrice = sum of items
            const calculatedBase = form.items.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);

            // Detection logic for item changes that affect pricing
            const prevBase = lastCalculatedBaseRef.current;

            if (calculatedBase > 0 && Number(form.basePrice) !== calculatedBase) {
                dispatch({ type: "SET_FIELD", field: "basePrice", payload: String(calculatedBase) });

                // Only show toast if it's a change after initial load/sync
                if (prevBase !== null && prevBase !== calculatedBase) {
                    toast.info("Pricing changed!", {
                        description: "Item quantities updated. Please remember to re-adjust your Selling Price (Sale Price) to maintain desired profit/discount.",
                        duration: 5000,
                        action: {
                            label: "Update Price",
                            onClick: () => {
                                document.querySelector<HTMLButtonElement>('button[value="pricing"]')?.click();
                                setTimeout(() => document.getElementById('c-sale')?.focus(), 300);
                            }
                        }
                    });
                }
            }

            lastCalculatedBaseRef.current = calculatedBase;
        }
    }, [open, mode, form.items, allCombos, isEdit, combo, form.basePrice, form.salePrice]);

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

        const basePrice = Number(form.basePrice) || 0;
        const salePrice = Number(form.salePrice) || 0;
        const targetParentId = form.comboParentId?.trim();
        const isChild = !!targetParentId;

        // ── Schema-Based Business Rules Validation ──
        if (form.status === 'Published') {
            // Rule 1: Age Group is mandatory for management
            if (!form.ageGroup || form.ageGroup === '0') {
                toast.error("Age Group Required", { description: "You must specify an age group for published combos." });
                return;
            }

            // Rule 2: Sale price must be valid
            if (salePrice <= 0) {
                toast.error("Invalid Price", { description: "Published combos must have a selling price greater than 0." });
                return;
            }

            // Rule 3: Parent shell cannot be published without children (nothing to purchase)
            if (!isChild) {
                const children = allCombos.filter(c => c.comboParentId === combo?.id);
                if (children.length === 0) {
                    toast.error("Variant Required", { description: "You cannot publish a master combo that has no buyable variants." });
                    return;
                }
            }
        }

        // ── Construct Request Payload ──
        const validItems = form.items.filter((i) => i.productVariantId);

        let finalName = form.name.trim();
        let finalSlug = form.slug.trim();

        // Auto-generation fallback logic
        if (!finalName || !finalSlug) {
            if (isChild) {
                const parent = allCombos.find(c => c.id === targetParentId);
                const count = parent?.childCombos?.length ?? allCombos.filter(c => c.comboParentId === targetParentId).length;
                if (!finalName) finalName = parent ? `${parent.name} #${count + 1}` : `Variant #${count + 1}`;
                if (!finalSlug) finalSlug = toSlug(finalName);
            }
        }

        if (!finalName) return; // Final guard

        onSubmit({
            name: finalName,
            slug: finalSlug,
            ageGroup: Number(form.ageGroup) || 0,
            color: isChild ? form.color : '',
            size: isChild ? form.size : '',
            basePrice,
            salePrice,
            description: form.description.trim(),
            imageUrl: form.imageUrl.trim(),
            imagePublicId: form.imagePublicId.trim(),
            comboParentId: isChild ? targetParentId : undefined,
            status: form.status,
            items: isChild ? validItems.map((i) => ({
                productVariantId: i.productVariantId,
                quantity: i.quantity,
            })) : [],
        });
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

    // ── Validation (Pure Schema Based) ───────────────────
    const isChildMode = !!form.comboParentId;
    const isValid = isChildMode
        ? form.comboParentId.trim() !== "" && form.items.some((i) => i.productVariantId)
        : form.name.trim() !== "" && form.slug.trim() !== "";

    // Derived flags for UI behavior
    const isPriceAutoManaged = !form.comboParentId; // Parent prices managed by children
    const isVariantBasePriceAuto = !!form.comboParentId && form.items.length > 0;

    const priceSource = (isChildMode ? 'items' : 'children') as 'items' | 'children';

    return {
        form,
        isEdit,
        isValid,
        isPriceAutoManaged,
        isVariantBasePriceAuto,
        priceSource,
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
