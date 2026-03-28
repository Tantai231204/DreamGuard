import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, RotateCcw } from 'lucide-react';
import { PRODUCT_STATUSES, PRODUCT_STATUS_COLORS, getAllowedStatusTransitions } from '../../types';
import type { ProductStatus } from '../../types';
import SectionHeading from '../shared/SectionHeading';
import { INPUT_CLS, SELECT_CLS } from './constants';
import { AdminStatusBadge } from '@/components/admin';

interface PolicyStatusSectionProps {
    warrantyPolicyDay: number | string;
    returnPolicyDay: number | string;
    status: ProductStatus;
    isLoading: boolean;
    isEdit?: boolean;
    onWarrantyChange: (value: number | string) => void;
    onReturnChange: (value: number | string) => void;
    onStatusChange: (value: string) => void;
}

const PolicyStatusSection = memo(function PolicyStatusSection({
    warrantyPolicyDay, returnPolicyDay, status,
    isLoading, isEdit = false,
    onWarrantyChange, onReturnChange, onStatusChange,
}: PolicyStatusSectionProps) {
    return (
        <section className="space-y-4">
            <SectionHeading title="Policy & Status" />

            <div className={`grid ${isEdit ? 'grid-cols-3' : 'grid-cols-2'} gap-5`}>
                {/* Warranty */}
                <div className="space-y-2">
                    <Label htmlFor="warrantyPolicyDay" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-gray-400" /> Warranty
                    </Label>
                    <div className="relative">
                        <Input
                            id="warrantyPolicyDay"
                            type="number"
                            min={0}
                            placeholder="365"
                            value={warrantyPolicyDay}
                            onChange={(e) => onWarrantyChange(e.target.value)}
                            disabled={isLoading}
                            className={cn(INPUT_CLS, 'pr-14')}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">days</span>
                    </div>
                </div>

                {/* Return */}
                <div className="space-y-2">
                    <Label htmlFor="returnPolicyDay" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <RotateCcw className="h-3.5 w-3.5 text-gray-400" /> Return
                    </Label>
                    <div className="relative">
                        <Input
                            id="returnPolicyDay"
                            type="number"
                            min={0}
                            placeholder="30"
                            value={returnPolicyDay}
                            onChange={(e) => onReturnChange(e.target.value)}
                            disabled={isLoading}
                            className={cn(INPUT_CLS, 'pr-14')}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">days</span>
                    </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                        Status Management
                    </Label>
                    {!isEdit ? (
                        <div className="flex items-center gap-2.5 p-2.5 h-11 rounded-xl bg-amber-50 border border-amber-200/60">
                            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-xs font-bold text-amber-700">Defaults to <span className="border-b border-amber-400">Draft</span></span>
                            <AdminStatusBadge status="New Product" type="warning" className="ml-auto bg-white" />
                        </div>
                    ) : (
                        <Select value={status} onValueChange={onStatusChange} disabled={isLoading}>
                            <SelectTrigger className={SELECT_CLS}>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl">
                                {PRODUCT_STATUSES
                                    .filter(s => getAllowedStatusTransitions(status).includes(s.value))
                                    .map((s, index) => (
                                        <SelectItem
                                            key={s.value ?? `status-${index}`}
                                            value={s.value}
                                            className="rounded-lg hover:bg-primary-50 hover:text-primary-900"
                                        >
                                            <span className="flex items-center gap-2 font-bold text-slate-700">
                                                <span className={cn('h-2 w-2 rounded-full', PRODUCT_STATUS_COLORS[s.value])} />
                                                {s.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>
        </section>
    );
});

export default PolicyStatusSection;
