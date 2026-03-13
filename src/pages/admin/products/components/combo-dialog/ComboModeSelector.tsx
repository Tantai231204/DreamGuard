/**
 * ComboModeSelector — Mode selection screen shown when creating a new combo
 *
 * Lets the user choose between creating a "Parent" or "Variant" combo.
 */

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Layers, Package, GitBranch } from "lucide-react";
import type { ComboDialogMode } from "./index";

// ── Props ────────────────────────────────────────────────
interface ComboModeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectMode: (mode: ComboDialogMode) => void;
}

// ── Component ────────────────────────────────────────────
export default function ComboModeSelector({
    open,
    onOpenChange,
    onSelectMode,
}: ComboModeSelectorProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/30">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200 shrink-0">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">
                            Create Combo Entity
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400 font-medium">
                            Initialize a new combo structure
                        </DialogDescription>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <button
                        type="button"
                        onClick={() => onSelectMode('parent')}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-primary-500 hover:bg-primary-50/30 transition-all text-left group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                            <Package className="w-5 h-5 text-slate-500 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[15px] font-black text-slate-900 leading-none">Combo Parent</div>
                            <div className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-medium">
                                Create a master container for variants. Best for new product concepts.
                            </div>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelectMode('variant')}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-primary-500 hover:bg-primary-50/30 transition-all text-left group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                            <GitBranch className="w-5 h-5 text-slate-500 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[15px] font-black text-slate-900 leading-none">Combo Variant</div>
                            <div className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-medium">
                                Add a specific SKU under a parent. Configure items, pricing and attributes.
                            </div>
                        </div>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
