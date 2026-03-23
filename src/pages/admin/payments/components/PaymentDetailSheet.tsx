import {
    Receipt,
    Calendar,
    CreditCard,
    Hash,
    Clock,
    Printer,
    ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AdminStatusBadge } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usePaymentDetail } from '@/hooks/queries/usePayment';
import { formatPrice } from '@/pages/profile/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDateTime } from '@/lib/utils';

interface PaymentDetailSheetProps {
    id: string | null;
    onClose: () => void;
}
export function PaymentDetailSheet({ id, onClose }: PaymentDetailSheetProps) {
    const { data: payment, isLoading } = usePaymentDetail(id || '');
    const isOpen = !!id;
    const navigate = useNavigate();
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-2xl shadow-2xl gap-0 bg-white">
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                <Receipt className="h-5 w-5" />
                            </div>
                            <DialogHeader className="p-0 text-left">
                                <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                                    Transaction Detail
                                </DialogTitle>
                                {!isLoading && payment && (
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Ref: {payment.id.split('-')[0].toUpperCase()}
                                    </div>
                                )}
                            </DialogHeader>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            {payment && !isLoading && (
                                <AdminStatusBadge status={payment.status} mode="payment" />
                            )}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto max-h-[75vh]">
                        {isLoading ? (
                            <LoadingView />
                        ) : payment ? (
                            <div className="space-y-0 text-left">
                                {/* Amount Section */}
                                <div className="p-10 text-center bg-slate-50/50">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Amount</div>
                                    <div className="text-4xl font-black text-slate-900 tracking-tighter">
                                        {formatPrice(payment.amount)}
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Info Groups */}
                                    <div className="space-y-4">
                                        <InfoGroup title="Payment Information">
                                            <InfoItem
                                                label="Payment Method"
                                                value={payment.paymentMethod}
                                                icon={CreditCard}
                                                showAsBadge
                                            />
                                            <InfoItem
                                                label="Order Code"
                                                value={payment.orderCode}
                                                icon={Hash}
                                                isLink
                                                onClick={() => {
                                                    navigate(`/admin/orders/${payment.pOrderId}`);
                                                    onClose();
                                                }}
                                            />
                                        </InfoGroup>

                                        <Separator className="bg-slate-100" />

                                        <InfoGroup title="Timeline">
                                            <InfoItem
                                                label="Transaction Time"
                                                value={formatDateTime(payment.createdAt)}
                                                icon={Calendar}
                                            />
                                            <InfoItem
                                                label="Last Modified"
                                                value={formatDateTime(payment.updatedAt)}
                                                icon={Clock}
                                            />
                                        </InfoGroup>

                                        <Separator className="bg-slate-100" />

                                        <InfoGroup title="Admin Notes">
                                            <div className="mt-2 p-4 rounded-xl bg-slate-50 border border-slate-100 text-[13px] text-slate-600 leading-relaxed font-medium">
                                                {payment.description || "No specific transaction notes provided for this transaction."}
                                            </div>
                                        </InfoGroup>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white border-t flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-xl font-bold h-12 text-slate-600 border-slate-200 hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                            onClick={onClose}
                        >
                            Dismiss
                        </Button>
                        <Button
                            variant="premium"
                            className="flex-1 rounded-xl font-bold h-12 gap-2 flex items-center justify-center"
                        >
                            <Printer className="h-4 w-4 relative z-10" />
                            <span className="relative z-10">Print Receipt</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{title}</h3>
            <div className="space-y-1 text-left">
                {children}
            </div>
        </div>
    );
}

function InfoItem({ label, value, icon: Icon, isLink, onClick, showAsBadge }: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    isLink?: boolean;
    onClick?: () => void;
    showAsBadge?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-between p-2.5 rounded-xl transition-all",
                isLink ? "cursor-pointer hover:bg-blue-50/50 group" : ""
            )}
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Icon className="h-4 w-4" />
                </div>
                <span className="text-[13px] font-bold text-slate-500">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {showAsBadge ? (
                    <AdminStatusBadge
                        status={value}
                        type="neutral"
                        className="bg-slate-100/50 border-slate-200"
                    />
                ) : (
                    <span className={cn(
                        "text-sm font-black tracking-tight",
                        isLink ? "text-blue-600" : "text-slate-900"
                    )}>
                        {value}
                    </span>
                )}
                {isLink && <ChevronRight className="h-4 w-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />}
            </div>
        </div>
    );
}

function LoadingView() {
    return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
        </div>
    );
}
