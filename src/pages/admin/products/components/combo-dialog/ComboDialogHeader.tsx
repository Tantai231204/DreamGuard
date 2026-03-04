/**
 * ComboDialogHeader — Header bar for the combo dialog
 *
 * Displays the icon, title, description, mode badge, and keyboard shortcut hint.
 */

import { memo } from "react";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Package, GitBranch } from "lucide-react";
import type { ComboDialogMode } from "./index";

// ── Props ────────────────────────────────────────────────
interface ComboDialogHeaderProps {
    mode: ComboDialogMode;
    isEdit: boolean;
}

// ── Component ────────────────────────────────────────────
const ComboDialogHeader = memo(function ComboDialogHeader({
    mode,
    isEdit,
}: ComboDialogHeaderProps) {
    const modeLabel = mode === 'parent' ? 'Parent' : 'Variant';
    const title = isEdit ? `Edit Combo ${modeLabel}` : `Create Combo ${modeLabel}`;
    const desc = mode === 'parent'
        ? (isEdit ? "Update parent combo details" : "Set up the basic info for a combo parent")
        : (isEdit ? "Update variant details and items" : "Pick a parent, then add product variants");

    return (
        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 shrink-0">
            <div className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border",
                mode === 'parent'
                    ? "bg-slate-50 border-slate-200"
                    : "bg-purple-50/50 border-purple-100",
            )}>
                {mode === 'parent'
                    ? <Package className="w-5 h-5 text-slate-700" />
                    : <GitBranch className="w-5 h-5 text-purple-600" />}
            </div>
            <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-bold text-slate-900">
                    {title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    {desc}
                </DialogDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border",
                    mode === 'parent'
                        ? "bg-slate-50 text-slate-600 border-slate-200"
                        : "bg-purple-50 text-purple-700 border-purple-200",
                )}>
                    {mode === 'parent' ? 'PARENT' : 'VARIANT'}
                </span>
                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-500">
                    ⌘ Enter
                </kbd>
                <span className="text-[11px] text-slate-400">to save</span>
            </div>
        </div>
    );
});

export default ComboDialogHeader;
