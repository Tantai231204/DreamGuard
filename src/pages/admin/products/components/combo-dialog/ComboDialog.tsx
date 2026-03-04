/**
 * ComboDialog — Main dialog shell (2-column layout)
 *
 * Thin orchestrator that composes:
 *  - ComboModeSelector  (mode picker, create only)
 *  - ComboDialogHeader  (header bar)
 *  - ComboFormFields    (left panel)
 *  - ComboItemsPanel    (right panel, variant mode only)
 *  - ComboDialogFooter  (footer with validation + actions)
 *  - useComboForm       (all state & logic)
 */

import { useState } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CreateComboRequest } from "@/api/services/comboService";
import type { Combo } from "../../types";
import type { ComboDialogMode } from "./index";
import { useComboForm } from "./useComboForm";
import ComboModeSelector from "./ComboModeSelector";
import ComboDialogHeader from "./ComboDialogHeader";
import ComboDialogFooter from "./ComboDialogFooter";
import ComboFormFields from "./ComboFormFields";
import ComboItemsPanel from "./ComboItemsPanel";

// ── Props ────────────────────────────────────────────────
interface ComboDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    combo?: Combo | null;
    /** Pre-set mode; if omitted the user picks on create */
    initialMode?: ComboDialogMode;
    /** Pre-fill the parent combo selector (used by "Add Variant" action) */
    defaultParentId?: string;
    onSubmit: (data: CreateComboRequest) => void | Promise<void>;
    isLoading?: boolean;
}

// ── Component ────────────────────────────────────────────
export default function ComboDialog({
    open,
    onOpenChange,
    combo,
    initialMode,
    defaultParentId,
    onSubmit,
    isLoading = false,
}: ComboDialogProps) {
    const isEdit = !!combo;

    // Mode: when editing, infer from combo data; when creating, user chooses or uses initialMode
    const inferredMode: ComboDialogMode | null = isEdit
        ? (combo.comboParentId ? 'variant' : 'parent')
        : (initialMode ?? null);

    const [mode, setMode] = useState<ComboDialogMode | null>(inferredMode);

    // All form state & logic lives in the custom hook
    const {
        form,
        isValid,
        variantOptions,
        isLoadingVariants,
        comboParents,
        isLoadingParents,
        setField,
        handleNameChange,
        handleItemsChange,
        handleSubmit,
    } = useComboForm({ open, combo, mode, defaultParentId, onSubmit });

    // ── Mode selection screen (create only) ──────────────
    if (!isEdit && mode === null) {
        return (
            <ComboModeSelector
                open={open}
                onOpenChange={onOpenChange}
                onSelectMode={setMode}
            />
        );
    }

    // Parent mode → narrower dialog (no right panel)
    const dialogWidth = mode === 'parent' ? 'max-w-[560px]' : 'max-w-6xl'; // max-w-6xl = 1152px

    // ── Render ───────────────────────────────────────────
    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={cn(dialogWidth, "w-full h-[88vh] rounded-2xl p-0 gap-0 overflow-hidden flex flex-col")}>
                    {/* ── Header ── */}
                    <ComboDialogHeader mode={mode!} isEdit={isEdit} />

                    {/* ── Body ── */}
                    <div className="flex flex-1 min-h-0">
                        {/* LEFT: Form fields */}
                        <form
                            id="combo-form"
                            onSubmit={handleSubmit}
                            className={cn(
                                "shrink-0 border-r border-slate-100 overflow-y-auto",
                                mode === 'parent' ? 'w-full' : 'w-[45%]',
                            )}
                        >
                            <ComboFormFields
                                form={form}
                                setField={setField}
                                onNameChange={handleNameChange}
                                isLoading={isLoading}
                                mode={mode ?? 'parent'}
                                comboParents={comboParents}
                                isLoadingParents={isLoadingParents}
                            />
                        </form>

                        {/* RIGHT: Combo items panel (variant mode only) */}
                        {mode === 'variant' && (
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
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <ComboDialogFooter
                        form={form}
                        mode={mode!}
                        isEdit={isEdit}
                        isLoading={isLoading}
                        isValid={isValid}
                        onBack={() => setMode(null)}
                        onCancel={() => onOpenChange(false)}
                    />
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
