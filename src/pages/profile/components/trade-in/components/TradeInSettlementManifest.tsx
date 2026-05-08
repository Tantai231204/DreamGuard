import { ArrowLeftRight } from "lucide-react";
import { formatPrice } from "../../../utils";
import { Button } from "@/components/ui/button";
import { PaymentDetailsCard } from "../../orders/components/PaymentDetailsCard";
import type { TradeInOrderDetailResponse } from "@/api/types/tradeInOrder";

interface TradeInSettlementManifestProps {
    order: TradeInOrderDetailResponse;
    orderCode: string;
    needsPaymentRetry: boolean;
    isRetryingPayment: boolean;
    onRetryPayment: () => void;
}

export const TradeInSettlementManifest = ({ 
    order, 
    orderCode, 
    needsPaymentRetry, 
    isRetryingPayment, 
    onRetryPayment 
}: TradeInSettlementManifestProps) => {
    return (
        <div className="bg-white pb-7 pt-2">
            <div className="px-6 py-4 flex items-center gap-2.5 text-slate-500">
                <ArrowLeftRight className="w-4 h-4" />
                <span className="text-[14px] font-bold text-gray-800 tracking-tight uppercase">Settlement Manifest</span>
            </div>
            <div className="px-6 space-y-2.5">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Base Acquisition</span>
                    <span className="text-sm font-bold text-gray-900">{formatPrice(order.productVariant?.salePrice || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Trade-In Allowance</span>
                    <span className="text-sm font-black text-emerald-600">-{formatPrice(order.tradeInPrice)}</span>
                </div>
                {order.depositAmount > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Retained Deposit</span>
                        <span className="text-sm font-bold text-rose-500">-{formatPrice(order.depositAmount)}</span>
                    </div>
                )}
                <div className="h-px bg-slate-50 border-t border-dashed border-slate-200 mt-3 mb-2" />
                <div className="flex justify-between items-end pt-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Total Settlement</span>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest italic">Includes all verified deductions</p>
                    </div>
                    <span className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
                        {formatPrice(order.amountToPay)}
                    </span>
                </div>
            </div>

            {needsPaymentRetry && (
                <div className="mx-6 mt-6 rounded-xl border border-rose-100 bg-rose-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[11px] font-bold text-rose-700 leading-snug">
                        Payment failed. Retry to continue the trade-in journey.
                    </p>
                    <Button
                        type="button"
                        onClick={onRetryPayment}
                        disabled={isRetryingPayment}
                        className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary text-white hover:bg-primary/90"
                    >
                        {isRetryingPayment ? "Retrying..." : "Pay Again"}
                    </Button>
                </div>
            )}

            <div className="mx-6 mt-6 pt-4 border-t border-slate-100/80">
                <PaymentDetailsCard
                    orderCode={orderCode}
                    fallbackPayment={{
                        id: order.orderCode,
                        orderCode: order.orderCode,
                        paymentMethod: "VnPay",
                        paymentType: "Purchase",
                        status: "Pending",
                        amount: order.amountToPay,
                        createdAt: order.createdAt,
                    }}
                    className="mx-0"
                />
            </div>
        </div>
    );
};
