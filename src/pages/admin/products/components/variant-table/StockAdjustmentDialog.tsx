// src/pages/admin/products/components/StockAdjustmentDialog.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Loader2, Plus, Minus, ArrowRight,
    AlertCircle, Package, Hash,
    ShieldCheck, ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

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
    onSubmit: (reason: string) => void;
}

const REASONS = [
    { value: 'restock', label: 'Inventory Restocking' },
    { value: 'correction', label: 'Data Correction' },
    { value: 'damage', label: 'Damaged / Defective' },
    { value: 'return', label: 'Customer Return' },
    { value: 'promotion', label: 'Marketing Event' },
    { value: 'other', label: 'Others' },
];

export default function StockAdjustmentDialog({
    stockDialog,
    stockQuantity,
    isSubmitting,
    onQuantityChange,
    onClose,
    onSubmit,
}: StockAdjustmentDialogProps) {
    const [reason, setReason] = useState<string>('restock');

    const isAdd = stockDialog.type === 'add';
    const newStock = isAdd
        ? stockDialog.currentStock + stockQuantity
        : Math.max(0, stockDialog.currentStock - stockQuantity);

    const isInvalid = !isAdd && stockQuantity > stockDialog.currentStock;
    const canSubmit = !isSubmitting && !isInvalid && stockQuantity > 0 && !!reason;

    return (
        <Dialog open={stockDialog.isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[420px] p-0 border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
                {/* Header - Simple & Clean */}
                <div className="px-6 pt-7 pb-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                                {isAdd ? 'Inventory Add' : 'Inventory Reduce'}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200">
                                    <Hash className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter">{stockDialog.sku}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">Updated: {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                            isAdd ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                        )}>
                            {isAdd ? 'Standard In' : 'Standard Out'}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 space-y-6">
                    {/* Simplified Adjustment Card */}
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-around">
                        <Package className="absolute -right-2 -bottom-2 h-20 w-20 text-gray-200/50 rotate-12" />

                        <div className="flex flex-col items-center gap-1 relative z-10">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Available</span>
                            <span className="text-2xl font-black text-slate-600 tabular-nums">{stockDialog.currentStock}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center bg-white h-10 w-10 rounded-full shadow-sm border border-gray-100 relative z-10">
                            <ArrowRight className="h-4 w-4 text-slate-300" />
                        </div>

                        <div className="flex flex-col items-center gap-1 relative z-10">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Projected</span>
                            <span className={cn(
                                "text-3xl font-black tabular-nums leading-none tracking-tight",
                                isAdd ? "text-emerald-500" : "text-rose-500"
                            )}>
                                {newStock}
                            </span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-5">
                        {/* Reason - The Security Lock */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Purpose of Adjustment</Label>
                            </div>
                            <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white hover:border-[#4988c4]/40 transition-all font-bold text-slate-700">
                                    <SelectValue placeholder="Reason for change" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl">
                                    {REASONS.map(r => (
                                        <SelectItem key={r.value} value={r.value} className="py-2.5 font-bold text-slate-700">
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <ClipboardCheck className="w-3.5 h-3.5 text-slate-400" />
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enter Quantity</label>
                                </div>
                                {isInvalid && (
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded shadow-sm">
                                        <AlertCircle className="h-2.5 w-2.5" />
                                        Insufficient Balance
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onQuantityChange(Math.max(1, stockQuantity - 1))}
                                    disabled={stockQuantity <= 1 || isSubmitting}
                                    className="h-16 w-16 rounded-2xl border-gray-200 bg-white hover:bg-slate-900 hover:text-white transition-all shadow-sm shrink-0"
                                >
                                    <Minus className="h-7 w-7 stroke-[3.5px]" />
                                </Button>

                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        value={stockQuantity}
                                        onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
                                        className="h-16 w-full text-center text-2xl font-black rounded-2xl border-slate-900 border-2 focus-visible:ring-0 focus-visible:border-slate-900 transition-all bg-white font-mono shadow-inner"
                                    />
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onQuantityChange(stockQuantity + 1)}
                                    disabled={isSubmitting}
                                    className="h-16 w-16 rounded-2xl border-gray-200 bg-white hover:bg-slate-900 hover:text-white transition-all shadow-sm shrink-0"
                                >
                                    <Plus className="h-7 w-7 stroke-[3.5px]" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-5 gap-2">
                                {[10, 50, 100, 200, 500].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => onQuantityChange(num)}
                                        disabled={isSubmitting}
                                        className={cn(
                                            "py-2 rounded-lg text-[9px] font-black transition-all border tracking-wider",
                                            stockQuantity === num
                                                ? "bg-gray-900 border-gray-900 text-white shadow-md shadow-gray-200"
                                                : "bg-gray-50/50 border-gray-100 text-slate-400 hover:border-gray-300 hover:text-slate-900"
                                        )}
                                    >
                                        +{num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 tracking-widest"
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={() => onSubmit(reason)}
                        disabled={!canSubmit}
                        className={cn(
                            "flex-[2] h-11 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all active:scale-[0.98]",
                            isAdd
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100"
                                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100"
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
