import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Coins, DollarSign, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import type { VoucherType } from '@/api';
import { cn, formatNumber, formatPrice } from '@/lib/utils';

interface VoucherDiscountSettingsProps {
    voucherType: VoucherType;
    discountValue: string;
    maxDiscountAmount: string;
    requiredCoin: string;
    discountValueError?: string;
    maxDiscountAmountError?: string;
    requiredCoinError?: string;
    onVoucherTypeChange: (value: VoucherType) => void;
    onDiscountValueChange: (value: string) => void;
    onMaxAmountChange: (value: string) => void;
    onRequiredCoinChange: (value: string) => void;
    isLoading?: boolean;
}

const normalizeDecimalInput = (raw: string): string => {
    const cleaned = raw.replace(/[^0-9.,]/g, '').replace(',', '.');
    const [head, ...tail] = cleaned.split('.');
    if (tail.length === 0) return head;
    return `${head}.${tail.join('')}`;
};

export function VoucherDiscountSettings({
    voucherType,
    discountValue,
    maxDiscountAmount,
    requiredCoin,
    discountValueError,
    maxDiscountAmountError,
    requiredCoinError,
    onVoucherTypeChange,
    onDiscountValueChange,
    onMaxAmountChange,
    onRequiredCoinChange,
    isLoading = false,
}: VoucherDiscountSettingsProps) {
    const parsedDiscountInput = Number.parseFloat(discountValue.replace(',', '.'));
    const parsedDiscount = Number.isFinite(parsedDiscountInput)
        ? (parsedDiscountInput > 1 ? parsedDiscountInput / 100 : parsedDiscountInput)
        : NaN;
    const percentDisplay = Number.isFinite(parsedDiscount) ? parsedDiscount * 100 : 0;
    const voucherTypeHint =
        voucherType === 'Both'
            ? 'Applies to products and services'
            : voucherType === 'Product'
                ? 'Only applies to products'
                : 'Only applies to services';

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
                    {/* Voucher Type */}
                    <div className="space-y-2">
                        <Label htmlFor="voucherType" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            Voucher Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={voucherType}
                            onValueChange={(value) => onVoucherTypeChange(value as VoucherType)}
                            disabled={isLoading}
                        >
                            <SelectTrigger 
                                id="voucherType" 
                                className="bg-gray-50 border-gray-300 hover:border-gray-400 focus:border-[#4988c4] focus:ring-[#4988c4]/20 transition-colors h-10"
                            >
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Both">Both</SelectItem>
                                <SelectItem value="Product">Product</SelectItem>
                                <SelectItem value="Service">Service</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">{voucherTypeHint}</p>
                    </div>

                    {/* Discount Value */}
                    <div className="space-y-2">
                        <Label htmlFor="discountValue" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            Value <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative group">
                            <Input
                                id="discountValue"
                                type="text"
                                inputMode="decimal"
                                placeholder="0.10"
                                value={discountValue}
                                onChange={(e) => onDiscountValueChange(normalizeDecimalInput(e.target.value))}
                                disabled={isLoading}
                                className={cn(
                                    'bg-gray-50 hover:border-gray-400 focus:border-[#4988c4] focus:ring-[#4988c4]/20 pl-10 pr-4 font-semibold text-base h-10 transition-colors',
                                    discountValueError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                                )}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-100 text-blue-600">
                                    <Percent className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            Accepts ratio or percent. Example: <span className="font-semibold">0.10 = 10%</span> or <span className="font-semibold">10 = 10%</span>
                        </p>
                        {discountValueError ? (
                            <p className="text-xs text-red-600">{discountValueError}</p>
                        ) : discountValue && Number.isFinite(parsedDiscount) && parsedDiscount >= 0 && parsedDiscount <= 1 ? (
                            <p className="text-xs text-blue-700 font-semibold">Equivalent discount: {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(percentDisplay)}%</p>
                        ) : null}
                    </div>
                </div>

                {/* Cap & Coin Requirement */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-2">
                        <Label htmlFor="maxDiscountAmount" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            Max Discount Amount
                        </Label>
                        <div className="relative">
                            <Input
                                id="maxDiscountAmount"
                                type="text"
                                inputMode="numeric"
                                placeholder="200000"
                                value={formatNumber(maxDiscountAmount)}
                                onChange={(e) => onMaxAmountChange(e.target.value.replace(/\D/g, ''))}
                                disabled={isLoading}
                                className={cn(
                                    'bg-gray-50 hover:border-gray-400 focus:border-[#4988c4] pl-8 text-sm h-10 transition-colors',
                                    maxDiscountAmountError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                                )}
                            />
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        </div>
                        {maxDiscountAmountError ? (
                            <p className="text-xs text-red-600">{maxDiscountAmountError}</p>
                        ) : maxDiscountAmount ? (
                            <p className="text-xs text-gray-500">Preview: {formatPrice(maxDiscountAmount)}</p>
                        ) : (
                            <p className="text-xs text-gray-500">Maximum discount amount cap (VND)</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="requiredCoin" className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            Required Coin <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="requiredCoin"
                                type="text"
                                inputMode="numeric"
                                placeholder="200"
                                value={formatNumber(requiredCoin)}
                                onChange={(e) => onRequiredCoinChange(e.target.value.replace(/\D/g, ''))}
                                disabled={isLoading}
                                className={cn(
                                    'bg-gray-50 hover:border-gray-400 focus:border-[#4988c4] pl-8 text-sm h-10 transition-colors',
                                    requiredCoinError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                                )}
                            />
                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        </div>
                        {requiredCoinError ? (
                            <p className="text-xs text-red-600">{requiredCoinError}</p>
                        ) : (
                            <p className="text-xs text-gray-500">Minimum coin balance required to redeem</p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
