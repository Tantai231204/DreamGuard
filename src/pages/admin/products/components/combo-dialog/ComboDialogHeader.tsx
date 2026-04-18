import { memo } from "react";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import type { ComboDialogMode } from "./index";

interface ComboDialogHeaderProps {
    mode: ComboDialogMode;
    isEdit: boolean;
    status: string;
    completionScore: number;
}

const ComboDialogHeader = memo(function ComboDialogHeader({
    mode,
    isEdit,
    status,
    completionScore
}: ComboDialogHeaderProps) {
    const isParent = mode === 'parent';
    const title = isEdit
        ? (isParent ? 'Edit Combo Parent' : 'Edit Variant Combo')
        : (isParent ? 'New Combo Parent' : 'New Variant Combo');

    const desc = isParent
        ? "Define basic attributes and specifications for a parent combo."
        : "Configure specific variation details and bundle composition.";


    return (
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
                <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold text-gray-900 leading-none mb-1">
                    {title}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-400 font-medium">
                    {desc}
                </DialogDescription>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0 pr-10">
                <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
                    <span className="text-[11px] font-black text-blue-700 uppercase tracking-tighter">
                        Strength: {completionScore}%
                    </span>
                </div>
                <div className="flex items-center gap-2 pr-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                        <div className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            mode === 'parent' ? "bg-slate-400" : "bg-primary-400"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {mode.toUpperCase()}
                        </span>
                    </div>

                    {isEdit && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 font-bold">
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full shrink-0",
                                status.toLowerCase() === 'published' ? 'bg-emerald-500' :
                                status.toLowerCase() === 'draft' ? 'bg-amber-500' :
                                status.toLowerCase() === 'outofstock' ? 'bg-rose-500' : 'bg-blue-500'
                            )} />
                            <span className="text-[12px] font-bold text-slate-700 capitalize leading-none tracking-tight">
                                {status}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ComboDialogHeader;
