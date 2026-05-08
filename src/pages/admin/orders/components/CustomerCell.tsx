import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { CheckoutOrderResponse } from '@/api/types/checkoutOrder';
import { useOrderDetail } from '@/hooks/queries/useOrder';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CustomerCell({ order }: { order: CheckoutOrderResponse }) {
    // We fetch the first child order detail because the parent checkout order list 
    // doesn't contain the customer identification (receiverName) in the list API.
    const firstChildId = order.childOrders?.[0]?.id;
    const { data: detail, isPending } = useOrderDetail(firstChildId || '', { 
        enabled: !!firstChildId && !order.receiverName && !order.fullName && !order.user?.fullName
    });

    const displayName = order.receiverName || 
                        order.fullName || 
                        order.customerName || 
                        order.user?.fullName || 
                        order.customer?.fullName || 
                        detail?.receiverName || 
                        (isPending ? 'Loading...' : 'Guest Customer');

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-gray-200 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-[#4988c4] to-[#3a6da0] text-white text-xs font-black uppercase">
                    {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : displayName.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <div className={cn(
                    "font-bold text-slate-900 truncate max-w-[160px] tracking-tight",
                    isPending && "animate-pulse text-slate-400"
                )}>
                    {displayName}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Sub-orders: {order.childOrders?.length || 0}
                </div>
            </div>
        </div>
    );
}
