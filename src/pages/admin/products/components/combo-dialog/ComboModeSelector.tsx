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
                <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-md shadow-violet-500/25 shrink-0">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Create Combo
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-400 mt-0.5">
                            Choose what type of combo to create
                        </DialogDescription>
                    </div>
                </div>
                <div className="p-6 space-y-3">
                    <button
                        type="button"
                        onClick={() => onSelectMode('parent')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-violet-400 hover:bg-violet-50/50 transition-all text-left group"
                    >
                        <div className="w-11 h-11 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
                            <Package className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900">Combo Parent</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                Create a parent combo with basic info (name, image, description). No items.
                            </div>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelectMode('variant')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-violet-400 hover:bg-violet-50/50 transition-all text-left group"
                    >
                        <div className="w-11 h-11 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
                            <GitBranch className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900">Combo Variant</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                Create a variant under an existing parent. Add items, color, size &amp; pricing.
                            </div>
                        </div>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
