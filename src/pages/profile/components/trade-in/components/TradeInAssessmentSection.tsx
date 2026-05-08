import { cn } from "@/lib/utils";
import { ShieldCheck, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TradeInOrderDetailResponse } from "@/api/types/tradeInOrder";
import { formatDate } from "../../../utils";

interface TradeInAssessmentSectionProps {
    order: TradeInOrderDetailResponse;
}

export const TradeInAssessmentSection = ({ order }: TradeInAssessmentSectionProps) => {
    return (
        <div className="bg-white p-6 space-y-4">
            <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-gray-500" />
                <span className="text-[14px] font-bold text-gray-800 tracking-tight uppercase">Assessment & Log</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-gray-50 bg-gray-50/30 space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Condition State</p>
                    <Badge className={cn(
                        "border-none text-[10px] font-black uppercase tracking-widest px-2.5 h-6",
                        order.isGood ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    )}>
                        {order.isGood ? "Premium" : "Standard"}
                    </Badge>
                </div>
                <div className="p-3.5 rounded-xl border border-gray-50 bg-gray-50/30 space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Timestamp</p>
                    <p className="text-[12px] font-bold text-gray-700 uppercase">{formatDate(order.createdAt)}</p>
                </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100/50">
                <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expert Evaluation</span>
                </div>
                <p className="text-[12px] text-gray-600 font-medium leading-relaxed italic">
                    {order.description ? `"${order.description}"` : "No deviation notes recorded."}
                </p>
            </div>
        </div>
    );
};
