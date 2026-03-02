import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DollarSign, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoucherDiscountSettingsProps {
    discountType: 'percent' | 'fixed';
    discountValue: string;
    minDiscountAmount: string;
    maxDiscountAmount: string;
    onDiscountTypeChange: (value: 'percent' | 'fixed') => void;
    onDiscountValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onMinAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onMaxAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading?: boolean;
}

export function VoucherDiscountSettings({
    discountType,
    discountValue,
    minDiscountAmount,
    maxDiscountAmount,
    onDiscountTypeChange,
    onDiscountValueChange,
    onMinAmountChange,
    onMaxAmountChange,
    isLoading = false,
}: VoucherDiscountSettingsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="space-y-4"
        >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <DollarSign className="w-4 h-4 text-gray-600" />
                Discount Settings
            </div>

            <div className="rounded-lg p-4 border border-gray-200 bg-white">
                <div className="grid grid-cols-2 gap-4">
                    {/* Discount Type */}
                    <div className="space-y-2">
                        <Label htmlFor="discountType" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={discountType}
                            onValueChange={onDiscountTypeChange}
                            disabled={isLoading}
                        >
                            <SelectTrigger 
                                id="discountType" 
                                className="bg-gray-50 border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-purple-500/20 transition-colors h-10"
                            >
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percent">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Percent className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold">Percentage</div>
                                            <div className="text-xs text-gray-500">% off total</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="fixed">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold">Fixed Amount</div>
                                            <div className="text-xs text-gray-500">$ off total</div>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Discount Value */}
                    <div className="space-y-2">
                        <Label htmlFor="discountValue" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            Value <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative group">
                            <Input
                                id="discountValue"
                                type="number"
                                step="0.01"
                                min="0"
                                max={discountType === 'percent' ? '100' : undefined}
                                placeholder={discountType === 'percent' ? '10' : '5.00'}
                                value={discountValue}
                                onChange={onDiscountValueChange}
                                disabled={isLoading}
                                className="bg-gray-50 border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-purple-500/20 pl-10 pr-4 font-semibold text-base h-10 transition-colors"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                                    discountType === 'percent' 
                                        ? 'bg-blue-100 text-blue-600' 
                                        : 'bg-green-100 text-green-600'
                                }`}>
                                    {discountType === 'percent' ? <Percent className="w-3.5 h-3.5" /> : <DollarSign className="w-3.5 h-3.5" />}
                                </div>
                            </div>
                        </div>
                        {discountType === 'percent' && discountValue && parseFloat(discountValue) > 100 && (
                            <p className="text-xs text-red-600">Percentage cannot exceed 100%</p>
                        )}
                    </div>
                </div>

                {/* Min & Max Amount */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-2">
                        <Label htmlFor="minDiscountAmount" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            Min. Order Amount
                        </Label>
                        <div className="relative">
                            <Input
                                id="minDiscountAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={minDiscountAmount}
                                onChange={onMinAmountChange}
                                disabled={isLoading}
                                className="bg-gray-50 border-gray-300 hover:border-gray-400 focus:border-purple-500 pl-8 text-sm h-10 transition-colors"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">$</span>
                        </div>
                        <p className="text-xs text-gray-500">Order must be at least this amount</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxDiscountAmount" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            Max. Discount Cap
                        </Label>
                        <div className="relative">
                            <Input
                                id="maxDiscountAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={maxDiscountAmount}
                                onChange={onMaxAmountChange}
                                disabled={isLoading}
                                className="bg-gray-50 border-gray-300 hover:border-gray-400 focus:border-purple-500 pl-8 text-sm h-10 transition-colors"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">$</span>
                        </div>
                        <p className="text-xs text-gray-500">Maximum discount amount allowed</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
