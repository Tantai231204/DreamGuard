import { useState } from "react";
import { CalendarDays, Check, Clock, MapPin, Tag, Ticket, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PricingPackage } from "../../../types";
import type { BookingFormValues } from "../schema";
import type { Voucher } from "../vouchers";
import VoucherSelectModal from "../VoucherSelectModal";

interface StepConfirmProps {
    form: BookingFormValues;
    selectedPkg: PricingPackage;
    appliedVoucher: Voucher | null;
    onApplyVoucher: (code: string) => "ok" | "invalid";
    onRemoveVoucher: () => void;
}

export default function StepConfirm({
    form,
    selectedPkg,
    appliedVoucher,
    onApplyVoucher,
    onRemoveVoucher,
}: StepConfirmProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const discountAmt = appliedVoucher
        ? Math.round(selectedPkg.priceValue * (appliedVoucher.discountPct / 100))
        : 0;
    const finalPrice = selectedPkg.priceValue - discountAmt;

    function handleSelectVoucher(v: Voucher) {
        onApplyVoucher(v.code);
        setModalOpen(false);
    }
    function handleSkipVoucher() {
        onRemoveVoucher();
        setModalOpen(false);
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-gray-900">Review & Confirm</h3>
                <p className="text-sm text-gray-500 mt-1">Please check your booking details before confirming.</p>
            </div>

            {/* Voucher + Price summary */}
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                {/* Voucher row */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-violet-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-violet-600">Voucher / Promo Code</span>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-violet-300 text-violet-700 hover:bg-violet-50 hover:border-violet-400"
                        onClick={() => setModalOpen(true)}
                    >
                        {appliedVoucher ? "Đổi mã ưu đãi" : "Chọn mã ưu đãi"}
                    </Button>
                </div>
                {appliedVoucher && (
                    <div className="flex items-center justify-between gap-3 bg-violet-50 rounded-lg border border-violet-200 px-4 py-2 mx-4 mt-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex-shrink-0 h-7 w-7 rounded-full bg-violet-100 flex items-center justify-center">
                                <Tag className="h-3.5 w-3.5 text-violet-600" />
                            </span>
                            <div>
                                <p className="text-sm font-bold text-violet-700 tracking-wide">{appliedVoucher.code}</p>
                                <p className="text-xs text-violet-500">{appliedVoucher.label} — {appliedVoucher.discountPct}% off</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onRemoveVoucher}
                            className="flex-shrink-0 h-6 w-6 rounded-full bg-white hover:bg-red-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
                {/* Price breakdown */}
                <div className="px-4 py-3 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Price Summary</span>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{selectedPkg.name}</span>
                        <span className="font-semibold">${selectedPkg.priceValue}</span>
                    </div>
                    {appliedVoucher && (
                        <div className="flex items-center justify-between text-sm text-green-600">
                            <span className="flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5" />
                                Voucher ({appliedVoucher.code} · {appliedVoucher.discountPct}% off)
                            </span>
                            <span className="font-semibold">−${discountAmt}</span>
                        </div>
                    )}
                    <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <div className="text-right">
                            {appliedVoucher && (
                                <span className="text-xs text-gray-400 line-through mr-2">${selectedPkg.priceValue}</span>
                            )}
                            <span className="text-xl font-black text-[var(--color-primary)]">${finalPrice}</span>
                            <span className="text-xs text-gray-400 ml-1">{selectedPkg.priceNote}</span>
                        </div>
                    </div>
                </div>
            </div>
            <VoucherSelectModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={handleSelectVoucher}
                onSkip={handleSkipVoucher}
                appliedCode={appliedVoucher?.code}
            />

            {/* Package hero card */}
            <div className="rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-blue-600 p-5 text-white shadow-xl shadow-blue-200">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-blue-200">Selected Package</span>
                        <h4 className="text-xl font-black mt-0.5 leading-tight">{selectedPkg.name}</h4>
                        <p className="text-blue-100 text-sm mt-1">{selectedPkg.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="text-3xl font-black">{selectedPkg.price}</div>
                        <div className="text-blue-200 text-xs mt-0.5">{selectedPkg.priceNote}</div>
                    </div>
                </div>
                {selectedPkg.badge && (
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/30 mb-3">
                        ★ {selectedPkg.badge}
                    </span>
                )}
                <div className="border-t border-white/20 pt-3">
                    <ul className="space-y-1.5">
                        {selectedPkg.includes.map((inc) => (
                            <li key={inc} className="flex items-center gap-2 text-sm text-blue-50">
                                <span className="flex-shrink-0 h-4 w-4 rounded-full bg-white/25 flex items-center justify-center">
                                    <Check className="h-2.5 w-2.5 text-white" />
                                </span>
                                {inc}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Schedule card */}
            <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <CalendarDays className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">Schedule</span>
                </div>
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">Date</p>
                        <p className="text-base font-bold text-gray-900">{form.scheduledDate}</p>
                    </div>
                    <div className="h-10 w-px bg-blue-200" />
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">Time</p>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-[var(--color-primary)]" />
                            <p className="text-base font-bold text-gray-900">{form.scheduledTime}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact & Address card */}
            <div className="rounded-2xl border-2 border-gray-100 bg-gray-50/80 p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Contact Information</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl border border-gray-200 px-3 py-2.5">
                        <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
                        <p className="font-semibold text-gray-900 text-sm">{form.customerName}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 px-3 py-2.5">
                        <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                        <p className="font-semibold text-gray-900 text-sm">{form.customerPhone}</p>
                    </div>
                    {form.customerEmail && (
                        <div className="col-span-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5">
                            <p className="text-xs text-gray-400 mb-0.5">Email</p>
                            <p className="font-semibold text-gray-900 text-sm">{form.customerEmail}</p>
                        </div>
                    )}
                    <div className="col-span-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <p className="text-xs text-gray-400">Address</p>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">
                            {[form.address.street, form.address.ward, form.address.district, form.address.city]
                                .filter(Boolean)
                                .join(", ")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {form.notes && (
                <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-1.5">Notes</span>
                    <p className="text-sm text-amber-800">{form.notes}</p>
                </div>
            )}

            {/* Confirmation notice */}
            <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                    <Check className="h-3.5 w-3.5 text-white" />
                </span>
                <p className="text-sm text-green-800">
                    Everything looks good! Press <strong>Confirm Booking</strong> below and we'll contact you to confirm your appointment.
                </p>
            </div>
        </div>
    );
}
