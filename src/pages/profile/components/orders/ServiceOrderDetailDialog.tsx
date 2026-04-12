import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, MapPin, Phone, Package2, Star, AlertCircle, ShieldCheck, Wallet, CreditCard, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/queries';
import { useCancelServiceOrder, useServiceOrderDetail } from '@/hooks/queries/useServiceOrder';
import { useCreateRating, useRatingByServiceOrder, useStaffRatingSummary, useUpdateRating } from '@/hooks/queries/useRating';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatPrice } from '../../utils';
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

    const { data: existingRating, isPending: isRatingPending } = useRatingByServiceOrder(serviceOrderId, assignedStaffId, {
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
    const canRateAssignedStaff = !!serviceOrderId && isCompletedOrder;

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

        const confirmed = window.confirm('Are you sure you want to cancel this service order?');
        if (!confirmed) return;

        try {
            await cancelMutation.mutateAsync(serviceOrderId);
            toast.success('Service order has been cancelled.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to cancel service order at the moment.';
            toast.error('Cancel service failed.', message);
        }
    };

    const theme = STATUS_THEME[toThemeKey(data?.status)] || STATUS_THEME.Pending;
    const detailItems = data?.items || data?.orderDetails || data?.serviceOrderItems || [];

    return (
        <>
            {/* Header */}
            <div className="bg-white border-b border-gray-100 pl-6 pr-12 py-4 flex items-center justify-between shrink-0 relative">
                <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div className="text-left w-full pl-2">
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
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {isPending ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4 bg-gray-50">
                        <div className="w-7 h-7 border-[3px] border-[#4988c4] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[12px] font-bold text-gray-400 tracking-wider uppercase">Loading secure details...</p>
                    </div>
                ) : !canView ? (
                    <div className="py-32 flex flex-col items-center justify-center text-center bg-gray-50">
                        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Access Restricted</p>
                    </div>
                ) : (
                    <div className="space-y-4 p-4 md:p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white flex flex-col justify-center p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">Created On</p>
                                <p className="text-base font-bold text-slate-800 tracking-tight">{formatDate(data?.createdAt || '')}</p>
                            </div>
                            <div className="rounded-2xl border border-blue-100/60 bg-gradient-to-br from-blue-50/50 to-primary-50/30 flex flex-col justify-center p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500/80 mb-1 flex items-center gap-1.5">Total Value</p>
                                <p className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-primary-700">
                                    {formatPrice(data?.totalPrice || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Appointment & Location (Unified) */}
                        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-50 shadow-sm overflow-hidden">
                            <div className="p-6 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <CalendarDays className="w-5 h-5 text-[#4988c4]" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Scheduled Appointment</h3>
                                    <p className="text-[17px] font-black text-gray-900 tracking-tight">
                                        {data?.appointmentDate ? formatDate(data.appointmentDate) : 'Pending Schedule'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Service Location</h3>
                                    <div className="space-y-1">
                                        {data?.receiverName && <p className="text-[16px] font-bold text-gray-900">{data.receiverName}</p>}
                                        <p className="text-[14px] font-medium text-gray-500">{data?.phoneNumber || 'No phone provided'}</p>
                                        <p className="text-[14px] font-medium text-gray-600 leading-relaxed max-w-lg">
                                            {parseAddress(data?.address)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service Items (Compact) */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5">
                                <Package2 className="w-4 h-4 text-gray-400" />
                                <span className="text-[14px] font-bold text-gray-800 tracking-tight">Included Services</span>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {detailItems.length ? (
                                    detailItems.map((item, idx) => {
                                        const name = item.itemName || item.serviceName || item.packageName || `Service item ${idx + 1}`;
                                        return (
                                            <div key={item.id || idx} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                                                <div className="space-y-1">
                                                    <p className="text-[15px] font-bold text-gray-900 leading-tight">{name}</p>
                                                    <p className="text-[12px] font-black text-gray-400 uppercase tracking-tighter">Quantity: {item.quantity || 1}</p>
                                                </div>
                                                <p className="text-[16px] font-black text-[#4988c4] tabular-nums tracking-tighter">
                                                    {formatPrice(item.totalPrice || item.unitPrice || 0)}
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-12 text-center">
                                        <p className="text-[13px] font-bold text-gray-300 uppercase tracking-widest">No items found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assigned Staff */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2.5 text-emerald-600">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[14px] font-bold uppercase tracking-widest">Technician Assigned</span>
                                </div>
                                <Badge className={`bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-none`}>
                                    {taskStatus || 'Pending'}
                                </Badge>
                            </div>

                            {hasAssignedStaff ? (
                                <div className="p-6 space-y-4">
                                    <div className="bg-slate-50/50 rounded-2xl p-5 flex items-center justify-between border border-slate-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full border-2 border-white shadow-sm bg-white overflow-hidden flex items-center justify-center">
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <span className="text-xl font-bold">{ratedStaffName.charAt(0).toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[17px] font-black text-gray-900 tracking-tight">{ratedStaffName}</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        <span className="text-[13px] font-bold tracking-tight">{assignedStaffPhone || '0938757121'}</span>
                                                    </div>
                                                    <div className="bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-100">
                                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                        <span className="text-[11px] font-black text-amber-700">{displayAverage} ({staffTotalRatings})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {resolvedRating && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 relative overflow-hidden">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Your Evaluation</p>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((value) => (
                                                        <Star
                                                            key={`staff-preview-${value}`}
                                                            className={`h-3.5 w-3.5 ${value <= Number(resolvedRating.score || 0) ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {resolvedRating.comment ? (
                                                <p className="text-[13px] text-slate-700 italic border-l-2 border-amber-300 pl-3 py-0.5">&ldquo;{resolvedRating.comment}&rdquo;</p>
                                            ) : (
                                                <p className="text-[13px] text-slate-400 italic">Rated without a comment.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-10 text-center">
                                    <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Assigning Best Expert...</p>
                                </div>
                            )}
                        </div>

                        {/* Billing Overview (Unified) */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
                            <div className="flex items-center gap-2 text-[#4988c4] mb-2">
                                <CreditCard className="w-5 h-5" />
                                <h4 className="text-[14px] font-black uppercase tracking-[0.2em]">Billing Overview</h4>
                            </div>

                            <div className="border-t border-slate-50 pt-4 space-y-4">
                                {/* Payment Info Card */}
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Settlement Via</p>
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-100 shadow-sm w-fit">
                                                    {String(data?.paymentMethod).toUpperCase().includes("VNPAY") ? (
                                                        <img src={`${import.meta.env.BASE_URL}images/vnpay.svg`} alt="VNPay" className="w-4 h-4 object-contain" />
                                                    ) : String(data?.paymentMethod).toUpperCase() === 'COD' ? (
                                                        <img src={`${import.meta.env.BASE_URL}images/cod.svg`} alt="COD" className="w-4 h-4 object-contain" />
                                                    ) : (
                                                        <Wallet className="w-4 h-4 text-[#4988c4]" />
                                                    )}
                                                    <span className="text-[12px] font-black uppercase tracking-tight text-gray-700">
                                                        {data?.paymentMethod === 'COD' ? 'COD' :
                                                            data?.paymentMethod?.toUpperCase().includes('VNPAY') ? 'VNPay' :
                                                                data?.paymentMethod}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Current Status</p>
                                                <div className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm w-fit bg-white",
                                                    data?.paymentStatus === "Paid" ? "text-emerald-600 border-emerald-100" :
                                                        ["Failed", "Cancelled"].includes(data?.paymentStatus || "") ? "text-rose-600 border-rose-100" :
                                                            "text-amber-600 border-amber-100"
                                                )}>
                                                    {data?.paymentStatus === "Paid" ? <CheckCircle2 className="w-4 h-4" /> :
                                                        ["Failed", "Cancelled"].includes(data?.paymentStatus || "") ? <XCircle className="w-4 h-4" /> :
                                                            <MinusCircle className="w-4 h-4" />}
                                                    <span className="text-[11px] font-black uppercase tracking-widest">
                                                        {data?.paymentStatus === "Paid" ? "Transaction Paid" :
                                                            ["Failed", "Cancelled"].includes(data?.paymentStatus || "") ? `Payment ${data?.paymentStatus}` :
                                                                "Payment Required"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sm:text-right border-t border-slate-200/60 sm:border-0 pt-4 sm:pt-0 space-y-1">
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Total Payable</p>
                                            <p className="text-[32px] font-black text-gray-900 tabular-nums tracking-tighter leading-none">
                                                {formatPrice(data?.totalPrice || 0)}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">Incl. processing fees & tax</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Note */}
                                {(data?.customerNote || data?.note) && (
                                    <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5 space-y-2">
                                        <div className="flex items-center gap-2 text-amber-700">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-[12px] font-black uppercase tracking-widest">Customer Note</span>
                                        </div>
                                        <p className="text-[14px] text-slate-700 font-medium italic pl-1 leading-relaxed">
                                            &ldquo;{data.customerNote || data.note}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rating Section (Action Card) */}
                        {isCompletedOrder && (
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-[14px] font-bold text-gray-800 tracking-tight">Service Quality Review</span>
                                    </div>
                                    <Badge variant="outline" className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-400">
                                        {ratingId ? 'Evaluated' : 'Waiting Feedback'}
                                    </Badge>
                                </div>

                                <div className="p-6">
                                    {isRatingPending ? (
                                        <div className="h-32 animate-pulse bg-slate-50 rounded-xl" />
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[15px] font-bold text-gray-900 leading-tight">Rate your experience</p>
                                                    <p className="text-[12px] font-medium text-gray-400 tracking-tight">How was <span className="text-[#4988c4]">{canRateAssignedStaff ? ratedStaffName : 'the expert'}</span>?</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                                    {[1, 2, 3, 4, 5].map((v) => (
                                                        <button
                                                            key={v}
                                                            type="button"
                                                            className="p-1.5 transition-transform hover:scale-125 focus:outline-none disabled:cursor-not-allowed"
                                                            onClick={() => setDraftScore(v)}
                                                            disabled={isSubmitting || isAlreadyRated}
                                                        >
                                                            <Star className={`h-7 w-7 ${v <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Textarea
                                                    value={comment}
                                                    onChange={(e) => setDraftComment(e.target.value)}
                                                    placeholder="Share your thoughts about the service quality..."
                                                    className="min-h-[120px] bg-slate-50/50 border-slate-100 focus:border-[#4988c4] transition-colors rounded-xl text-[14px] font-medium"
                                                    disabled={isSubmitting || isAlreadyRated}
                                                />
                                                <div className="flex justify-between items-center px-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{comment.length} / 500 characters</p>
                                                    <Button
                                                        onClick={handleSubmitRating}
                                                        disabled={isSubmitting || isAlreadyRated}
                                                        className={`px-8 h-10 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg transition-all ${isAlreadyRated ? 'bg-slate-100 text-slate-400' : 'bg-[#4988c4] text-white hover:bg-[#3b6fa3] shadow-blue-500/20'}`}
                                                    >
                                                        {isAlreadyRated ? 'Rating Submitted' : (isSubmitting ? 'Posting...' : 'Submit Feedback')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* Sticky Footer */}
            <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex flex-col items-start gap-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Need more help?</span>
                    <button
                        className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest hover:underline flex items-center gap-1.5"
                        onClick={() => window.alert("Connecting to a dedicated agent...")}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Chat with Senior Assistant
                    </button>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-auto">
                    {canCancelService && !isPending && (
                        <Button
                            variant="ghost"
                            className="h-11 px-6 text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 uppercase tracking-widest transition-all"
                            onClick={handleCancelService}
                            disabled={isCancelling}
                        >
                            {isCancelling ? "Cancelling..." : "Cancel Service"}
                        </Button>
                    )}
                    <Button
                        className="h-11 px-10 rounded-xl text-[11px] font-black tracking-widest text-[#4988c4] border border-[#4988c4] hover:bg-[#4988c4] hover:text-white uppercase shadow-sm transition-all active:scale-95 disabled:opacity-70"
                        onClick={() => setOpen(false)}
                        variant="outline"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </>
    );
}
