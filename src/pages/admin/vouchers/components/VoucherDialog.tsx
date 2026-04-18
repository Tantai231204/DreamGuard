import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X, PanelTop } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { VoucherBasicInfo } from './VoucherBasicInfo';
import { VoucherDiscountSettings } from './VoucherDiscountSettings';
import { VoucherDateRange } from './VoucherDateRange';
import { VoucherStatus } from './VoucherStatus';
import VoucherCard from './VoucherCard';
import type { Voucher, VoucherFormValues } from '../types';
import { formatPrice } from '@/lib/utils';

interface VoucherDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    voucher?: Voucher | null;
    onSubmit: (data: VoucherFormValues) => void;
    isLoading?: boolean;
}

type VoucherValidationErrors = {
    discountValue?: string;
    maxDiscountAmount?: string;
    requiredCoin?: string;
    dateRange?: string;
};

const parseDiscountRatio = (value: string): number => {
    const normalized = value.replace(',', '.').trim();
    if (!normalized) return Number.NaN;

    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed) || parsed <= 0) return Number.NaN;

    if (parsed > 1) {
        if (parsed <= 100) return parsed / 100;
        return Number.NaN;
    }

    return parsed;
};

const parseWholeNumber = (value: string): number => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return Number.NaN;
    return Number.parseInt(digits, 10);
};

