import { useState } from "react";
import { CalendarDays, Check, CheckCircle2, MapPin, ShieldCheck, Tag, Ticket, Trash2, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BookingFormValues } from "../schema";
import type { Voucher } from "../vouchers";
import VoucherSelectModal from "../VoucherSelectModal";
import { formatPrice, formatDate } from "@/lib/utils";
import { useBookingData, type ProductType, type ServiceTier } from "../useBookingData";
import { ProductAssetIcons, type ProductAssetIconKey } from "@/components/common/icons";
import { useWatch, type UseFormReturn } from "react-hook-form";

interface StepConfirmProps {
    form: UseFormReturn<BookingFormValues>;
    appliedVoucher: Voucher | null;
    onApplyVoucher: (code: string) => "ok" | "invalid";
    onRemoveVoucher: () => void;
    onEditStep?: (target: number) => void;
    isSidebar?: boolean;
    paymentMethod: 'COD' | 'VNPAY';
    onPaymentChange: (method: 'COD' | 'VNPAY') => void;
    onClearDraft?: () => void;
}

export default function StepConfirm({
    form,
    appliedVoucher,
    onApplyVoucher,
    onRemoveVoucher,
    onEditStep,
    isSidebar = false,
    paymentMethod,
    onPaymentChange,
    onClearDraft,
}: StepConfirmProps) {
    const values = useWatch({ control: form.control });
    const { productTypes, getProductTierPrice } = useBookingData();
    const [modalOpen, setModalOpen] = useState(false);

    const items = (values.items as BookingFormValues['items']) || [];
    const totalBeforeVoucher = items.reduce((sum, it) => {
        const type = it.itemType || "";
        const pkg = it.packageId || "";
        const qty = it.quantity || 0;
        return sum + getProductTierPrice(type, pkg) * qty;
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
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 h-12">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-[#4988c4]/10 text-[#4988c4] text-[8px] font-black uppercase tracking-wider">
                            Live Summary
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none pt-1">Booking Overview</h3>
                    </div>
                    {onClearDraft && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClearDraft}
                            className="h-8 px-2.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1 border border-rose-100/30 bg-white"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Clear
                        </Button>
                    )}
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
                        {items.map((it, idx) => {
                            const type = it.itemType || "";
                            const pkg = it.packageId || "";
                            const qty = it.quantity || 0;
                            const product = productTypes.find((p: ProductType) => p.id === type);
                            const tier = product?.tiers.find((t: ServiceTier) => t.tierId === pkg);
                            const price = getProductTierPrice(type, pkg);
                            return (
                                <div key={idx} className="flex items-center justify-between text-sm font-bold text-slate-600">
                                    <span>{product?.label || type} — {tier?.name || pkg} (x{qty})</span>
                                    <span>{formatPrice(price * qty)}</span>
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
                                {items.length} {items.length === 1 ? "Item" : "Items"} Selected
                            </h4>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-3xl font-black tracking-tighter">{formatPrice(totalBeforeVoucher)}</div>
                            <div className="text-white/60 text-[10px] uppercase font-black tracking-widest mt-0.5">subtotal</div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-4 relative z-10 space-y-3">
                        {items.map((it, idx) => {
                            const product = productTypes.find((p: ProductType) => p.id === it.itemType);
                            const tier = product?.tiers.find((t: ServiceTier) => t.tierId === it.packageId);
                            const price = getProductTierPrice(it.itemType, it.packageId);

                            const iconSrc = product ? ProductAssetIcons[product.icon as ProductAssetIconKey] : ProductAssetIcons.PRODUCT_CATEGORIES;

                            return (
                                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-b-0 gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner flex-shrink-0">
                                            <img src={iconSrc} alt={product?.label} className="h-5 w-5 object-contain brightness-0 invert" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black">{product?.label || it.itemType}</p>
                                            <p className="text-[10px] text-white/70 font-bold">{tier?.name || it.packageId} (x{it.quantity})</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
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
                {!isSidebar && values.scheduledDate && (
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
                                <p className="text-base font-black text-slate-900">{formatDate(values.scheduledDate)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Time</p>
                                <p className="text-base font-black text-slate-900">{values.scheduledTime}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Information */}
                {!isSidebar && values.customerName && (
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
                                <span className="text-sm font-bold text-slate-700">{values.customerName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Phone</span>
                                <span className="text-sm font-bold text-slate-700">{values.customerPhone}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Address */}
            {!isSidebar && values.address && values.address.street && (
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
                        {[values.address.street, values.address.ward, values.address.district, values.address.city]
                            .filter(Boolean)
                            .join(", ")}
                    </p>
                    {values.notes && (
                        <div className="mt-4 pt-4 border-t border-slate-100 border-dashed">
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Notes / Instructions</p>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">{values.notes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Payment Method Selection */}
            {!isSidebar && (
                <div className="group rounded-[2rem] border-2 border-slate-100 bg-white p-8 transition-all duration-500 mt-6">
                    {/* Refined Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-50 pb-8">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-[#4988c4] border border-slate-100">
                                <ShieldCheck className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#4988c4]">Payment Protocol</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Method</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Select your preferred gateway</p>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/50 text-emerald-600 rounded-xl border border-emerald-100/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">SSL Encrypted</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* VnPay Option */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => onPaymentChange('VNPAY')}
                                className={`flex flex-col p-6 rounded-3xl border-2 cursor-pointer w-full text-left transition-all duration-300 hover:border-[#4988c4]/40 hover:bg-slate-50/40 group/pay
                                    ${paymentMethod === 'VNPAY' ? 'border-[#4988c4] bg-[#4988c4]/5 shadow-lg shadow-[#4988c4]/5' : 'border-slate-100 bg-white'}
                                `}
                            >
                                <div className="flex items-center justify-between mb-6 w-full">
                                    <div className="p-1.5 rounded-xl bg-white shadow-sm border border-slate-100">
                                        <img
                                            src={`${import.meta.env.BASE_URL}images/vnpay.svg`}
                                            alt="VnPay"
                                            className="h-7 w-20 object-contain p-0.5 group-hover/pay:scale-110 transition-transform"
                                        />
                                    </div>
                                    {paymentMethod === "VNPAY" && (
                                        <CheckCircle2 className="w-5 h-5 text-[#4988c4]" />
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-lg font-black tracking-tight block">VnPay Wallet</span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#4988c4] opacity-80">Online Banking System</span>
                                </div>
                            </button>
                        </div>

                        {/* COD Option */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => onPaymentChange('COD')}
                                className={`flex flex-col p-6 rounded-3xl border-2 cursor-pointer w-full text-left transition-all duration-300 hover:border-[#4988c4]/40 hover:bg-slate-50/40 group/pay
                                    ${paymentMethod === 'COD' ? 'border-[#4988c4] bg-[#4988c4]/5 shadow-lg shadow-[#4988c4]/5' : 'border-slate-100 bg-white'}
                                `}
                            >
                                <div className="flex items-center justify-between mb-6 w-full">
                                    <div className="p-1.5 rounded-xl bg-white shadow-sm border border-slate-100">
                                        <img
                                            src={`${import.meta.env.BASE_URL}images/cod.svg`}
                                            alt="COD"
                                            className="h-7 w-20 object-contain p-0.5 group-hover/pay:scale-110 transition-transform"
                                        />
                                    </div>
                                    {paymentMethod === "COD" && (
                                        <CheckCircle2 className="w-5 h-5 text-[#4988c4]" />
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-lg font-black tracking-tight block">COD</span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#4988c4] opacity-80">Cash on Delivery</span>
                                </div>
                            </button>
                        </div>
                    </div>
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
