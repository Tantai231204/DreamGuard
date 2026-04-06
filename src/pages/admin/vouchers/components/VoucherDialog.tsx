import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X, PanelTop } from 'lucide-react';
import type { VoucherResponse } from '@/api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { VoucherBasicInfo } from './VoucherBasicInfo';
import { VoucherDiscountSettings } from './VoucherDiscountSettings';
import { VoucherDateRange } from './VoucherDateRange';
import { VoucherStatus } from './VoucherStatus';
import VoucherCard from './VoucherCard';
import type { Voucher } from '../types';

interface VoucherDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    voucher?: VoucherResponse | null;
    onSubmit: (data: {
        code: string;
        name: string;
        description: string;
        discountType: 'percent' | 'fixed';
        discountValue: number;
        minDiscountAmount: number;
        maxDiscountAmount: number;
        startDate: string;
        endDate: string;
        isActive: boolean;
    }) => void;
    isLoading?: boolean;
}

function VoucherDialogInner({
    voucher,
    onOpenChange,
    onSubmit,
    isLoading = false,
}: Omit<VoucherDialogProps, 'open'>) {
    const isEdit = !!voucher;

    const [code, setCode] = useState(voucher?.code ?? '');
    const [name, setName] = useState(voucher?.name ?? '');
    const [description, setDescription] = useState(voucher?.description ?? '');
    const [discountType, setDiscountType] = useState<'percent' | 'fixed'>(voucher?.discountType ?? 'percent');
    const [discountValue, setDiscountValue] = useState(voucher?.discountValue?.toString() ?? '');
    const [minDiscountAmount, setMinDiscountAmount] = useState(voucher?.minDiscountAmount?.toString() ?? '');
    const [maxDiscountAmount, setMaxDiscountAmount] = useState(voucher?.maxDiscountAmount?.toString() ?? '');
    const [startDate, setStartDate] = useState(voucher?.startDate?.split('T')[0] ?? '');
    const [endDate, setEndDate] = useState(voucher?.endDate?.split('T')[0] ?? '');
    const [isActive, setIsActive] = useState(voucher?.isActive ?? true);

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const hasChanges = useMemo(() => {
        const initial = {
            code: voucher?.code ?? '',
            name: voucher?.name ?? '',
            description: voucher?.description ?? '',
            discountType: voucher?.discountType ?? 'percent',
            discountValue: voucher?.discountValue?.toString() ?? '',
            minDiscountAmount: voucher?.minDiscountAmount?.toString() ?? '',
            maxDiscountAmount: voucher?.maxDiscountAmount?.toString() ?? '',
            startDate: voucher?.startDate?.split('T')[0] ?? '',
            endDate: voucher?.endDate?.split('T')[0] ?? '',
            isActive: voucher?.isActive ?? true,
        };

        const current = {
            code, name, description, discountType, discountValue,
            minDiscountAmount, maxDiscountAmount, startDate, endDate, isActive,
        };

        return JSON.stringify(initial) !== JSON.stringify(current);
    }, [code, name, description, discountType, discountValue, minDiscountAmount, maxDiscountAmount, startDate, endDate, isActive, voucher]);

    const handleClose = () => {
        if (hasChanges) setShowCancelConfirm(true);
        else onOpenChange(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            code: code.trim().toUpperCase(),
            name: name.trim(),
            description: description.trim(),
            discountType,
            discountValue: parseFloat(discountValue) || 0,
            minDiscountAmount: parseFloat(minDiscountAmount) || 0,
            maxDiscountAmount: parseFloat(maxDiscountAmount) || 0,
            startDate,
            endDate,
            isActive,
        });
    };

    const isFormValid = code.trim() && name.trim() && discountValue && startDate && endDate;

    const previewVoucher: Voucher = {
        voucherId: 'preview',
        code: code || 'CODE24',
        name: name || 'NEW VOUCHER',
        description: description || '',
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        minDiscountAmount: parseFloat(minDiscountAmount) || 0,
        maxDiscountAmount: parseFloat(maxDiscountAmount) || 0,
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date().toISOString(),
        isActive,
    };

    return (
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
            {/* Form Side */}
            <div className="flex-1 flex flex-col min-w-0 bg-white border-r">
                <header className="px-10 pt-10 pb-6 border-b flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                           <PanelTop className="h-6 w-6 text-blue-600" />
                       </div>
                       <div className="flex flex-col">
                           <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none uppercase">
                               Promotion Lab
                           </h2>
                           <span className="text-[10px] font-bold text-gray-400 mt-2 tracking-widest uppercase opacity-60">
                               {isEdit ? "Refine existing campaign" : "Configure new discount tier"}
                           </span>
                       </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                    <VoucherBasicInfo
                        code={code}
                        name={name}
                        description={description}
                        onCodeChange={(e) => setCode(e.target.value.toUpperCase())}
                        onNameChange={(e) => setName(e.target.value)}
                        onDescriptionChange={(e) => setDescription(e.target.value)}
                        isLoading={isLoading}
                    />

                    <VoucherDiscountSettings
                        discountType={discountType}
                        discountValue={discountValue}
                        minDiscountAmount={minDiscountAmount}
                        maxDiscountAmount={maxDiscountAmount}
                        onDiscountTypeChange={setDiscountType}
                        onDiscountValueChange={(e) => setDiscountValue(e.target.value)}
                        onMinAmountChange={(e) => setMinDiscountAmount(e.target.value)}
                        onMaxAmountChange={(e) => setMaxDiscountAmount(e.target.value)}
                        isLoading={isLoading}
                    />

                    <VoucherDateRange
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={(e) => setStartDate(e.target.value)}
                        onEndDateChange={(e) => setEndDate(e.target.value)}
                        isLoading={isLoading}
                    />

                    <VoucherStatus isActive={isActive} onActiveChange={setIsActive} isLoading={isLoading} />
                </form>

                <footer className="px-10 py-6 border-t bg-gray-50 flex items-center gap-4 shrink-0">
                    <Button 
                        variant="ghost" 
                        onClick={handleClose} 
                        disabled={isLoading} 
                        className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[9px] text-gray-400"
                    >
                        Discard
                    </Button>
                    <Button 
                        type="submit" 
                        onClick={handleSubmit}
                        disabled={isLoading || !isFormValid} 
                        className="flex-[2] h-12 bg-blue-600 hover:bg-black text-white shadow-xl shadow-blue-100 rounded-2xl gap-3 font-black uppercase tracking-widest text-[9px] transition-all active:scale-[0.98]"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isEdit ? 'Sync Campaign' : 'Initialize'}
                    </Button>
                </footer>
            </div>

            {/* Preview Side */}
            <aside className="w-full lg:w-[480px] bg-[#f8fbff] p-12 relative flex flex-col items-center justify-center shrink-0 border-l">
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1a202c 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                
                <div className="relative z-10 w-full flex flex-col items-center max-w-[360px]">
                    <div className="text-center mb-10 w-full">
                        <span className="px-5 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 border border-gray-100 shadow-sm inline-block">
                           Marketplace Mock
                        </span>
                        <p className="text-[10px] text-gray-300 font-bold uppercase mt-5 tracking-[0.2em] opacity-60">
                            Digital Display Preview
                        </p>
                    </div>

                    <div className="w-full drop-shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
                        <VoucherCard voucher={previewVoucher} />
                    </div>

                    <div className="mt-14 w-full p-6 bg-white border border-gray-100 rounded-[24px] flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                           <span className="text-blue-500 text-xs font-black italic">!</span>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-800">Visual Integrity</h4>
                            <p className="text-[10px] leading-relaxed text-gray-400 font-bold">
                                Vouchers utilize hardware-accelerated static rendering for ultra-sharp displays.
                            </p>
                        </div>
                    </div>
                </div>

                <button onClick={handleClose} className="absolute top-8 right-8 lg:hidden h-10 w-10 flex items-center justify-center bg-white rounded-full shadow-lg text-gray-400">
                    <X className="h-5 w-5" />
                </button>
            </aside>

            <ConfirmDialog
                open={showCancelConfirm}
                onOpenChange={setShowCancelConfirm}
                title="Discard Changes?"
                description="Your current campaign configuration will be erased."
                confirmText="Confirm Discard"
                onConfirm={() => onOpenChange(false)}
                variant="warning"
            />
        </div>
    );
}

export default function VoucherDialog({
    open,
    onOpenChange,
    voucher,
    onSubmit,
    isLoading,
}: VoucherDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl lg:max-w-[1100px] h-[92vh] lg:h-[88vh] p-0 overflow-hidden rounded-[40px] border-none shadow-2xl">
                <VoucherDialogInner
                    key={voucher?.voucherId ?? 'new'}
                    voucher={voucher}
                    onOpenChange={onOpenChange}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                />
            </DialogContent>
        </Dialog>
    );
}
