import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Order } from "../../types";

interface RecentOrdersProps {
  orders: Order[];
  isLoading?: boolean;
}

export default function RecentOrders({ orders, isLoading }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <Card className="p-8 shadow-xl border-slate-100">
        <div className="flex justify-between mb-8">
           <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
           </div>
           <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <div className="space-y-4">
           {[1, 2, 3, 4, 5].map((i) => (
             <div key={i} className="flex items-center justify-between p-5 border-2 border-slate-50 rounded-2xl">
                <div className="flex gap-4 items-center">
                   <Skeleton className="h-12 w-12 rounded-xl" />
                   <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-24" />
                   </div>
                </div>
                <div className="space-y-2 text-right">
                   <Skeleton className="h-6 w-24 ml-auto" />
                   <Skeleton className="h-4 w-20 ml-auto" />
                </div>
             </div>
           ))}
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="p-8 shadow-xl border-t-4 border-t-[var(--color-primary)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-500 mt-1">
              Latest customer orders
            </p>
          </div>
          <Link to="/admin/orders">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <Link
                to={`/admin/orders/${order.id}`}
                className="flex items-center justify-between p-5 rounded-xl border-2 border-gray-100 hover:border-[var(--color-primary)] hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
                    {order.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                      {order.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.products}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="font-bold text-lg text-gray-900">
                      ${order.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(order.date)}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
