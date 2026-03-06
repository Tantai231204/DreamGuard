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
    completionScore: number;
}

const SparklesIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

// ── Component ────────────────────────────────────────────
const ComboDialogHeader = memo(function ComboDialogHeader({
    mode,
    isEdit,
    completionScore,
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
                    : "bg-[#4988c4]/10 border-[#4988c4]/20",
            )}>
                {mode === 'parent'
                    ? <Package className="w-5 h-5 text-slate-700" />
                    : <GitBranch className="w-5 h-5 text-[#4988c4]" />}
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
                <div className="flex items-center gap-2 bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-200/50 group hover:bg-indigo-50 transition-colors">
                    <div className="text-indigo-600 animate-pulse">
                        <SparklesIcon />
                    </div>
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tighter">
                        Strength: {completionScore}%
                    </span>
                </div>
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border shadow-sm",
                    mode === 'parent'
                        ? "bg-slate-50 text-slate-600 border-slate-200"
                        : "bg-[#4988c4]/10 text-[#4988c4] border-[#4988c4]/20",
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
