import { useState, useCallback, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Save } from 'lucide-react';
import type { VoucherResponse } from '@/api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { VoucherBasicInfo } from './VoucherBasicInfo';
import { VoucherDiscountSettings } from './VoucherDiscountSettings';
import { VoucherDateRange } from './VoucherDateRange';
import { VoucherStatus } from './VoucherStatus';

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

    // Confirm dialog states
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Check if form has changes using useMemo
    const hasChanges = useMemo(() => {
        const initialValues = {
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

        const currentValues = {
            code,
            name,
            description,
            discountType,
            discountValue,
            minDiscountAmount,
            maxDiscountAmount,
            startDate,
            endDate,
            isActive,
        };

        return JSON.stringify(initialValues) !== JSON.stringify(currentValues);
    }, [code, name, description, discountType, discountValue, minDiscountAmount, maxDiscountAmount, startDate, endDate, isActive, voucher]);

    const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value.toUpperCase());
    }, []);

    const handleClose = () => {
        if (hasChanges) {
            setShowCancelConfirm(true);
        } else {
            onOpenChange(false);
        }
    };

    const handleConfirmClose = () => {
        setShowCancelConfirm(false);
        onOpenChange(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || !name.trim() || !discountValue || !startDate || !endDate) return;

        onSubmit({
            code: code.trim(),
            name: name.trim(),
            description: description.trim(),
            discountType,
            discountValue: parseFloat(discountValue),
            minDiscountAmount: parseFloat(minDiscountAmount) || 0,
            maxDiscountAmount: parseFloat(maxDiscountAmount) || 0,
            startDate,
            endDate,
            isActive,
        });
    };

    const isFormValid = code.trim() && name.trim() && discountValue && startDate && endDate &&
        (!discountType || discountType === 'fixed' || parseFloat(discountValue) <= 100);

    return (
        <>
            <DialogHeader className="pb-5 border-b">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#4988c4] flex items-center justify-center shadow-sm">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            {isEdit ? 'Edit Voucher' : 'Create New Voucher'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-1">
                            {isEdit
                                ? 'Update voucher details and settings'
                                : 'Configure discount settings for your new voucher'}
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 py-5 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 smooth-scroll"
                style={{ contain: 'layout style paint', willChange: 'scroll-position' }}
            >
                <VoucherBasicInfo
                    code={code}
                    name={name}
                    description={description}
                    onCodeChange={handleCodeChange}
                    onNameChange={(e) => setName(e.target.value)}
                    onDescriptionChange={(e) => setDescription(e.target.value)}
                    isLoading={isLoading}
                />

                <VoucherDiscountSettings
                    discountType={discountType}
                    discountValue={discountValue}
                    minDiscountAmount={minDiscountAmount}
                    maxDiscountAmount={maxDiscountAmount}
                    onDiscountTypeChange={(value: 'percent' | 'fixed') => setDiscountType(value)}
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

                <VoucherStatus
                    isActive={isActive}
                    onActiveChange={setIsActive}
                    isLoading={isLoading}
                />

                <DialogFooter className="pt-5 border-t gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 h-11 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || !isFormValid}
                        className="flex-1 h-11 bg-[#4988c4] hover:bg-[#3a6fa0] text-white shadow-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEdit ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {isEdit ? 'Update Voucher' : 'Create Voucher'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </form>

            {/* Cancel Confirmation Dialog */}
            <ConfirmDialog
                open={showCancelConfirm}
                onOpenChange={setShowCancelConfirm}
                title="Discard Changes?"
                description="You have unsaved changes. Are you sure you want to close this dialog? All your changes will be lost."
                confirmText="Discard Changes"
                cancelText="Continue Editing"
                onConfirm={handleConfirmClose}
                variant="warning"
            />
        </>
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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
                {/* key forces remount so state resets each time dialog opens/changes */}
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
