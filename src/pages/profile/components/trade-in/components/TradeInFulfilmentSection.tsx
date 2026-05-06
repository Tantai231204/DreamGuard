import { MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TradeInOrderDetailResponse } from "@/api/types/tradeInOrder";

interface TradeInFulfilmentSectionProps {
    order: TradeInOrderDetailResponse;
    activeStaff: string | null;
}

export const TradeInFulfilmentSection = ({ order, activeStaff }: TradeInFulfilmentSectionProps) => {
    return (
        <div className="bg-white p-6">
            <div className="flex items-center gap-2.5 mb-5">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-[14px] font-bold text-gray-800 tracking-tight uppercase">Fulfilment Address</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex items-center gap-4 border-r border-gray-100 pr-8 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shadow-inner">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 leading-none truncate">{order.receiverName}</p>
                        <p className="text-[11px] font-bold text-gray-400 mt-1.5">{order.phoneNumber}</p>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-600 leading-relaxed break-words mb-2">
                        {order.address}
                    </p>
                    {activeStaff && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black px-1.5 h-4">ASSIGNED</Badge>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight truncate">Staff: {activeStaff}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
