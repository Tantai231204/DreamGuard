import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { RotateCcw, ShoppingCart } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { cn } from '@/lib/utils';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { adminOrdersQueryOptions, adminTradeInOrdersQueryOptions, waitingTradeInOrdersQueryOptions } from '@/hooks/queries';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ProductOrdersTab } from './components/ProductOrdersTab';
import { TradeInOrdersTab } from './components/TradeInOrdersTab';
import {
  PRODUCT_ORDERS_DEFAULT_PAGE_SIZE,
  TRADE_IN_ORDERS_DEFAULT_PAGE_SIZE,
} from './view-models';

import { useAuthStore } from '@/store/authStore';

type AdminOrderView = 'orders' | 'trade-in';

export default function OrderManagement() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useAuthStore((s) => s.role);
  const isAdminOrManager = role === 'Admin' || role === 'Manager';
  const isSeller = role === 'Seller';
  const canViewTradeIn = isAdminOrManager || isSeller;

  const requestedView = searchParams.get('view');
  const activeView: AdminOrderView = (requestedView === 'trade-in' && canViewTradeIn)
    ? 'trade-in'
    : 'orders';

  const handleViewChange = useCallback(
    (nextValue: string) => {
      const nextView: AdminOrderView = nextValue === 'trade-in' ? 'trade-in' : 'orders';

      if (nextView === 'trade-in' && !canViewTradeIn) {
        return;
      }

      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);

          if (nextView === 'trade-in') {
            params.set('view', 'trade-in');
          } else {
            params.delete('view');
          }

          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams, canViewTradeIn],
  );

  const headerMeta = useMemo(() => {
    if (activeView === 'trade-in') {
      return {
        title: 'Order Management',
        description: 'Operational center for trade-in workflow management and payment follow-up.',
        icon: RotateCcw,
      };
    }

    return {
      title: 'Order Management',
      description: 'Monitor and process product order lifecycle in one operational workspace.',
      icon: ShoppingCart,
    };
  }, [activeView]);

  const prefetchTab = useCallback(
    (targetView: AdminOrderView) => {
      if (targetView === activeView) {
        return;
      }

      // Role guard for Trade-In prefetch
      if (targetView === 'trade-in' && !canViewTradeIn) {
        return;
      }

      if (targetView === 'orders') {
        void queryClient.prefetchQuery(
          adminOrdersQueryOptions({
            pageNumber: 1,
            pageSize: PRODUCT_ORDERS_DEFAULT_PAGE_SIZE,
          }),
        );
        return;
      }

      if (isSeller) {
        void queryClient.prefetchQuery(
          waitingTradeInOrdersQueryOptions({
            pageNumber: 1,
            pageSize: TRADE_IN_ORDERS_DEFAULT_PAGE_SIZE,
          }),
        );
      } else {
        void queryClient.prefetchQuery(
          adminTradeInOrdersQueryOptions({
            pageNumber: 1,
            pageSize: TRADE_IN_ORDERS_DEFAULT_PAGE_SIZE,
          }),
        );
      }
    },
    [activeView, queryClient, canViewTradeIn, isSeller],
  );

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title={headerMeta.title}
        description={headerMeta.description}
        icon={headerMeta.icon}
      />

      <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col"
        >
          <Tabs value={activeView} onValueChange={handleViewChange} className="flex h-full flex-col">
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList className="relative h-auto rounded-lg border border-slate-200/60 bg-slate-100/50 p-1 gap-1">
                <TabsTrigger
                  value="orders"
                  className={cn(
                    "relative h-8 px-4 rounded-md text-[11px] font-black uppercase tracking-widest transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                    "data-[state=active]:text-white text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 data-[state=active]:hover:bg-transparent group"
                  )}
                  onMouseEnter={() => prefetchTab('orders')}
                  onFocus={() => prefetchTab('orders')}
                >
                  {activeView === 'orders' && (
                    <motion.div
                      layoutId="active-orders-pill"
                      className="absolute inset-0 rounded-md bg-[#4988c4] shadow-sm"
                      transition={{ type: "tween", duration: 0.25, ease: "circOut" }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <ShoppingCart className={cn("h-3.5 w-3.5 transition-colors", activeView === 'orders' ? "text-white" : "text-slate-400 group-hover:text-slate-500")} />
                    <span>Product Orders</span>
                  </div>
                </TabsTrigger>

                {canViewTradeIn && (
                  <TabsTrigger
                    value="trade-in"
                    className={cn(
                      "relative h-8 px-4 rounded-md text-[11px] font-black uppercase tracking-widest transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                      "data-[state=active]:text-white text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 data-[state=active]:hover:bg-transparent group"
                    )}
                    onMouseEnter={() => prefetchTab('trade-in')}
                    onFocus={() => prefetchTab('trade-in')}
                  >
                    {activeView === 'trade-in' && (
                      <motion.div
                        layoutId="active-orders-pill"
                        className="absolute inset-0 rounded-md bg-emerald-600 shadow-sm"
                        transition={{ type: "tween", duration: 0.25, ease: "circOut" }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-2">
                      <RotateCcw className={cn("h-3.5 w-3.5 transition-colors", activeView === 'trade-in' ? "text-white" : "text-slate-400 group-hover:text-slate-500")} />
                      <span>Trade-In Orders</span>
                    </div>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              {activeView === 'orders' ? <ProductOrdersTab /> : <TradeInOrdersTab />}
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
