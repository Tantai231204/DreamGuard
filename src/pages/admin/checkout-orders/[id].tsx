import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Truck, ChevronLeft, CreditCard, Layers, Eye, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminCheckoutOrders } from '@/hooks/queries/useCheckoutOrder';
import { useOrderDetail } from '@/hooks/queries/useOrder';
import { formatPrice } from '@/pages/profile/utils';
import { formatDate } from '@/lib/utils';
import { AdminStatusBadge } from '@/components/admin';
import { PaymentInfoCard, ShippingAddressCard, OrderDetailSkeleton, AssignShippingStaffDialog, BulkAssignShippingStaffDialog } from '../orders/components';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getChildOrderLabel } from '@/api/types/checkoutOrder';
import { cn } from '@/lib/utils';
import { OrderStatus, ORDER_STATUS_MAP } from '../orders/constants';

function ChildOrderCard({ childOrderId, onAssign }: { childOrderId: string, onAssign: (id: string) => void }) {
    const { data: detail, isPending } = useOrderDetail(childOrderId);
    const navigate = useNavigate();

    const currentStatusEnum = useMemo(() => detail ? ORDER_STATUS_MAP[detail.status.toString()] : null, [detail]);
    const isCancelled = currentStatusEnum === OrderStatus.Cancelled;

    const canAssign = useMemo(() => {
        if (!detail || isCancelled) return false;
        return (
            currentStatusEnum !== OrderStatus.Pending &&
            currentStatusEnum !== OrderStatus.Completed &&
            currentStatusEnum !== OrderStatus.Returned &&
            currentStatusEnum !== OrderStatus.ReturnedAndRefunding &&
            currentStatusEnum !== OrderStatus.ReturnedAndRefunded
        );
    }, [detail, currentStatusEnum, isCancelled]);

    if (isPending) return <div className="h-24 bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />;
    if (!detail) return null;

    const orderTypeLabel = getChildOrderLabel(detail.orderCode);
    const isCustom = orderTypeLabel === 'Custom Order';

    return (
        <div
            onClick={() => navigate(`/admin/orders/${detail.id}`)}
            className={cn(
                "group relative flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer",
                isCancelled && "opacity-75 grayscale-[0.3]"
            )}
        >
            {/* Visual Accent */}
            <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full transition-all duration-300",
                isCancelled ? "bg-slate-300" : (isCustom ? "bg-amber-400 group-hover:h-16" : "bg-blue-400 group-hover:h-16")
            )} />

            <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg shadow-inner shrink-0",
                    isCancelled ? "bg-slate-100 text-slate-400" : (isCustom ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600")
                )}>
                    {detail.items?.length || 0}
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-800 text-base tracking-tight truncate">#{detail.orderCode}</h4>
                        <Badge variant="outline" className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                            isCancelled ? "bg-slate-50 border-slate-200 text-slate-500" : (isCustom ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-blue-50 border-blue-200 text-blue-700")
                        )}>
                            {orderTypeLabel}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-slate-500">{formatPrice(detail.totalAmount)}</p>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <AdminStatusBadge status={detail.status.toString()} className="scale-90 origin-left" />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8 shrink-0">
                {/* Staff Assignment Status */}
                {!isCancelled && (
                    <div className="hidden md:flex flex-col items-end gap-2 pr-8 border-r border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned Personnel</span>
                        {detail.shippingStaffName ? (
                            <div className="flex items-center gap-2.5">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-700 leading-none">{detail.shippingStaffName}</p>
                                    <p className="text-[10px] text-emerald-600 font-medium mt-1">Agent Confirmed</p>
                                </div>
                                <Avatar className="h-8 w-8 border border-white shadow-sm ring-1 ring-slate-100">
                                    <AvatarImage src={detail.shippingStaffAvatarUrl} />
                                    <AvatarFallback className="bg-slate-100 text-slate-400 text-[10px] font-black uppercase">
                                        {detail.shippingStaffName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-300 italic">
                                <span className="text-[10px] font-bold">Unassigned</span>
                                <UserPlus className="w-3.5 h-3.5" />
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] font-black uppercase tracking-widest h-10 px-5 rounded-xl hover:bg-slate-100 text-slate-500 gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/orders/${detail.id}`);
                        }}
                    >
                        <Eye className="w-4 h-4" /> Deep Logistics
                    </Button>
                    {canAssign && (
                        <Button
                            size="sm"
                            className="text-[10px] font-black uppercase tracking-widest h-10 px-5 rounded-xl bg-[#4988c4] text-white hover:bg-[#3b6da3] shadow-md shadow-blue-500/10 gap-2 border-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAssign(detail.id);
                            }}
                        >
                            <Truck className="w-4 h-4" /> {detail.shippingStaffName ? 'Reassign' : 'Assign Staff'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Individual Shipment Progress Bar */}
            {!isCancelled && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50 overflow-hidden rounded-b-2xl">
                    <div
                        className={cn(
                            "h-full transition-all duration-1000 ease-out",
                            currentStatusEnum === OrderStatus.Completed ? "bg-emerald-500" : "bg-blue-400"
                        )}
                        style={{
                            width: `${Math.max(5, (Number(currentStatusEnum || 0) / 5) * 100)}%`
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default function AdminCheckoutOrderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Fallback: Fetch from list and filter because the direct detail API doesn't exist
    const { data: listData, isPending: isLoadingList, isError } = useAdminCheckoutOrders({ search: id });
    const order = useMemo(() => {
        return listData?.items.find(item => item.id === id);
    }, [listData, id]);

    const [selectedChildForAssign, setSelectedChildForAssign] = useState<string | null>(null);
    const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

    const totalShippingFee = useMemo(() => {
        return order?.childOrders?.reduce((sum, child) => sum + (child.shippingFee || 0), 0) || 0;
    }, [order?.childOrders]);

    const totalProductPrice = useMemo(() => {
        return order?.childOrders?.reduce((sum, child) => sum + (child.totalAmount - (child.shippingFee || 0)), 0) || 0;
    }, [order?.childOrders]);

    const assignableChildOrderIds = useMemo(() => {
        return order?.childOrders?.filter(child => {
            const statusEnum = ORDER_STATUS_MAP[child.status.toString()];
            return (
                statusEnum !== OrderStatus.Pending &&
                statusEnum !== OrderStatus.Completed &&
                statusEnum !== OrderStatus.Cancelled &&
                statusEnum !== OrderStatus.Returned &&
                statusEnum !== OrderStatus.ReturnedAndRefunding &&
                statusEnum !== OrderStatus.ReturnedAndRefunded
            );
        }).map(c => c.id) || [];
    }, [order?.childOrders]);

    // Wait for at least one child order detail to render address/payment info
    const firstChildId = order?.childOrders?.[0]?.id;
    const { data: firstChildDetail } = useOrderDetail(firstChildId || '', { enabled: !!firstChildId });

    if (isLoadingList) return <OrderDetailSkeleton />;
    if (isError || !order) return <div className="p-8 text-center text-slate-500 font-bold">Checkout Order Not Found</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="flex-shrink-0 bg-white border-b border-blue-100/50 px-8 py-6 shadow-sm relative overflow-hidden">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between relative z-10">
                    <div className="flex flex-col gap-2">
                        <Button variant="ghost" className="w-fit p-0 h-auto hover:bg-transparent text-slate-400 hover:text-slate-600 mb-2" onClick={() => navigate('/admin/orders')}>
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
                        </Button>
                        <div className="flex items-center gap-3">
                            <AdminStatusBadge status={order.status.toString()} />
                            <div className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase border border-primary/20">
                                Checkout Parent
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Order Batch <span className="text-slate-400 font-medium">#{order.checkoutOrderCode}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-8 border-l border-slate-100 pl-8 ml-4">
                        {(order.refundedAmount > 0 || order.refundingAmount > 0) && (
                            <div className="text-right px-6 border-r border-slate-100 flex flex-col justify-center">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5">Refund Asset Breakdown</p>
                                <div className="space-y-1">
                                    {order.refundingAmount > 0 && (
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-bold text-amber-600 leading-none">Refunding Products</span>
                                            <span className="text-sm font-black text-amber-500">{formatPrice(order.refundingAmount)}</span>
                                        </div>
                                    )}
                                    {order.refundedAmount > 0 && (
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-bold text-emerald-600 leading-none">Settled Capital</span>
                                            <span className="text-sm font-black text-emerald-500">{formatPrice(order.refundedAmount)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p>
                            <p className="text-xl font-black text-[#4988c4] tracking-tighter">{formatPrice(order.totalAmount)}</p>
                            <div className="flex items-center justify-end gap-2 mt-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Products: {formatPrice(totalProductPrice)}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Logistics: {formatPrice(totalShippingFee)}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                            <p className="text-sm font-bold text-slate-700">{formatDate(order.createdAt)}</p>
                        </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-[1200px] mx-auto space-y-8">
                    {/* General Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5 text-[#4988c4]" />
                                Payment & Transaction
                            </h3>
                            <PaymentInfoCard
                                orderCode={order.checkoutOrderCode}
                                paymentMethod={firstChildDetail?.paymentMethod || 'VnPay'}
                            />
                        </div>
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Truck className="w-3.5 h-3.5 text-[#4988c4]" />
                                Master Deployment Site
                            </h3>
                            {firstChildDetail ? (
                                <ShippingAddressCard
                                    fullName={firstChildDetail.receiverName}
                                    phone={firstChildDetail.phoneNumber}
                                    street={firstChildDetail.street}
                                    ward={firstChildDetail.ward}
                                    district={firstChildDetail.district}
                                    city={firstChildDetail.city}
                                />
                            ) : (
                                <div className="h-[140px] bg-slate-100 rounded-xl animate-pulse" />
                            )}
                        </div>
                    </div>

                    {/* Sub-orders Management */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5 text-[#4988c4]" />
                                Sub-Orders & Logistics ({order.childOrders.length})
                            </h3>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] font-bold uppercase tracking-widest text-[#4988c4] border-[#4988c4]/30 hover:bg-[#4988c4]/5"
                                onClick={() => setIsBulkAssignOpen(true)}
                                disabled={assignableChildOrderIds.length === 0}
                            >
                                <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Quick Bulk Assign
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {order.childOrders.map(child => (
                                <ChildOrderCard
                                    key={child.id}
                                    childOrderId={child.id}
                                    onAssign={setSelectedChildForAssign}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Assignment Dialog */}
            <AssignShippingStaffDialog
                isOpen={!!selectedChildForAssign}
                onClose={() => setSelectedChildForAssign(null)}
                orderId={selectedChildForAssign || undefined}
            />

            {/* Bulk Assignment Dialog */}
            <BulkAssignShippingStaffDialog
                isOpen={isBulkAssignOpen}
                onClose={() => setIsBulkAssignOpen(false)}
                orderIds={assignableChildOrderIds}
            />

        </div>
    );
}
