/**
 * ComboDialogFooter — Footer bar with validation hints + action buttons
 */

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Check, Info, AlertCircle } from "lucide-react";
import type { ComboDialogMode, ComboFormState } from "./index";

// ── Props ────────────────────────────────────────────────
interface ComboDialogFooterProps {
    form: ComboFormState;
    mode: ComboDialogMode;
    isEdit: boolean;
    isLoading: boolean;
    isValid: boolean;
    onBack: () => void;
    onCancel: () => void;
}

// ── Component ────────────────────────────────────────────
const ComboDialogFooter = memo(function ComboDialogFooter({
    form,
    mode,
    isEdit,
    isLoading,
    isValid,
    onBack,
    onCancel,
}: ComboDialogFooterProps) {
    const modeLabel = mode === 'parent' ? 'Parent' : 'Variant';

    return (
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
            {/* Validation hints */}
            <div className="flex-1 flex items-center gap-2 flex-wrap">
                {!form.name.trim() && (
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Info className="h-3 w-3" /> Name required
                    </span>
                )}
                {mode === 'variant' && form.name.trim() && !form.comboParentId && (
                    <span className="text-[11px] text-orange-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Select a parent combo
                    </span>
                )}
                {mode === 'variant' && form.name.trim() && form.comboParentId &&
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
            {!isEdit && (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onBack}
                    disabled={isLoading}
                    className="h-10 px-4 rounded-lg text-sm text-gray-500 hover:text-gray-700"
                >
                    ← Back
                </Button>
            )}
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="h-10 px-5 rounded-xl border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-medium text-sm transition-all"
            >
                Cancel
            </Button>
            <Button
                id="combo-submit"
                type="submit"
                form="combo-form"
                disabled={isLoading || !isValid}
                className={cn(
                    "h-10 px-6 rounded-xl font-semibold text-sm transition-all text-white",
                    mode === 'parent'
                        ? "bg-slate-800 hover:bg-slate-900 shadow-sm"
                        : "bg-indigo-600 hover:bg-indigo-700 shadow-sm",
                    "disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5"
                )}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save Changes" : `Create ${modeLabel}`}
            </Button>
        </div>
    );
});

export default ComboDialogFooter;
