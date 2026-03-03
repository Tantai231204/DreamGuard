/**
 * ComboDialog — Main dialog shell (2-column layout)
 *
 * Composes:
 *  - ComboFormFields  (left panel)
 *  - ComboItemsPanel  (right panel)
 *
 * Owns form state (useReducer) and submission logic.
 */

import { useCallback, useReducer, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Layers, Loader2, Check, Info, AlertCircle } from "lucide-react";
import { useAllVariantOptions } from "@/hooks/queries/useProduct";
import type { CreateComboRequest } from "@/api/services/comboService";
import type { Combo } from "../../types";
import {
    formReducer,
    getInitialState,
    toSlug,
    type ComboFormState,
    type ComboItemEntry,
} from "./index";
import ComboFormFields from "./ComboFormFields";
import ComboItemsPanel from "./ComboItemsPanel";

// ── Props ────────────────────────────────────────────────
interface ComboDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    combo?: Combo | null;
    onSubmit: (data: CreateComboRequest) => void | Promise<void>;
    isLoading?: boolean;
}

// ── Component ────────────────────────────────────────────
export default function ComboDialog({
    open,
    onOpenChange,
    combo,
    onSubmit,
    isLoading = false,
}: ComboDialogProps) {
    const isEdit = !!combo;
    const [form, dispatch] = useReducer(formReducer, getInitialState(combo));
    const { data: variantOptions = [], isLoading: isLoadingVariants } =
        useAllVariantOptions(open);

    // Track whether items have been enriched in this dialog session
    const enrichedRef = useRef(false);

    // ── Reset form when dialog opens or combo changes ────
    useEffect(() => {
        if (open) {
            enrichedRef.current = false;
            dispatch({ type: "RESET", payload: getInitialState(combo) });
        }
    }, [open, combo]);

    // ── Enrich existing items with live variant data ─────
    // When editing a combo, items from the API only have IDs + productName.
    // Once variantOptions load, fill in price, color, size, real name, etc.
    useEffect(() => {
        if (!open || enrichedRef.current || variantOptions.length === 0) return;
        if (form.items.length === 0) return;

        let changed = false;
        const enriched = form.items.map((item) => {
            if (!item.productVariantId) return item;
            // Match by variantId first, then fall back to productId
            const opt =
                variantOptions.find((v) => v.variantId === item.productVariantId) ??
                variantOptions.find((v) => v.productId === item.productVariantId);
            if (!opt) return item;
            // Already enriched (has real price data)?
            if (item.salePrice > 0 && item.color !== undefined) return item;
            changed = true;
            return {
                ...item,
                // If matched by productId, fix the ID to the actual variantId
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
            if (!isEdit) setField("slug", toSlug(value));
        },
        [isEdit, setField],
    );

    const handleItemsChange = useCallback(
        (items: ComboItemEntry[]) => dispatch({ type: "SET_ITEMS", payload: items }),
        [],
    );

    // ── Submission ───────────────────────────────────────
    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!form.name.trim() || !form.slug.trim()) return;
            const validItems = form.items.filter((i) => i.productVariantId);
            if (validItems.length === 0) return;

            onSubmit({
                name: form.name.trim(),
                slug: form.slug.trim(),
                ageGroup: form.ageGroup ? Number(form.ageGroup) : 0,
                color: form.color,
                size: form.size,
                basePrice: Number(form.basePrice) || 0,
                salePrice: Number(form.salePrice) || 0,
                description: form.description.trim(),
                imageUrl: form.imageUrl.trim(),
                imagePublicId: form.imagePublicId.trim(),
                comboParentId: form.comboParentId.trim() || undefined,
                items: validItems.map((i) => ({
                    productVariantId: i.productVariantId,
                    quantity: i.quantity,
                })),
            });
        },
        [form, onSubmit],
    );

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

    const isValid =
        form.name.trim() !== "" &&
        form.slug.trim() !== "" &&
        form.items.some((i) => i.productVariantId);

    // ── Render ───────────────────────────────────────────
    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-[1080px] w-full h-[85vh] rounded-2xl p-0 gap-0 overflow-hidden flex flex-col">
                    {/* ── Header ── */}
                    <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/25 shrink-0">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                {isEdit ? "Edit Combo" : "Create New Combo"}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-400 mt-0.5">
                                {isEdit
                                    ? "Update combo details and items"
                                    : "Fill in the details, then add product variants on the right"}
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 text-[11px] font-medium text-gray-500">
                                ⌘ Enter
                            </kbd>
                            <span className="text-[11px] text-gray-400">to save</span>
                        </div>
                    </div>

                    {/* ── 2-column body ── */}
                    <div className="flex flex-1 min-h-0">
                        {/* LEFT: Form fields */}
                        <form
                            id="combo-form"
                            onSubmit={handleSubmit}
                            className="w-[420px] shrink-0 border-r border-gray-100 overflow-y-auto"
                        >
                            <ComboFormFields
                                form={form}
                                setField={setField}
                                onNameChange={handleNameChange}
                                isLoading={isLoading}
                            />
                        </form>

                        {/* RIGHT: Combo items panel */}
                        <div className="flex-1 min-w-0 flex flex-col min-h-0">
                            <ComboItemsPanel
                                items={form.items}
                                onChange={handleItemsChange}
                                variantOptions={variantOptions}
                                isLoadingVariants={isLoadingVariants}
                                disabled={isLoading}
                                comboPriceOverride={Number(form.salePrice) || undefined}
                            />
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                        {/* Validation hints */}
                        <div className="flex-1 flex items-center gap-2">
                            {!form.name.trim() && (
                                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                    <Info className="h-3 w-3" /> Name required
                                </span>
                            )}
                            {form.name.trim() &&
                                !form.items.some((i) => i.productVariantId) && (
                                    <span className="text-[11px] text-orange-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> Add at least 1 variant
                                    </span>
                                )}
                            {isValid && (
                                <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Ready to{" "}
                                    {isEdit ? "save" : "create"}
                                </span>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="h-10 px-5 rounded-lg border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium text-sm transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            id="combo-submit"
                            type="submit"
                            form="combo-form"
                            disabled={isLoading || !isValid}
                            className={cn(
                                "h-10 px-6 rounded-lg font-semibold text-sm transition-all",
                                "bg-gradient-to-r from-violet-600 to-indigo-600",
                                "hover:from-violet-700 hover:to-indigo-700",
                                "shadow-md shadow-violet-500/20 hover:shadow-violet-500/35",
                                "disabled:opacity-50 disabled:shadow-none",
                            )}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? "Save Changes" : "Create Combo"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
