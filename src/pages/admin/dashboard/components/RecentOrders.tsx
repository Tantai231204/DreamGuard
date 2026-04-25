import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "../../types";

interface RecentOrdersProps {
  orders: (Order & { type?: 'regular' | 'trade-in' })[];
  isLoading?: boolean;
}

export default function RecentOrders({ orders, isLoading }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
         {[1, 2, 3, 4, 5].map((i) => (
           <div key={i} className="flex items-center justify-between p-4 border border-slate-50 rounded-2xl">
              <div className="flex gap-4 items-center">
                 <Skeleton className="h-10 w-10 rounded-xl" />
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                 </div>
              </div>
              <Skeleton className="h-6 w-24" />
           </div>
         ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
        >
          <Link
            to={order.type === 'trade-in' ? `/admin/trade-in-orders/${order.id}` : `/admin/orders/${order.id}`}
            className="flex items-center justify-between p-4 rounded-[1.5rem] border border-slate-50 hover:border-primary/20 hover:bg-slate-50/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
                {order.customerName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">
                  {order.customerName}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {order.products}
                </div>
              </div>
            </div>
            <div className="text-right flex items-center gap-6">
              <div>
                <div className="font-black text-sm text-slate-900 leading-none mb-1">
                  {formatPrice(order.total)}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {formatDate(order.date)}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
