import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, RotateCcw, Repeat } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import SectionHeading from '../shared/SectionHeading';
import { INPUT_CLS } from './constants';
interface PolicyStatusSectionProps {
    warrantyPolicyDay: number | string;
    returnPolicyDay: number | string;
    isTradeInEligible: boolean;
    minTradeInPrice: number | string;
    depositAmount: number | string;
    isLoading: boolean;
    onWarrantyChange: (value: number | string) => void;
    onReturnChange: (value: number | string) => void;
    onTradeInEligibleChange: (value: boolean) => void;
    onMinTradeInPriceChange: (value: number | string) => void;
    onDepositAmountChange: (value: number | string) => void;
}

const PolicyStatusSection = memo(function PolicyStatusSection({
    warrantyPolicyDay, returnPolicyDay,
    isTradeInEligible, minTradeInPrice, depositAmount,
    isLoading,
    onWarrantyChange, onReturnChange,
    onTradeInEligibleChange, onMinTradeInPriceChange, onDepositAmountChange,
}: PolicyStatusSectionProps) {
    const handlePriceChange = (setter: (v: string | number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        // remove all non-digits
        const val = e.target.value.replace(/\D/g, '');
        setter(val ? Number(val) : '');
    };

    return (
        <section className="space-y-4 animate-in fade-in-50 duration-500">
            <SectionHeading title="Post-Purchase Policies" />

            <div className="grid grid-cols-2 gap-5">
                {/* Warranty */}
                <div className="space-y-2">
                    <Label htmlFor="warrantyPolicyDay" className="text-[11px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-1.5 ml-1">
                        <Shield className="h-3 w-3" /> Warranty Coverage
                    </Label>
                    <div className="relative group">
                        <Input
                            id="warrantyPolicyDay"
                            type="number"
                            min={0}
                            placeholder="365"
                            value={warrantyPolicyDay}
                            onChange={(e) => onWarrantyChange(e.target.value)}
                            disabled={isLoading}
                            className={cn(INPUT_CLS, 'pr-16 h-11 font-semibold')}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest group-focus-within:text-primary-400 transition-colors pointer-events-none">Days</span>
                    </div>
                </div>

                {/* Return */}
                <div className="space-y-2">
                    <Label htmlFor="returnPolicyDay" className="text-[11px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-1.5 ml-1">
                        <RotateCcw className="h-3 w-3" /> Return Window
                    </Label>
                    <div className="relative group">
                        <Input
                            id="returnPolicyDay"
                            type="number"
                            min={0}
                            placeholder="30"
                            value={returnPolicyDay}
                            onChange={(e) => onReturnChange(e.target.value)}
                            disabled={isLoading}
                            className={cn(INPUT_CLS, 'pr-16 h-11 font-semibold')}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest group-focus-within:text-primary-400 transition-colors pointer-events-none">Days</span>
                    </div>
                </div>
            </div>

            {/* Trade In Settings */}
            <SectionHeading title="Trade-In Configuration" className="pt-4" />
            <div className="space-y-5 rounded-xl border border-gray-100 p-5 bg-gray-50/50">
                <div className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5">
                            <Repeat className="h-3.5 w-3.5 text-blue-500" /> Enable Trade-In
                        </Label>
                        <p className="text-[11px] text-gray-500 font-medium">Allow customers to trade in their old products for this item</p>
                    </div>
                    <Switch
                        checked={isTradeInEligible}
                        onCheckedChange={onTradeInEligibleChange}
                        disabled={isLoading}
                    />
                </div>

                {isTradeInEligible && (
                    <div className="grid grid-cols-2 gap-5 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="minTradeInPrice" className="text-[11px] uppercase tracking-widest font-bold text-gray-400 ml-1">
                                Min Trade-In Price
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="minTradeInPrice"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={minTradeInPrice ? new Intl.NumberFormat('vi-VN').format(Number(minTradeInPrice)) : ''}
                                    onChange={handlePriceChange(onMinTradeInPriceChange)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pr-16 h-11 font-semibold')}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest group-focus-within:text-primary-400 transition-colors pointer-events-none">VND</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="depositAmount" className="text-[11px] uppercase tracking-widest font-bold text-gray-400 ml-1">
                                Deposit Amount
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="depositAmount"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={depositAmount ? new Intl.NumberFormat('vi-VN').format(Number(depositAmount)) : ''}
                                    onChange={handlePriceChange(onDepositAmountChange)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pr-16 h-11 font-semibold')}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest group-focus-within:text-primary-400 transition-colors pointer-events-none">VND</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
});

export default PolicyStatusSection;
