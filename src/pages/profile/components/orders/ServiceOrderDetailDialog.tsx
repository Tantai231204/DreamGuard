import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AdminStatusBadge } from '@/components/admin';
import { CalendarDays, MapPin, Phone, Package2, Star, AlertCircle, ShieldCheck, CreditCard, Clock, Briefcase, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/queries';
import { useCancelServiceOrder, useServiceOrderDetail, useReOrderFailedServiceOrder } from '@/hooks/queries/useServiceOrder';
import { useCreateRating, useRatingByServiceOrder, useStaffRatingSummary, useUpdateRating } from '@/hooks/queries/useRating';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatPrice, formatTime } from '../../utils';
import { STATUS_THEME } from '../../constants';
import { parseAddress } from '../../../../shared/utils/address/parseAddress';
import type { RatingResponse } from '@/api/types/rating';

interface ServiceOrderDetailDialogProps {
    serviceOrderId: string;
    orderCode?: string;
    trigger: React.ReactNode;
}

const RATING_CACHE_KEY = 'dreamguard-service-order-ratings';

function readRatingCache(): Record<string, RatingResponse> {
    if (typeof window === 'undefined') return {};

    try {
        const raw = window.localStorage.getItem(RATING_CACHE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as Record<string, RatingResponse>;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeRatingCache(serviceOrderId: string, rating: RatingResponse) {
    if (typeof window === 'undefined' || !serviceOrderId) return;

    const cache = readRatingCache();
    cache[serviceOrderId] = rating;

    try {
        window.localStorage.setItem(RATING_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // Ignore storage write errors.
    }
}

function mapEmbeddedRating(data?: Record<string, unknown>): RatingResponse | null {
    if (!data) return null;

    const embedded = (
        data.rating ||
        data.staffRating ||
        data.orderRating ||
        data.review
    ) as Record<string, unknown> | undefined;

    if (!embedded) return null;

    const score = Number(embedded.score || embedded.ratingScore || embedded.stars || 0);
    const comment = String(embedded.comment || embedded.feedback || '').trim();
    const id = String(embedded.id || embedded.ratingId || '').trim();

    if (!id && !comment && (!Number.isFinite(score) || score <= 0)) return null;

    return {
        id: id || undefined,
        ratingId: String(embedded.ratingId || embedded.id || '').trim() || undefined,
        score: Number.isFinite(score) && score > 0 ? score : undefined,
        comment: comment || undefined,
        staffName: String(embedded.staffName || '').trim() || undefined,
        createdAt: String(embedded.createdAt || '').trim() || undefined,
        updatedAt: String(embedded.updatedAt || '').trim() || undefined,
    };
}

function toThemeKey(status?: string) {
    if (!status) return 'Pending';
    const lower = status.toLowerCase();
    if (lower === 'cancelled' || lower === 'canceled' || lower === 'forcedcancelled') return 'Cancelled';
    if (lower === 'completed') return 'Completed';
    if (lower === 'confirmed') return 'Confirmed';
    if (lower === 'processing' || lower === 'inprogress') return 'Processing';
    return 'Pending';
}

function normalizePhone(phone?: string) {
    return (phone || '').replace(/\D/g, '');
}

function normalizeStatus(status?: string) {
    return String(status || '').trim().toLowerCase().replace(/[\s_-]/g, '');
}

export function ServiceOrderDetailDialog({ serviceOrderId, orderCode, trigger }: ServiceOrderDetailDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-xl border-none shadow-2xl bg-gray-50 [&>button:last-child]:top-6 [&>button:last-child]:right-6">
                <ServiceOrderDetailContent
                    key={serviceOrderId}
                    serviceOrderId={serviceOrderId}
                    orderCode={orderCode}
                    open={open}
                    setOpen={setOpen}
                />
            </DialogContent>
        </Dialog>
    );
}

function ServiceOrderDetailContent({
    serviceOrderId,
    orderCode,
    open,
    setOpen
}: {
    serviceOrderId: string;
    orderCode?: string;
    open: boolean;
    setOpen: (o: boolean) => void;
}) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const toast = useToast();
    const { data: profile } = useProfile();
    const [cachedRating, setCachedRating] = useState<RatingResponse | null>(() => {
        if (!serviceOrderId) return null;
        return readRatingCache()[serviceOrderId] || null;
    });

    const rawProfile = profile as Record<string, unknown> | undefined;
    const currentCustomerId = String(rawProfile?.customerId || rawProfile?.id || rawProfile?.userId || '').trim();
    const currentPhone = normalizePhone(String(rawProfile?.phoneNumber || ''));

    const canLoadDetail = open && !!serviceOrderId && (!!currentCustomerId || !!currentPhone);
    const { data, isPending } = useServiceOrderDetail(serviceOrderId, { enabled: canLoadDetail });

    const detailCustomerId = (data?.customerId || '').trim();
    const detailPhone = normalizePhone(data?.phoneNumber);

    const canView = !!data && (
        (currentCustomerId && detailCustomerId === currentCustomerId) ||
        (!currentCustomerId && !!currentPhone && detailPhone === currentPhone)
    );

    const isCompletedOrder = (data?.status || '').toLowerCase() === 'completed';
    const shouldLoadRating = open && canView && isCompletedOrder && !!serviceOrderId;
    const cancelMutation = useCancelServiceOrder();

    const task = data?.serviceTask || data?.task || data?.orderTask || data?.serviceOrderTask;
    const assignedStaff = data?.staff || data?.technician || null;
    const assignedStaffId = String(assignedStaff?.staffId || task?.staffId || '').trim();
    const assignedStaffNameFromOrder = String(assignedStaff?.fullName || '').trim();

    const { data: existingRating } = useRatingByServiceOrder(serviceOrderId, assignedStaffId, {
        enabled: shouldLoadRating && !!assignedStaffId,
    });

    const embeddedRating = useMemo(
        () => mapEmbeddedRating((data || undefined) as Record<string, unknown> | undefined),
        [data]
    );

    const resolvedRating = existingRating || embeddedRating || cachedRating;

    const ratedStaffName = assignedStaffNameFromOrder || resolvedRating?.staffName || 'Assigned Staff';
    const assignedStaffPhone = String(assignedStaff?.phoneNumber || '').trim();
    const hasAssignedStaff = !!assignedStaffId;
    const taskStatus = String(task?.status || '').trim();

    const { data: staffRatingSummary } = useStaffRatingSummary(assignedStaffId, {
        enabled: open && hasAssignedStaff,
    });

    const staffAverageStars = Number(staffRatingSummary?.averageStars || 0);
    const staffTotalRatings = Number(staffRatingSummary?.totalRatings || 0);
    const displayAverage = staffTotalRatings > 0 ? staffAverageStars.toFixed(1) : '0.0';

    const createRatingMutation = useCreateRating();
    const updateRatingMutation = useUpdateRating();

    const [draftScore, setDraftScore] = useState<number | null>(null);
    const [draftComment, setDraftComment] = useState<string | null>(null);

    // Persist to cache whenever resolvedRating changes
    useEffect(() => {
        if (!serviceOrderId || !resolvedRating) return;
        writeRatingCache(serviceOrderId, resolvedRating);
    }, [serviceOrderId, resolvedRating]);

    const existingScore = useMemo(() => {
        const raw = Number(resolvedRating?.score || 5);
        if (!Number.isFinite(raw)) return 5;
        return Math.max(1, Math.min(5, raw));
    }, [resolvedRating?.score]);

    const score = draftScore ?? existingScore;
    const comment = draftComment ?? (resolvedRating?.comment || '');

    const ratingId = useMemo(
        () => String(resolvedRating?.id || resolvedRating?.ratingId || '').trim(),
        [resolvedRating]
    );
    const isAlreadyRated = !!ratingId;

    const isSubmitting = createRatingMutation.isPending || updateRatingMutation.isPending;
    const isCancelling = cancelMutation.isPending;

    const normalizedOrderStatus = normalizeStatus(data?.status);
    const normalizedTaskStatus = normalizeStatus(task?.status);

    const reOrderFailedServiceMutation = useReOrderFailedServiceOrder();
    const paymentMethod = String(data?.paymentMethod || '').toLowerCase();
    const paymentStatus = String(data?.paymentStatus || '').toLowerCase();

    // Support combined COD Paid status for AdminStatusBadge
    const displayMethod = (paymentMethod === "cod" && paymentStatus === "paid")
        ? "CODPaid"
        : paymentMethod;

    const canRetryPayment = !!serviceOrderId && 
        paymentMethod.includes('vnpay') && 
        paymentStatus !== 'paid' && 
        normalizedOrderStatus === 'pending';

    const handleRetryPayment = async () => {
        if (!serviceOrderId) return;
        try {
            const response = await reOrderFailedServiceMutation.mutateAsync(serviceOrderId);
            const paymentUrl = typeof response?.paymentUrl === 'string' ? response.paymentUrl : '';
            if (paymentUrl) {
                window.location.assign(paymentUrl);
                return;
            }
            toast.warning('Unable to create payment link.', 'Please try again in a moment.');
        } catch {
            // Error is likely handled by global interceptor, 
            // but we keep the catch block for stability.
        }
    };

    const hasCheckIn = !!String(task?.checkIn || '').trim();

    // Customer can only cancel before service execution starts.
    const canCancelService = canView && (
        ['pending', 'confirmed'].includes(normalizedOrderStatus)
    ) && !hasCheckIn && ![
        'assigned',
        'processing',
        'inprogress',
        'onroute',
        'working',
        'completed',
        'cancelled',
        'canceled',
        'forcedcancelled',
        'managercancel',
        'managerforcecancel',
    ].includes(normalizedTaskStatus);
    const handleSubmitRating = async () => {
        if (!isCompletedOrder) {
            toast.warning('You can rate staff only after service completion.');
            return;
        }

        const trimmedComment = comment.trim();
        if (!trimmedComment) {
            toast.warning('Please add a short review for the assigned staff.');
            return;
        }

        if (!Number.isFinite(score) || score < 1 || score > 5) {
            toast.warning('Score must be between 1 and 5 stars.');
            return;
        }

        try {
            if (ratingId) {
                const updated = await updateRatingMutation.mutateAsync({
                    ratingId,
                    serviceOrderId,
                    payload: { score, comment: trimmedComment },
                });
                writeRatingCache(serviceOrderId, updated as RatingResponse);
                setCachedRating(updated as RatingResponse);
                toast.success('Rating updated successfully.');
            } else {
                const created = await createRatingMutation.mutateAsync({
                    serviceOrderId,
                    payload: { score, comment: trimmedComment },
                });
                writeRatingCache(serviceOrderId, created as RatingResponse);
                setCachedRating(created as RatingResponse);
                toast.success('Rating submitted successfully.');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to submit rating at the moment.';
            toast.error('Rating submission failed.', message);
        }
    };

    const handleCancelService = async () => {
        if (!canCancelService) return;
        setConfirmOpen(true);
    };

    const handleConfirmCancel = () => {
        cancelMutation.mutate(serviceOrderId, {
            onSuccess: () => {
                toast.success('Service Order Cancelled', `Order #${orderCode || serviceOrderId.slice(0, 8)} has been cancelled.`);
                setConfirmOpen(false);
            },
            onError: (error: unknown) => {
                const message = error instanceof Error ? error.message : 'Cancellation could not be processed.';
                toast.error('Request Denied', message);
            }
        });
    };

    const theme = STATUS_THEME[toThemeKey(data?.status)] || STATUS_THEME.Pending;
    const detailItems = data?.items || data?.orderDetails || data?.serviceOrderItems || [];

    return (
        <>
            {/* Header */}
            <div className="bg-white border-b border-gray-100 pl-6 pr-12 py-4 flex items-center justify-between shrink-0 relative">
                <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100" onClick={() => setOpen(false)}>
                        <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
                    </Button>
                    <div className="text-left w-full">
                        <DialogTitle className="text-[16px] font-black text-gray-900 uppercase tracking-tight">
                            Service Journey
                        </DialogTitle>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                            Order ID: {orderCode || data?.orderCode || serviceOrderId.slice(0, 8)}
                        </p>
                    </div>
                </DialogHeader>
                <div
                    className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white uppercase tracking-widest shadow-sm"
                    style={{ backgroundColor: theme.color }}
                >
                    {theme.label}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50">
                {isPending ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4 bg-white">
                        <div className="w-7 h-7 border-[3px] border-[#4988c4] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[12px] font-bold text-gray-400 tracking-wider uppercase">Loading secure details...</p>
                    </div>
                ) : !canView ? (
                    <div className="py-32 flex flex-col items-center justify-center text-center bg-white">
                        <AlertCircle className="w-12 h-12 text-gray-200 mb-4" />
                        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Access Restricted</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Summary Section */}
                        <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
                            <div className="bg-white p-6">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Created On</p>
                                <p className="text-[15px] font-bold text-slate-800 tracking-tight">
                                    {formatDate(data?.createdAt || '')}
                                </p>
                            </div>
                            <div className="bg-white p-6">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">Total Value</p>
                                <p className="text-xl font-black text-[#4988c4]">
                                    {formatPrice(data?.totalPrice || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Appointment Section */}
                        <div className="bg-white p-5 border-b border-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <CalendarDays className="w-3.5 h-3.5 text-[#4988c4]" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Appointment</h3>
                                        <p className="text-[14px] font-black text-gray-900 tracking-tight">
                                            {data?.appointmentDate ? formatDate(data.appointmentDate) : 'Pending Date'}
                                        </p>
                                        <div className="flex items-center gap-1.5 opacity-60">
                                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                                                {data?.appointmentDate ? formatTime(data.appointmentDate) : 'Time TBD'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 border-l border-gray-50 pl-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service Site</h3>
                                        <p className="text-[13px] font-bold text-gray-900 truncate max-w-[140px]">
                                            {data?.receiverName || 'Registered Client'}
                                        </p>
                                        <p className="text-[11px] font-medium text-slate-400 leading-tight line-clamp-1">
                                            {parseAddress(data?.address)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="bg-white">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
                                <Package2 className="w-4 h-4 text-gray-400" />
                                <span className="text-[14px] font-bold text-gray-800 tracking-tight">Consolidated Manifest</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {detailItems.length ? (
                                    detailItems.map((item, idx) => {
                                        const name = item.itemName || item.serviceName || item.packageName || `Service Item ${idx + 1}`;
                                        return (
                                            <div key={item.id || idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                <div className="space-y-0.5">
                                                    <p className="text-[13px] font-bold text-gray-900 leading-tight">{name}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty: {item.quantity || 1}</p>
                                                </div>
                                                <p className="text-[14px] font-black text-[#4988c4] tabular-nums tracking-tighter shrink-0">
                                                    {formatPrice(item.totalPrice || item.unitPrice || 0)}
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-12 text-center text-slate-300">
                                        <p className="text-[11px] font-black uppercase tracking-widest">No detailed items recorded</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Personnel Section */}
                        <div className="bg-white border-y border-gray-50">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2.5 text-emerald-600">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[13px] font-bold uppercase tracking-widest">Execution Staff</span>
                                </div>
                                <Badge className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                                    {taskStatus || 'Awaiting'}
                                </Badge>
                            </div>

                            {hasAssignedStaff ? (
                                <div className="p-5">
                                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 overflow-hidden shadow-sm uppercase font-black text-sm">
                                                {ratedStaffName.charAt(0)}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[14px] font-bold text-gray-900 tracking-tight">{ratedStaffName}</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Phone className="w-2.5 h-2.5" />
                                                        <span className="text-[11px] font-medium tracking-tight">{assignedStaffPhone || 'Secured'}</span>
                                                    </div>
                                                    <div className="bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-100/50">
                                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                                        <span className="text-[10px] font-black text-amber-700">{displayAverage}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {resolvedRating && (
                                        <div className="mt-4 p-5 rounded-xl border border-blue-100 bg-blue-50/30">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Service Evaluation</p>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((v) => (
                                                        <Star key={v} className={`w-3.5 h-3.5 ${v <= (resolvedRating?.score || 0) ? 'fill-blue-500 text-blue-500' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-[13px] text-slate-600 font-medium italic border-l-2 border-blue-200 pl-4 py-0.5 leading-relaxed">
                                                &ldquo;{resolvedRating?.comment || 'Exceptional work performed at the site.'}&rdquo;
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <Briefcase className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Optimizing staff assignment...</p>
                                </div>
                            )}
                        </div>

                        {/* Financial Oversight Section */}
                        <div className="bg-white p-5 border-y border-gray-50">
                            <div className="flex items-center gap-2 mb-4 text-[#4988c4]">
                                <CreditCard className="w-4 h-4" />
                                <h4 className="text-[11px] font-black uppercase tracking-widest">Financial Oversight</h4>
                            </div>

                            <div className="bg-slate-50/80 rounded-xl border border-slate-100/80 p-5">
                                <div className="flex items-end justify-between gap-6">
                                    <div className="flex gap-6">
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Method</p>
                                            <AdminStatusBadge 
                                                status={displayMethod} 
                                                mode="method"
                                                className="scale-90 origin-left"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment</p>
                                            <AdminStatusBadge 
                                                status={paymentStatus || "Pending"} 
                                                mode="payment"
                                                className="scale-90 origin-left"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Net Payable</p>
                                        <p className="text-[20px] font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                                            {formatPrice(data?.totalPrice || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interaction Module */}
                        {isCompletedOrder && (
                            <div className="bg-white p-8 border-t border-gray-50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Quality Audit</p>
                                        <h4 className="text-[18px] font-black text-gray-900 tracking-tight uppercase">Service Evaluation</h4>
                                    </div>
                                    <div className="flex gap-1 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                        {[1, 2, 3, 4, 5].map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => setDraftScore(v)}
                                                disabled={isSubmitting || isAlreadyRated}
                                                className="p-1 transition-transform hover:scale-125 focus:outline-none disabled:opacity-50"
                                            >
                                                <Star className={`w-7 h-7 ${v <= score ? 'fill-blue-500 text-blue-500 shadow-sm' : 'text-slate-200'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setDraftComment(e.target.value)}
                                        placeholder="Detailed feedback regarding quality and execution..."
                                        disabled={isSubmitting || isAlreadyRated}
                                        className="min-h-[140px] bg-slate-50/50 border-slate-100 rounded-xl p-6 text-[14px] font-medium text-slate-800 placeholder:text-slate-300 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                    />
                                    <div className="flex items-center justify-between px-1">
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            {comment.length} / 500 characters
                                        </p>
                                        <Button
                                            onClick={handleSubmitRating}
                                            disabled={isSubmitting || isAlreadyRated}
                                            className={cn(
                                                "px-10 h-11 rounded text-[11px] font-black uppercase tracking-widest transition-all",
                                                isAlreadyRated
                                                    ? "bg-slate-100 text-slate-400 border-0 cursor-not-allowed"
                                                    : "bg-[#4988c4] text-white hover:bg-[#3b6fa3] shadow-md shadow-blue-500/10 border-0"
                                            )}
                                        >
                                            {isAlreadyRated ? 'Indexed' : (isSubmitting ? 'Posting...' : 'Post Evaluation')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sticky Action Footer */}
            <div className="px-10 py-6 border-t border-gray-100 bg-white flex items-center justify-between gap-8 shrink-0 relative z-20">
                <div className="flex flex-col gap-0.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight leading-none">Concierge Support</p>
                    <button
                        onClick={() => window.alert("Initiating secure channel to support...")}
                        className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest hover:underline flex items-center gap-1.5"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Priority Chat
                    </button>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {canRetryPayment && (
                        <Button
                            onClick={handleRetryPayment}
                            disabled={reOrderFailedServiceMutation.isPending}
                            className="h-11 px-10 rounded text-[11px] font-black uppercase tracking-widest bg-[#4988c4] hover:bg-[#3b6fa3] text-white shadow-md shadow-blue-500/10 border-0 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {reOrderFailedServiceMutation.isPending ? 'Redirecting...' : 'Retry Payment'}
                        </Button>
                    )}
                    {canCancelService && !isPending && (
                        <Button
                            variant="ghost"
                            onClick={handleCancelService}
                            disabled={isCancelling}
                            className="h-11 px-6 text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 uppercase tracking-widest transition-all border-0"
                        >
                            {isCancelling ? "Processing..." : "Cancel Service"}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="h-11 px-10 rounded text-[11px] font-black text-[#4988c4] border border-[#4988c4] hover:bg-[#4988c4] hover:text-white uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                    >
                        Close
                    </Button>
                </div>
            </div>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Cancel Service Order"
                description={`Are you sure you want to cancel service order #${orderCode || serviceOrderId.slice(0, 8)}? This action cannot be undone.`}
                confirmText="Yes, Cancel Service"
                cancelText="No, Keep It"
                onConfirm={handleConfirmCancel}
                variant="danger"
                isLoading={isCancelling}
            />
        </>
    );
}
