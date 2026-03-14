// src/pages/admin/products/components/StockAdjustmentDialog.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Plus, Minus, ArrowRight, AlertCircle, Package, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockDialogState {
    isOpen: boolean;
    type: 'add' | 'reduce';
    variantId: string;
    sku: string;
    currentStock: number;
}

interface StockAdjustmentDialogProps {
    stockDialog: StockDialogState;
    stockQuantity: number;
    isSubmitting: boolean;
    onQuantityChange: (quantity: number) => void;
    onClose: () => void;
    onSubmit: () => void;
}

export default function StockAdjustmentDialog({
    stockDialog,
    stockQuantity,
    isSubmitting,
    onQuantityChange,
    onClose,
    onSubmit,
}: StockAdjustmentDialogProps) {
    const isAdd = stockDialog.type === 'add';
    const newStock = isAdd
        ? stockDialog.currentStock + stockQuantity
        : Math.max(0, stockDialog.currentStock - stockQuantity);

    const isInvalid = !isAdd && stockQuantity > stockDialog.currentStock;

    return (
        <Dialog open={stockDialog.isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[420px] p-0 border-none shadow-2xl rounded-2xl overflow-hidden bg-white">
                {/* Clean Header Section */}
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                                {isAdd ? 'Inventory Add' : 'Inventory Reduce'}
                            </DialogTitle>
                            <div className="flex items-center gap-2 group">
                                <div className="p-1 rounded bg-slate-100 group-hover:bg-slate-200 transition-colors">
                                    <Hash className="h-3 w-3 text-slate-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 font-mono tracking-tight cursor-default">
                                    {stockDialog.sku}
                                </span>
                            </div>
                        </div>
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                            isAdd ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                        )}>
                            {isAdd ? 'Standard In' : 'Standard Out'}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 space-y-8">
                    {/* Visual Transition Card */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-around">
                        {/* Background Decoration */}
                        <Package className="absolute -right-4 -bottom-4 h-24 w-24 text-slate-200/40 rotate-12" />

                        <div className="flex flex-col items-center gap-1.5 relative z-10">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Available</span>
                            <span className="text-2xl font-black text-slate-500 tabular-nums">{stockDialog.currentStock}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center bg-white h-10 w-10 rounded-full shadow-sm border border-slate-100 relative z-10">
                            <ArrowRight className="h-5 w-5 text-slate-300" />
                        </div>

                        <div className="flex flex-col items-center gap-1.5 relative z-10">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Projected</span>
                            <span className={cn(
                                "text-3xl font-black tabular-nums leading-none",
                                isAdd ? "text-emerald-600" : "text-rose-600"
                            )}>
                                {newStock}
                            </span>
                        </div>
                    </div>

                    {/* Numeric Adjustment Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Enter Quantity</label>
                            {isInvalid && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md animate-pulse">
                                    <AlertCircle className="h-3 w-3" />
                                    Insufficient Stock
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onQuantityChange(Math.max(1, stockQuantity - 1))}
                                disabled={stockQuantity <= 1 || isSubmitting}
                                className="h-14 w-14 rounded-xl border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm group"
                            >
                                <Minus className="h-5 w-5 shrink-0" />
                            </Button>

                            <div className="flex-1 relative">
                                <Input
                                    type="number"
                                    value={stockQuantity}
                                    onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
                                    className="h-14 w-full text-center text-2xl font-black rounded-xl border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-all bg-white shadow-inner"
                                />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onQuantityChange(stockQuantity + 1)}
                                disabled={isSubmitting}
                                className="h-14 w-14 rounded-xl border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm group"
                            >
                                <Plus className="h-5 w-5 shrink-0" />
                            </Button>
                        </div>

                        {/* Presets - Minimalist Grid */}
                        <div className="grid grid-cols-5 gap-2">
                            {[5, 10, 20, 50, 100].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => onQuantityChange(num)}
                                    disabled={isSubmitting}
                                    className={cn(
                                        "py-2 rounded-lg text-[11px] font-bold transition-all border transform active:scale-95",
                                        stockQuantity === num
                                            ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-900 shadow-sm"
                                    )}
                                >
                                    +{num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Section - Action Centric */}
                <div className="px-6 py-6 mt-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 h-12 rounded-xl text-xs font-black uppercase text-slate-400 hover:text-slate-900 hover:bg-white transition-all"
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitting || isInvalid || stockQuantity <= 0}
                        className={cn(
                            "flex-[2] h-12 rounded-xl text-xs font-black uppercase shadow-lg transition-all active:scale-[0.98]",
                            isAdd
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200"
                        )}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : (
                            <span>Confirm Updates</span>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
