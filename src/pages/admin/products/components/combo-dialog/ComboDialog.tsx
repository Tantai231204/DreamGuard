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

import { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Loader2, Info, Settings2, DollarSign } from "lucide-react";
import type { CreateComboRequest } from "@/api/services/comboService";
import type { Combo } from "../../types";
import type { ComboDialogMode } from "./index";
import { useComboForm } from "./useComboForm";
import ComboModeSelector from "./ComboModeSelector";
import ComboDialogHeader from "./ComboDialogHeader";
import ComboDialogFooter from "./ComboDialogFooter";
import ComboFormFields from "./ComboFormFields";
import ComboItemsPanel from "./ComboItemsPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const [activeTab, setActiveTab] = useState("general");

    // Ensure mode state keeps in sync with inferredMode when combo/open changes
    useEffect(() => {
        if (open) {
            setMode(inferredMode);
            setActiveTab("general");
        }
    }, [open, inferredMode]);

    // All form state & logic lives in the custom hook
    const {
        form,
        isValid,
        isPriceAutoManaged,
        isVariantBasePriceAuto,
        priceSource,
        variantOptions,
        isLoadingVariants,
        comboParents,
        isLoadingParents,
        isLoadingDetail,
        setField,
        handleNameChange,
        handleItemsChange,
        handleSubmit,
    } = useComboForm({ open, combo, mode, defaultParentId, onSubmit });

    // Calculate Completion Score
    const completionScore = useMemo(() => {
        let score = 0;
        if (form.name.trim()) score += 20;
        if (form.description.trim()) score += 20;
        if (mode === 'variant' ? form.comboParentId : true) score += 20;
        if (form.basePrice) score += 20;
        if (form.imageUrl) score += 20;
        return score;
    }, [form, mode]);

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
                    <ComboDialogHeader mode={mode!} isEdit={isEdit} completionScore={completionScore} />

                    {/* ── Body ── */}
                    <div className="flex flex-1 min-h-0 relative">
                        {isLoadingDetail && (
                            <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                                    <p className="text-sm font-bold text-gray-500 animate-pulse tracking-wide italic">Fetching detail...</p>
                                </div>
                            </div>
                        )}
                        {/* LEFT: Form fields with Tabs */}
                        <div className={cn(
                            "shrink-0 border-r border-slate-100 flex flex-col min-h-0 bg-slate-50/30",
                            mode === 'parent' ? 'w-full' : 'w-[45%]',
                        )}>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
                                <div className="px-5 pt-4 pb-0 bg-white border-b border-slate-100 flex-shrink-0">
                                    <TabsList className="grid grid-cols-3 w-full h-11 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 mb-3">
                                        <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-sm text-[11px] font-black uppercase tracking-wider gap-2">
                                            <Info className="h-3.5 w-3.5" /> General
                                        </TabsTrigger>
                                        <TabsTrigger value="config" className="rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-sm text-[11px] font-black uppercase tracking-wider gap-2">
                                            <Settings2 className="h-3.5 w-3.5" /> Config
                                        </TabsTrigger>
                                        <TabsTrigger value="pricing" className="rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-sm text-[11px] font-black uppercase tracking-wider gap-2">
                                            <DollarSign className="h-3.5 w-3.5" /> Price
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <form
                                    id="combo-form"
                                    onSubmit={handleSubmit}
                                    className="flex-1 overflow-y-auto"
                                >
                                    <ComboFormFields
                                        form={form}
                                        setField={setField}
                                        onNameChange={handleNameChange}
                                        isLoading={isLoading || isLoadingDetail}
                                        mode={mode ?? 'parent'}
                                        comboParents={comboParents}
                                        isLoadingParents={isLoadingParents}
                                        comboId={combo?.id}
                                        isPriceAutoManaged={isPriceAutoManaged}
                                        isVariantBasePriceAuto={isVariantBasePriceAuto}
                                        priceSource={priceSource}
                                    />
                                </form>
                            </Tabs>
                        </div>

                        {/* RIGHT: Combo items panel (variant mode only) */}
                        {mode === 'variant' && (
                            <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-white">
                                <ComboItemsPanel
                                    items={form.items}
                                    onChange={handleItemsChange}
                                    variantOptions={variantOptions}
                                    isLoadingVariants={isLoadingVariants}
                                    disabled={isLoading || isLoadingDetail}
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
                        isLoading={isLoading || isLoadingDetail}
                        isValid={isValid}
                        onBack={() => setMode(null)}
                        onCancel={() => onOpenChange(false)}
                    />
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
