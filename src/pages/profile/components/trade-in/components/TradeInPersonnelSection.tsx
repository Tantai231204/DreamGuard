import { UserCheck, Truck, ShieldCheck } from "lucide-react";
import type { TradeInOrderDetailResponse } from "@/api/types/tradeInOrder";

interface TradeInPersonnelSectionProps {
    order: TradeInOrderDetailResponse;
}

export const TradeInPersonnelSection = ({ order }: TradeInPersonnelSectionProps) => {
    const sellerName = order.sellerName;
    const deliveryStaffName = order.deliveryStaffName;

    if (!sellerName && !deliveryStaffName) {
        return null;
    }

    return (
        <div className="bg-white p-6 border-b border-gray-50">
            <div className="flex items-center gap-2.5 mb-5">
                <UserCheck className="w-4 h-4 text-gray-500" />
                <span className="text-[14px] font-bold text-gray-800 tracking-tight uppercase">Assigned Personnel</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sellerName && (
                    <div className="flex items-center gap-4 p-3 rounded-xl border border-blue-50 bg-blue-50/30">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Expert Support</p>
                            <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">{sellerName}</p>
                        </div>
                    </div>
                )}

                {deliveryStaffName && (
                    <div className="flex items-center gap-4 p-3 rounded-xl border border-emerald-50 bg-emerald-50/30">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Logistics Staff</p>
                                {order.shippingTaskStatus && (
                                    <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        {order.shippingTaskStatus}
                                    </span>
                                )}
                            </div>
                            <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">{deliveryStaffName}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
