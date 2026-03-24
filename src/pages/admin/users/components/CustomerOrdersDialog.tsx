import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCustomerServiceOrders, useCustomerProductOrders } from '@/hooks/queries/useCustomer';
import { Loader2, ShoppingBag } from 'lucide-react';
import type { User } from '../types';
import { AdminStatusBadge } from '@/components/admin';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { AdminSearchOrderServiceItem } from '@/pages/admin/services/types';
import type { OrderResponse } from '@/api/types/order';
import type { UnifiedOrder } from '@/hooks/queries/useCustomer';

interface CustomerOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: User | null;
}

export function CustomerOrdersDialog({ open, onOpenChange, customer }: CustomerOrdersDialogProps) {
  const [activeTab, setActiveTab] = useState<'service' | 'product'>('service');

  const { data: serviceOrders, isLoading: isLoadingService } = useCustomerServiceOrders(
    customer?.customerId || '',
    open && activeTab === 'service'
  );

  const { data: productOrders, isLoading: isLoadingProduct } = useCustomerProductOrders(
    customer?.phoneNumber || customer?.fullName || '',
    open && activeTab === 'product'
  );

  const isLoadingOrders = isLoadingService || isLoadingProduct;

  const unifiedOrders = useMemo(() => {
    if (activeTab === 'service') {
      return (serviceOrders || []).map((item: AdminSearchOrderServiceItem) => ({
        id: item.soId,
        orderCode: item.orderCode || '',
        totalPrice: item.totalPrice || 0,
        status: item.status || 'pending',
        createdAt: item.createdAt || '',
        orderType: 'service' as const
      }));
    } else {
      return (productOrders || []).map((item: OrderResponse) => ({
        id: item.id,
        orderCode: item.orderCode || '',
        totalPrice: item.totalAmount || 0,
        status: item.status?.toString() || 'pending',
        createdAt: item.createdAt || '',
        orderType: 'product' as const
      }));
    }
  }, [activeTab, serviceOrders, productOrders]);

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full p-0 gap-0 border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] bg-gray-50 max-h-[85vh] flex flex-col overflow-hidden rounded-2xl">
        <div className="flex flex-col px-6 pt-6 pb-4 bg-white border-b border-gray-100/80 flex-shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 shadow-sm flex-shrink-0">
              <ShoppingBag className="h-4.5 w-4.5 text-[var(--color-primary)]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-gray-900 tracking-tight">
                Order History
              </DialogTitle>
              <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                {customer.fullName}'s detailed orders list.
              </p>
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="inline-flex w-full bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('service')}
              className={cn(
                "flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all",
                activeTab === 'service'
                  ? "bg-white text-[var(--color-primary)] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Service Orders
            </button>
            <button
              onClick={() => setActiveTab('product')}
              className={cn(
                "flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all",
                activeTab === 'product'
                  ? "bg-white text-[var(--color-primary)] shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Product Orders
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 py-6 px-6 bg-white flex-1 overflow-y-auto no-scrollbar">
          {isLoadingOrders && (
            <div className="flex justify-center items-center py-12 w-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {unifiedOrders.length ? (
            <div className="space-y-2.5 w-full">
              {unifiedOrders.map((order: UnifiedOrder) => (
                <div key={order.id} className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100/80 flex justify-between items-center transition-all cursor-default group">
                  <div>
                    <Link to={order.orderType === 'service' ? `/admin/services/${order.id}` : `/admin/orders/${order.id}`}>
                      <p className="text-sm font-bold text-slate-800 tracking-tight hover:underline cursor-pointer hover:text-blue-600 flex items-center gap-1.5">
                        #{order.orderCode || 'N/A'}
                      </p>
                    </Link>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Date N/A'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <p className="text-sm font-black text-slate-800">{order.totalPrice?.toLocaleString('vi-VN')}₫</p>
                    <AdminStatusBadge status={order.status || 'completed'} dot={false} className="py-0 px-2 h-5 text-[9px] font-black" />
                  </div>
                </div>
              ))}
            </div>
          ) : !isLoadingOrders ? (
            <p className="text-xs text-slate-400 text-center py-10 font-medium">No order recordings found.</p>
          ) : null}
        </div>

        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center w-full flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full h-11 font-black text-xs uppercase tracking-wider text-gray-600 hover:text-gray-800 border border-gray-200 shadow-sm rounded-xl"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
