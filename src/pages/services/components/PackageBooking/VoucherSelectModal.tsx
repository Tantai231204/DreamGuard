import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, Check, RefreshCcw } from "lucide-react";
import { memo, useCallback, useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { formatPrice } from "@/lib/utils";
import type { BookingVoucher } from "./types";

interface VoucherSelectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (voucher: BookingVoucher) => void;
    onSkip: () => void;
    appliedCode?: string;
    vouchers: BookingVoucher[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
}

interface VoucherOptionRowProps {
    voucher: BookingVoucher;
    isApplied: boolean;
    onSelect: (voucher: BookingVoucher) => void;
}

const VoucherOptionRow = memo(function VoucherOptionRow({ voucher, isApplied, onSelect }: VoucherOptionRowProps) {
    return (
        <button
            type="button"
            className={`w-full flex items-center justify-between rounded-xl border p-4 transition-all text-left outline-none focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/25 focus-visible:ring-offset-0 ${
                isApplied
                    ? "border-primary-300 bg-gradient-to-r from-primary-50 to-white shadow-sm shadow-primary-500/10"
                    : "border-slate-200 hover:border-primary-300 hover:bg-primary-50/50"
            }`}
            onClick={() => onSelect(voucher)}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isApplied ? "bg-primary-500 text-white shadow-md shadow-primary-500/20" : "bg-primary-50 text-primary-500"}`}>
                    <Ticket className="h-5 w-5 flex-shrink-0" />
                </div>
                <div>
                    <div className="font-black text-slate-900 text-sm tracking-tight">{voucher.code}</div>
                    <div className="text-[10px] text-slate-400 font-medium">
                        {voucher.label} - <span className="font-black text-primary-500">{voucher.discountPct}% OFF</span>
                        {voucher.maxDiscountAmount ? ` (cap ${formatPrice(voucher.maxDiscountAmount)})` : ""}
                    </div>
                </div>
            </div>
            {isApplied && (
                <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                </div>
            )}
        </button>
    );
});

function VoucherSelectModal({
    open,
    onOpenChange,
    onSelect,
    onSkip,
    appliedCode,
    vouchers,
    isLoading,
    isError,
    onRetry,
}: VoucherSelectModalProps) {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");

    const normalizedInput = input.trim().toUpperCase();
    const canApply = normalizedInput.length > 0;

    const voucherByCode = useMemo(() => {
        const map = new Map<string, BookingVoucher>();
        for (const voucher of vouchers) {
            map.set(voucher.code.trim().toUpperCase(), voucher);
        }
        return map;
    }, [vouchers]);

    const handleOpenChange = useCallback((nextOpen: boolean) => {
        if (!nextOpen) {
            setInput("");
            setError("");
        }
        onOpenChange(nextOpen);
    }, [onOpenChange]);

    const closeModal = useCallback(() => {
        handleOpenChange(false);
    }, [handleOpenChange]);

    const handleManualApply = useCallback(() => {
        if (!normalizedInput) return;

        const v = voucherByCode.get(normalizedInput);
        if (v) {
            onSelect(v);
            setError("");
            closeModal();
        } else {
            setError("Invalid voucher code or unavailable coupon");
        }
    }, [closeModal, normalizedInput, onSelect, voucherByCode]);

    const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
        if (error) {
            setError("");
        }
    }, [error]);

    const handleInputKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        handleManualApply();
    }, [handleManualApply]);

    const handleSelectVoucher = useCallback((voucher: BookingVoucher) => {
        onSelect(voucher);
        closeModal();
    }, [closeModal, onSelect]);

    const handleSkipVoucher = useCallback(() => {
        onSkip();
        closeModal();
    }, [closeModal, onSkip]);

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            {/* Shadcn Modal Content handles Close X internally by default, DO NOT DRAW CUSTOM X triggers overlapping. */}
            <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-3xl border border-primary-200 bg-white shadow-[0_24px_60px_rgba(73,136,196,0.22)] [&>button]:text-slate-400 [&>button:hover]:text-primary-600 [&>button:hover]:bg-primary-50 [&>button]:focus:outline-none [&>button]:focus-visible:outline-none [&>button]:focus-visible:ring-2 [&>button]:focus-visible:ring-primary-500/25 [&>button]:focus-visible:ring-offset-0">
                <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-600" />

                    <DialogHeader className="p-6 pb-4 border-b border-primary-200/40 bg-gradient-to-r from-primary-50 via-white to-secondary-50">
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Select a Voucher</DialogTitle>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500/80 mt-1">Apply your best offer for this booking</p>
                    </DialogHeader>

                    <div className="p-6 pt-5 space-y-5">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter promo code"
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleInputKeyDown}
                                className="font-black tracking-wider uppercase h-11 rounded-xl border-primary-200 bg-primary-50/60 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-0"
                            />
                            <Button
                                type="button"
                                onClick={handleManualApply}
                                disabled={!canApply}
                                className="h-11 px-5 rounded-xl border-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:brightness-105 disabled:opacity-40 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/25 focus-visible:ring-offset-0"
                            >
                                Apply
                            </Button>
                        </div>

                        {error && <div className="rounded-lg border border-rose-100 bg-rose-50/70 px-3 py-2 text-[10px] uppercase font-black tracking-wider text-rose-500">{error}</div>}

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar scrollbar-profile">
                            {isLoading && (
                                <div className="text-center text-primary-500/70 py-6 text-xs font-black uppercase tracking-widest leading-loose">
                                    Loading vouchers...
                                </div>
                            )}

                            {!isLoading && isError && (
                                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-center">
                                    <p className="text-xs font-black uppercase tracking-widest text-rose-500">Cannot load vouchers</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-3 h-9 rounded-lg border-rose-200 bg-white text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-0"
                                        onClick={onRetry}
                                    >
                                        <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                                        Retry
                                    </Button>
                                </div>
                            )}

                            {!isLoading && !isError && vouchers.map(v => (
                                <VoucherOptionRow
                                    key={v.userVoucherId}
                                    voucher={v}
                                    isApplied={appliedCode === v.code}
                                    onSelect={handleSelectVoucher}
                                />
                            ))}

                            {!isLoading && !isError && vouchers.length === 0 && (
                                <div className="text-center text-slate-400 py-6 text-xs font-black uppercase tracking-widest leading-loose">No vouchers available</div>
                            )}
                        </div>

                        <div className="pt-2 border-t border-slate-50">
                            <Button variant="ghost" className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-600 border border-primary-200 bg-primary-50/60 hover:bg-primary-100/60 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/25 focus-visible:ring-offset-0" onClick={handleSkipVoucher}>
                                Continue without voucher
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default memo(VoucherSelectModal);
