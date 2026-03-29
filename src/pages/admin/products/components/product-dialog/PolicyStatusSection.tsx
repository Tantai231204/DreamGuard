import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, RotateCcw } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import { INPUT_CLS } from './constants';

interface PolicyStatusSectionProps {
    warrantyPolicyDay: number | string;
    returnPolicyDay: number | string;
    isLoading: boolean;
    onWarrantyChange: (value: number | string) => void;
    onReturnChange: (value: number | string) => void;
}

const PolicyStatusSection = memo(function PolicyStatusSection({
    warrantyPolicyDay, returnPolicyDay,
    isLoading,
    onWarrantyChange, onReturnChange,
}: PolicyStatusSectionProps) {
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
        </section>
    );
});

export default PolicyStatusSection;
