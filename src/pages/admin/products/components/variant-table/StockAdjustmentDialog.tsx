// src/pages/admin/products/components/StockAdjustmentDialog.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Package, Plus, Minus, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { motion } from 'framer-motion';

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
    const newStock =
        stockDialog.type === 'add'
            ? stockDialog.currentStock + stockQuantity
            : Math.max(0, stockDialog.currentStock - stockQuantity);

    const isAdd = stockDialog.type === 'add';
    const Icon = isAdd ? TrendingUp : TrendingDown;
    const iconColor = isAdd ? 'text-green-500' : 'text-orange-500';
    const bgColor = isAdd ? 'bg-green-50' : 'bg-orange-50';
    const borderColor = isAdd ? 'border-green-200' : 'border-orange-200';

    const quickButtons = [5, 10, 20, 50];

    return (
        <Dialog open={stockDialog.isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${bgColor} ${borderColor} border-2`}>
                            <Icon className={`h-6 w-6 ${iconColor}`} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                {isAdd ? 'Add Stock' : 'Reduce Stock'}
                            </DialogTitle>
                            <p className="text-xs text-gray-500 mt-1">
                                {isAdd ? 'Increase inventory quantity' : 'Decrease inventory quantity'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-5 py-6">
                    {/* SKU Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                        <Package className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">SKU</p>
                            <p className="font-mono text-sm font-semibold text-gray-900 mt-0.5">
                                {stockDialog.sku}
                            </p>
                        </div>
                    </motion.div>

                    {/* Current Stock */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="grid grid-cols-2 gap-3"
                    >
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                Current Stock
                            </p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">
                                {stockDialog.currentStock}
                            </p>
                        </div>
                        <div className={`p-4 ${bgColor} rounded-xl border ${borderColor}`}>
                            <p className={`text-xs font-medium ${iconColor} uppercase tracking-wide`}>
                                New Stock
                            </p>
                            <p className={`text-2xl font-bold ${iconColor} mt-1`}>{newStock}</p>
                        </div>
                    </motion.div>

                    {/* Quantity Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                    >
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            Quantity to {isAdd ? 'add' : 'reduce'}
                            <Info className="h-3.5 w-3.5 text-gray-400" />
                        </label>

                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => onQuantityChange(Math.max(1, stockQuantity - 1))}
                                disabled={stockQuantity <= 1}
                                className="h-11 w-11 rounded-xl border-2"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>

                            <Input
                                type="number"
                                min={1}
                                max={stockDialog.type === 'reduce' ? stockDialog.currentStock : undefined}
                                value={stockQuantity}
                                onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
                                className="h-11 text-center text-lg font-bold rounded-xl border-2"
                            />

                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => onQuantityChange(stockQuantity + 1)}
                                disabled={
                                    stockDialog.type === 'reduce' &&
                                    stockQuantity >= stockDialog.currentStock
                                }
                                className="h-11 w-11 rounded-xl border-2"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Quick buttons */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium">Quick:</span>
                            {quickButtons.map((num) => (
                                <Button
                                    key={num}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onQuantityChange(num)}
                                    disabled={
                                        stockDialog.type === 'reduce' && num > stockDialog.currentStock
                                    }
                                    className="h-7 px-3 text-xs font-semibold rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                                >
                                    +{num}
                                </Button>
                            ))}
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-700">
                                {isAdd ? (
                                    <>
                                        This will <strong>increase</strong> the stock from{' '}
                                        <strong>{stockDialog.currentStock}</strong> to{' '}
                                        <strong>{newStock}</strong> units.
                                    </>
                                ) : (
                                    <>
                                        This will <strong>decrease</strong> the stock from{' '}
                                        <strong>{stockDialog.currentStock}</strong> to{' '}
                                        <strong>{newStock}</strong> units.
                                    </>
                                )}
                            </p>
                        </div>
                    </motion.div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="h-11 px-6 rounded-xl font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className={`h-11 px-6 rounded-xl font-semibold shadow-lg ${isAdd
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                            }`}
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {isAdd ? (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Stock
                            </>
                        ) : (
                            <>
                                <Minus className="h-4 w-4 mr-2" />
                                Reduce Stock
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
