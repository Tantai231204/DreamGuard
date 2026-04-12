import { CreditCard, AlertCircle, Wallet, MinusCircle, CheckCircle2, XCircle } from "lucide-react"
import { formatPrice } from "../../../utils"
import { cn } from "@/lib/utils"
import type { OrderDetailResponse } from "@/api/types/order"
import type { PaymentDetailResponse } from "@/api/types/payment"

interface PaymentDetailsCardProps {
    order: OrderDetailResponse
    payment?: PaymentDetailResponse
}



export function PaymentDetailsCard({ order }: PaymentDetailsCardProps) {
    const statusText = order.paymentStatus || "Pending";
    const isPaid = statusText === "Paid";
    const isFailed = ["Failed", "Cancelled"].includes(statusText);

    return (
        <div className="mx-6 p-6 rounded-xl bg-white border border-gray-100 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 text-[#4988c4] mb-2">
                <CreditCard className="w-5 h-5" />
                <h4 className="text-[14px] font-black uppercase tracking-[0.2em]">Billing Overview</h4>
            </div>

            <div className="border-t border-slate-50 pt-4 space-y-4">
                {/* Payment Info Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Settlement Via</p>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-100 shadow-sm w-fit">
                                    {order.paymentMethod?.toUpperCase().includes("VNPAY") ? (
                                        <img src={`${import.meta.env.BASE_URL}images/vnpay.svg`} alt="VNPay" className="w-4 h-4 object-contain" />
                                    ) : (order.paymentMethod === 'COD') ? (
                                        <img src={`${import.meta.env.BASE_URL}images/cod.svg`} alt="COD" className="w-4 h-4 object-contain" />
                                    ) : (
                                        <Wallet className="w-4 h-4" />
                                    )}
                                    <span className="text-[12px] font-black uppercase tracking-tight text-gray-700">
                                        {order.paymentMethod || 'COD'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Current Status</p>
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm w-fit bg-white",
                                    isPaid ? "text-emerald-600 border-emerald-100" :
                                        isFailed ? "text-rose-600 border-rose-100" :
                                            "text-amber-600 border-amber-100"
                                )}>
                                    {isPaid ? <CheckCircle2 className="w-4 h-4" /> :
                                        isFailed ? <XCircle className="w-4 h-4" /> :
                                            <MinusCircle className="w-4 h-4" />}
                                    <span className="text-[11px] font-black uppercase tracking-widest">
                                        {isPaid ? "Transaction Paid" :
                                            isFailed ? (statusText === "Cancelled" ? "Payment Cancelled" : "Payment Failed") :
                                                "Payment Required"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="sm:text-right border-t border-slate-200/60 sm:border-0 pt-4 sm:pt-0 space-y-1">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Estimated Total</p>
                            <p className="text-[32px] font-black text-gray-900 tabular-nums tracking-tighter leading-none">
                                {formatPrice(order.totalAmount)}
                            </p>
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">Incl. processing fees & tax</p>
                        </div>
                    </div>
                </div>

                {/* Customer Note */}
                {order.note && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5 space-y-2">
                        <div className="flex items-center gap-2 text-amber-700">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[12px] font-black uppercase tracking-widest">Customer Note</span>
                        </div>
                        <p className="text-[14px] text-slate-700 font-medium italic pl-1 leading-relaxed">
                            &ldquo;{order.note}&rdquo;
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