function VoucherDialogInner({
    voucher,
    onOpenChange,
    onSubmit,
    isLoading = false,
}: Omit<VoucherDialogProps, 'open'>) {
    const isEdit = !!voucher;
    const voucherFormId = 'voucher-form';

    const [code, setCode] = useState(voucher?.code ?? '');
    const [name, setName] = useState(voucher?.name ?? '');
    const [description, setDescription] = useState(voucher?.description ?? '');
    const [voucherType, setVoucherType] = useState(voucher?.voucherType ?? 'Both');
    const [discountValue, setDiscountValue] = useState(voucher?.discountValue?.toString() ?? '');
    const [maxDiscountAmount, setMaxDiscountAmount] = useState(voucher?.maxDiscountAmount?.toString() ?? '');
    const [requiredCoin, setRequiredCoin] = useState(voucher?.requiredCoin?.toString() ?? '');
    const [startDate, setStartDate] = useState(voucher?.startDate?.split('T')[0] ?? '');
    const [endDate, setEndDate] = useState(voucher?.endDate?.split('T')[0] ?? '');
    const [isActive, setIsActive] = useState(voucher?.isActive ?? true);

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [touchedFields, setTouchedFields] = useState({
        discountValue: false,
        maxDiscountAmount: false,
        requiredCoin: false,
        dateRange: false,
    });

    const hasChanges = useMemo(() => {
        const initial = {
            code: voucher?.code ?? '',
            name: voucher?.name ?? '',
            description: voucher?.description ?? '',
            voucherType: voucher?.voucherType ?? 'Both',
            discountValue: voucher?.discountValue?.toString() ?? '',
            maxDiscountAmount: voucher?.maxDiscountAmount?.toString() ?? '',
            requiredCoin: voucher?.requiredCoin?.toString() ?? '',
            startDate: voucher?.startDate?.split('T')[0] ?? '',
            endDate: voucher?.endDate?.split('T')[0] ?? '',
            isActive: voucher?.isActive ?? true,
        };

        const current = {
            code,
            name,
            description,
            voucherType,
            discountValue,
            maxDiscountAmount,
            requiredCoin,
            startDate,
            endDate,
            isActive,
        };

        return JSON.stringify(initial) !== JSON.stringify(current);
    }, [code, name, description, voucherType, discountValue, maxDiscountAmount, requiredCoin, startDate, endDate, isActive, voucher]);

    const handleClose = () => {
        if (hasChanges) setShowCancelConfirm(true);
        else onOpenChange(false);
    };

    const discountValueNumber = parseDiscountRatio(discountValue);
    const maxDiscountAmountNumber = parseWholeNumber(maxDiscountAmount);
    const requiredCoinNumber = parseWholeNumber(requiredCoin);
    const rawDiscountInput = Number.parseFloat(discountValue.replace(',', '.'));

    const validationErrors = useMemo<VoucherValidationErrors>(() => {
        const errors: VoucherValidationErrors = {};

        if (!discountValue.trim() || !Number.isFinite(rawDiscountInput)) {
            errors.discountValue = 'Discount value is required';
        } else if (rawDiscountInput <= 0) {
            errors.discountValue = 'Discount value must be greater than 0';
        } else if (rawDiscountInput > 100) {
            errors.discountValue = 'Discount cannot exceed 100%';
        }

        if (!Number.isFinite(maxDiscountAmountNumber) || maxDiscountAmountNumber <= 0) {
            errors.maxDiscountAmount = 'Max discount amount must be greater than 0';
        }

        if (!Number.isFinite(requiredCoinNumber) || requiredCoinNumber <= 0) {
            errors.requiredCoin = 'Required coin must be greater than 0';
        } else if (!Number.isInteger(requiredCoinNumber)) {
            errors.requiredCoin = 'Required coin must be a whole number';
        }

        if (startDate && endDate && startDate > endDate) {
            errors.dateRange = 'End date must be on or after start date';
        }

        return errors;
    }, [discountValue, rawDiscountInput, maxDiscountAmountNumber, requiredCoinNumber, startDate, endDate]);

    const visibleErrors = useMemo<VoucherValidationErrors>(() => {
        return {
            discountValue: (touchedFields.discountValue || hasAttemptedSubmit) ? validationErrors.discountValue : undefined,
            maxDiscountAmount: (touchedFields.maxDiscountAmount || hasAttemptedSubmit) ? validationErrors.maxDiscountAmount : undefined,
            requiredCoin: (touchedFields.requiredCoin || hasAttemptedSubmit) ? validationErrors.requiredCoin : undefined,
            dateRange: (touchedFields.dateRange || hasAttemptedSubmit) ? validationErrors.dateRange : undefined,
        };
    }, [validationErrors, touchedFields, hasAttemptedSubmit]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);

        if (!isFormValid) {
            return;
        }

        onSubmit({
            code: code.trim().toUpperCase(),
            name: name.trim(),
            description: description.trim(),
            voucherType,
            discountValue: discountValueNumber,
            maxDiscountAmount: maxDiscountAmountNumber,
            requiredCoin: Math.floor(requiredCoinNumber),
            startDate,
            endDate,
            isActive,
        });
    };

    const hasBusinessErrors = Object.keys(validationErrors).length > 0;
    const isFormValid = Boolean(
        code.trim() &&
        name.trim() &&
        startDate &&
        endDate &&
        !hasBusinessErrors
    );

    const discountPercentPreview = Number.isFinite(discountValueNumber)
        ? `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(discountValueNumber * 100)}%`
        : '--';
    const maxDiscountPreview = Number.isFinite(maxDiscountAmountNumber) && maxDiscountAmountNumber > 0
        ? formatPrice(maxDiscountAmountNumber)
        : '--';
    const requiredCoinPreview = Number.isFinite(requiredCoinNumber) && requiredCoinNumber > 0
        ? Math.floor(requiredCoinNumber).toLocaleString('vi-VN')
        : '--';

    const previewVoucher: Voucher = {
        voucherId: 'preview',
        code: code || 'CODE24',
        name: name || 'NEW VOUCHER',
        description: description || '',
        voucherType,
        discountValue: Number.isFinite(discountValueNumber) && discountValueNumber > 0 ? discountValueNumber : 0,
        maxDiscountAmount: Number.isFinite(maxDiscountAmountNumber) && maxDiscountAmountNumber > 0 ? maxDiscountAmountNumber : 0,
        requiredCoin: Number.isFinite(requiredCoinNumber) && requiredCoinNumber > 0 ? Math.floor(requiredCoinNumber) : 0,
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

                <form id={voucherFormId} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
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
                        voucherType={voucherType}
                        discountValue={discountValue}
                        maxDiscountAmount={maxDiscountAmount}
                        requiredCoin={requiredCoin}
                        discountValueError={visibleErrors.discountValue}
                        maxDiscountAmountError={visibleErrors.maxDiscountAmount}
                        requiredCoinError={visibleErrors.requiredCoin}
                        onVoucherTypeChange={setVoucherType}
                        onDiscountValueChange={(value) => {
                            setTouchedFields((prev) => ({ ...prev, discountValue: true }));
                            setDiscountValue(value);
                        }}
                        onMaxAmountChange={(value) => {
                            setTouchedFields((prev) => ({ ...prev, maxDiscountAmount: true }));
                            setMaxDiscountAmount(value);
                        }}
                        onRequiredCoinChange={(value) => {
                            setTouchedFields((prev) => ({ ...prev, requiredCoin: true }));
                            setRequiredCoin(value);
                        }}
                        isLoading={isLoading}
                    />

                    <VoucherDateRange
                        startDate={startDate}
                        endDate={endDate}
                        dateRangeError={visibleErrors.dateRange}
                        onStartDateChange={(e) => {
                            setTouchedFields((prev) => ({ ...prev, dateRange: true }));
                            setStartDate(e.target.value);
                        }}
                        onEndDateChange={(e) => {
                            setTouchedFields((prev) => ({ ...prev, dateRange: true }));
                            setEndDate(e.target.value);
                        }}
                        isLoading={isLoading}
                    />

                    <VoucherStatus isActive={isActive} onActiveChange={setIsActive} isLoading={isLoading} />
                </form>

                <footer className="px-10 py-6 border-t bg-gray-50 flex items-center gap-4 shrink-0">
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={handleClose} 
                        disabled={isLoading} 
                        className="flex-1 h-11 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium transition-all"
                    >
                        Cancel
                    </Button>
                    <Button 
                        form={voucherFormId}
                        type="submit" 
                        disabled={isLoading} 
                        className="flex-[2] h-11 rounded-xl font-medium transition-all text-white bg-[#4988c4] hover:bg-[#3a6fa0] shadow-sm disabled:opacity-50 disabled:shadow-none"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isEdit ? 'Sync Campaign' : 'Initialize'}
                    </Button>
                </footer>
            </div>

            {/* Preview Side */}
            <aside className="w-full lg:w-[480px] bg-[#f8fbff] p-12 relative flex flex-col items-center justify-center shrink-0 border-l [@media(max-height:900px)]:p-9 [@media(max-height:820px)]:p-7 [@media(max-height:760px)]:p-6 [@media(max-height:760px)]:justify-start">
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1a202c 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                
                <div className="relative z-10 w-full flex flex-col items-center max-w-[360px] [@media(max-height:900px)]:max-w-[330px] [@media(max-height:820px)]:max-w-[305px] [@media(max-height:760px)]:max-w-[280px]">
                    <div className="text-center mb-10 w-full [@media(max-height:900px)]:mb-7 [@media(max-height:760px)]:mb-5">
                        <span className="px-5 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-[#4988c4] border border-blue-100 shadow-sm inline-block">
                           Live Voucher Review
                        </span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-5 tracking-[0.2em] [@media(max-height:760px)]:mt-3 [@media(max-height:760px)]:text-[9px]">
                            Preview uses real formatting rules
                        </p>
                    </div>

                    <div className="w-full drop-shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
                        <VoucherCard voucher={previewVoucher} />
                    </div>

                    <div className="mt-8 w-full grid grid-cols-3 gap-2 [@media(max-height:900px)]:mt-6 [@media(max-height:760px)]:mt-4">
                        <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-3 [@media(max-height:760px)]:px-2.5 [@media(max-height:760px)]:py-2">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-500">Discount</p>
                            <p className="text-sm font-black text-blue-700 mt-1 [@media(max-height:760px)]:text-[13px]">{discountPercentPreview}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 [@media(max-height:760px)]:px-2.5 [@media(max-height:760px)]:py-2">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Cap</p>
                            <p className="text-sm font-black text-slate-700 mt-1 truncate [@media(max-height:760px)]:text-[13px]">{maxDiscountPreview}</p>
                        </div>
                        <div className="rounded-xl border border-primary-200 bg-primary-50/50 px-3 py-3 [@media(max-height:760px)]:px-2.5 [@media(max-height:760px)]:py-2">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-primary-600">Coin</p>
                            <p className="text-sm font-black text-primary-700 mt-1 [@media(max-height:760px)]:text-[13px]">{requiredCoinPreview}</p>
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
