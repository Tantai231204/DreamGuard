import { CreditCard, Clock } from "lucide-react"
import { AdminStatusBadge } from "@/components/admin"
import { formatPrice } from "../../../utils"
import { formatDateTime, cn } from "@/lib/utils"
import type { OrderDetailResponse } from "@/api/types/order"
import type { PaymentDetailResponse } from "@/api/types/payment"

interface PaymentDetailsCardProps {
  order: OrderDetailResponse
  payment?: PaymentDetailResponse
}

// Helper internally
const extractTxnId = (desc: string) => {
    if (!desc) return null;
    const match = desc.match(/(?:TxnId|Mã GD):\s*(\d+)/i);
    return match ? match[1] : null;
};

export function PaymentDetailsCard({ order, payment }: PaymentDetailsCardProps) {
    return (
        <div className="mx-6 p-6 rounded-xl bg-white border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-left">
                        <CreditCard className="w-5 h-5 text-[#4988c4]" />
                    </div>
                    <div className="text-left">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Payment Method</p>
                        <AdminStatusBadge
                            status={payment?.paymentMethod || order.paymentMethod || 'Standard Checkout'}
                            type="neutral"
                            className="group"
                        />
                    </div>
                </div>
                {payment && (
                    <div className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        payment.status === "Paid" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                        payment.status === "Failed" ? "bg-rose-50 border-rose-100 text-rose-600" :
                        "bg-amber-50 border-amber-100 text-amber-600"
                    )}>
                        {payment.status}
                    </div>
                )}
            </div>

            {payment ? (
                <div className="grid grid-cols-2 gap-y-6 gap-x-8 pt-6 border-t border-gray-50 text-left">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Net Amount</p>
                        <p className="text-[16px] font-black text-gray-900 tabular-nums">{formatPrice(payment.amount)}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Processed At</p>
                        <p className="text-[12px] font-bold text-gray-600">{formatDateTime(payment.updatedAt)}</p>
                    </div>

                    {extractTxnId(payment.description) && (
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Gateway ID</p>
                            <span className="text-[13px] font-mono font-bold text-[#4988c4] tracking-tight">#{extractTxnId(payment.description)}</span>
                        </div>
                    )}

                    <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Partner Ref</p>
                        <p className="text-[11px] font-mono font-bold text-gray-400 truncate" title={payment.pOrderId}>
                            {payment.pOrderId.split('-')[0].toUpperCase()}...
                        </p>
                    </div>
                </div>
            ) : (
                <div className="pt-2 flex items-center gap-2 text-gray-300">
                    <Clock className="w-3.5 h-3.5" />
                    <p className="text-[11px] font-bold uppercase tracking-widest">Waiting for payment updates...</p>
                </div>
            )}
        </div>
    );
}
