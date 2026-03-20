import { useState } from "react";
import { CalendarDays, Check, MapPin, Tag, Ticket, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BookingFormValues } from "../schema";
import type { Voucher } from "../vouchers";
import VoucherSelectModal from "../VoucherSelectModal";
import { formatPrice, formatDate } from "@/lib/utils";
import { productTypes, getProductTierPrice } from "../../../data";

interface StepConfirmProps {
    form: BookingFormValues;
    appliedVoucher: Voucher | null;
    onApplyVoucher: (code: string) => "ok" | "invalid";
    onRemoveVoucher: () => void;
    onEditStep?: (target: number) => void;
    isSidebar?: boolean;
}

export default function StepConfirm({
    form,
    appliedVoucher,
    onApplyVoucher,
    onRemoveVoucher,
    onEditStep,
    isSidebar = false,
}: StepConfirmProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const totalBeforeVoucher = (form.items || []).reduce((sum, it) => {
        return sum + getProductTierPrice(it.itemType, it.packageId) * it.quantity;
    }, 0);

    const discountAmt = appliedVoucher
        ? Math.round(totalBeforeVoucher * (appliedVoucher.discountPct / 100))
        : 0;
    const finalPrice = totalBeforeVoucher - discountAmt;

    function handleSelectVoucher(v: Voucher) {
        onApplyVoucher(v.code);
        setModalOpen(false);
    }
    function handleSkipVoucher() {
        onRemoveVoucher();
        setModalOpen(false);
    }

    const cardClass = "rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-md shadow-slate-100/50";
    const titleClass = "text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 mb-4 flex items-center justify-between";

    return (
        <div className="space-y-8">
            {!isSidebar && (
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[10px] font-black uppercase tracking-widest">
                        Step 06
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Check className="h-5 w-5 text-emerald-500" /> Booking Preview
                    </h3>
                    <p className="text-sm text-slate-500 font-medium tracking-wide">Please check your booking details before confirming.</p>
                </div>
            )}

            {isSidebar && (
                <div className="space-y-1 pb-4">
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-[#4988c4]/10 text-[#4988c4] text-[8px] font-black uppercase tracking-wider">
                        Live Summary
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none pt-1">Booking Overview</h3>
                </div>
            )}

            {/* Voucher + Price summary */}
            <div className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden shadow-md shadow-slate-100/50">
                {/* Voucher row */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-[#4988c4]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Voucher / Promo Code</span>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-[#4988c4] hover:bg-[#4988c4] hover:text-white transition-all text-xs font-bold"
                        onClick={() => setModalOpen(true)}
                    >
                        {appliedVoucher ? "Change" : "Select"}
                    </Button>
                </div>

                {appliedVoucher && (
                    <div className="flex items-center justify-between gap-3 bg-[#4988c4]/5 rounded-xl border border-[#4988c4]/10 px-6 py-3 mx-6 mt-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex-shrink-0 h-8 w-8 rounded-full bg-[#4988c4]/10 flex items-center justify-center">
                                <Tag className="h-3.5 w-3.5 text-[#4988c4]" />
                            </span>
                            <div>
                                <p className="text-sm font-black text-[#4988c4] tracking-wide">{appliedVoucher.code}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{appliedVoucher.label} — {appliedVoucher.discountPct}% off</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onRemoveVoucher}
                            className="flex-shrink-0 h-6 w-6 rounded-full bg-white hover:bg-rose-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}

                {/* Price breakdown */}
                <div className="px-6 py-4 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Price Summary</span>
                    <div className="space-y-2">
                        {(form.items || []).map((it, idx) => {
                            const product = productTypes.find(p => p.id === it.itemType);
                            const tier = product?.tiers.find(t => t.tierId === it.packageId);
                            const price = getProductTierPrice(it.itemType, it.packageId);
                            return (
                                <div key={idx} className="flex items-center justify-between text-sm font-bold text-slate-600">
                                    <span>{product?.label || it.itemType} — {tier?.name || it.packageId} (x{it.quantity})</span>
                                    <span>{formatPrice(price * it.quantity)}</span>
                                </div>
                            );
                        })}
                    </div>
                    {appliedVoucher && (
                        <div className="flex items-center justify-between text-sm font-bold text-emerald-600">
                            <span className="flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5" />
                                Voucher ({appliedVoucher.code})
                            </span>
                            <span>−{formatPrice(discountAmt)}</span>
                        </div>
                    )}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                        <span className="font-black text-slate-900">Total</span>
                        <div className="text-right">
                            {appliedVoucher && (
                                <span className="text-xs text-slate-300 line-through mr-2">{formatPrice(totalBeforeVoucher)}</span>
                            )}
                            <span className="text-2xl font-black text-[#4988c4] tracking-tighter">{formatPrice(finalPrice)}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">total</span>
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

            {/* Services Summary Card */}
            {!isSidebar && (
                <div className="rounded-2xl bg-gradient-to-br from-[#4988c4] to-[#3a73a8] p-6 text-white shadow-xl shadow-[#4988c4]/20 relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Services Summary</span>
                            <h4 className="text-2xl font-black mt-0.5 tracking-tight leading-none">
                                {(form.items || []).length} {(form.items || []).length === 1 ? "Item" : "Items"} Selected
                            </h4>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-3xl font-black tracking-tighter">{formatPrice(totalBeforeVoucher)}</div>
                            <div className="text-white/60 text-[10px] uppercase font-black tracking-widest mt-0.5">subtotal</div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-4 relative z-10 space-y-3">
                        {(form.items || []).map((it, idx) => {
                            const product = productTypes.find(p => p.id === it.itemType);
                            const tier = product?.tiers.find(t => t.tierId === it.packageId);
                            const price = getProductTierPrice(it.itemType, it.packageId);

                            return (
                                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-b-0">
                                    <div>
                                        <p className="text-sm font-black">{product?.label || it.itemType}</p>
                                        <p className="text-[10px] text-white/70 font-bold">{tier?.name || it.packageId} (x{it.quantity})</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black">{formatPrice(price * it.quantity)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Lower Grid for Info */}
            <div className={`grid gap-6 ${isSidebar ? "grid-cols-1" : "md:grid-cols-2"}`}>
                {/* Schedule card */}
                {!isSidebar && form.scheduledDate && (
                    <div className={cardClass}>
                        <div className={titleClass}>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-3.5 w-3.5 text-[#4988c4]" /> Schedule
                            </div>
                            {!isSidebar && onEditStep && (
                                <button onClick={() => onEditStep(2)} className="ml-auto text-[#4988c4] hover:underline underline-offset-2">Edit</button>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Date</p>
                                <p className="text-base font-black text-slate-900">{formatDate(form.scheduledDate)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Time</p>
                                <p className="text-base font-black text-slate-900">{form.scheduledTime}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Information */}
                {!isSidebar && form.customerName && (
                    <div className={cardClass}>
                        <div className={titleClass}>
                            <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-[#4988c4]" /> Contact Info
                            </div>
                            {!isSidebar && onEditStep && (
                                <button onClick={() => onEditStep(3)} className="ml-auto text-[#4988c4] hover:underline underline-offset-2">Edit</button>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Name</span>
                                <span className="text-sm font-bold text-slate-700">{form.customerName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Phone</span>
                                <span className="text-sm font-bold text-slate-700">{form.customerPhone}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Address */}
            {!isSidebar && form.address && form.address.street && (
                <div className={`${cardClass} space-y-2`}>
                    <div className={titleClass}>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[#4988c4]" /> Address Location
                        </div>
                        {!isSidebar && onEditStep && (
                            <button onClick={() => onEditStep(3)} className="ml-auto text-[#4988c4] hover:underline underline-offset-2">Edit</button>
                        )}
                    </div>
                    <p className="text-base font-black text-slate-900 tracking-tight">
                        {[form.address.street, form.address.ward, form.address.district, form.address.city]
                            .filter(Boolean)
                            .join(", ")}
                    </p>
                    {form.notes && (
                        <div className="mt-4 pt-4 border-t border-slate-100 border-dashed">
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Notes / Instructions</p>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">{form.notes}</p>
                        </div>
                    )}
                </div>
            )}



            {/* Confirmation notice */}
            {!isSidebar && (
                <div className="flex items-center gap-3 rounded-[20px] bg-white border-2 border-slate-100 p-4 shadow-md shadow-slate-100/50">
                    <span className="flex-shrink-0 h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                    </span>
                    <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">Everything looks perfect!</p>
                        <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">Press Confirm Booking to lock in your appointment.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
