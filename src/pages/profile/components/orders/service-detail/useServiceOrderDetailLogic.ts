import { useState, useMemo, useEffect, useCallback } from 'react';
import { useProfile } from '@/hooks/queries';
import {
    useCancelServiceOrder,
    useServiceOrderDetail,
    useReOrderFailedServiceOrder
} from '@/hooks/queries/useServiceOrder';
import {
    useCreateRating,
    useRatingByServiceOrder,
    useStaffRatingSummary,
    useUpdateRating
} from '@/hooks/queries/useRating';
import { useToast } from '@/hooks/useToast';
import type { RatingResponse } from '@/api/types/rating';
import type { ServiceOrderResponse } from '@/api/types/serviceOrder';
import { STATUS_THEME } from '../../../constants';

const RATING_CACHE_KEY = 'dreamguard-service-order-ratings';

const normalizePhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/\s+/g, '').replace(/^\+84/, '0');
};

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

const mapEmbeddedRating = (data?: Record<string, unknown>): RatingResponse | null => {
    if (!data) return null;
    const score = Number(data.ratingScore || data.score || 0);
    const comment = String(data.ratingComment || data.comment || '').trim();
    if (score > 0 || comment) {
        return { score, comment, createdAt: String(data.ratingDate || data.updatedAt || '') };
    }
    return null;
};

const toThemeKey = (status?: string) => {
    const s = (status || '').toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export function useServiceOrderDetailLogic(serviceOrderId: string, open: boolean, setOpen: (o: boolean) => void) {
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
    const { data, isPending } = useServiceOrderDetail(serviceOrderId, { enabled: canLoadDetail }) as { data: ServiceOrderResponse | undefined; isPending: boolean };

    const detailCustomerId = (data?.customerId || '').trim();
    const detailPhone = normalizePhone(data?.phoneNumber);

    const canView = !!data && (
        (currentCustomerId && detailCustomerId === currentCustomerId) ||
        (!currentCustomerId && !!currentPhone && detailPhone === currentPhone)
    );

    const normalizedOrderStatus = (data?.status || '').toLowerCase();
    const isCompletedOrder = normalizedOrderStatus === 'completed';
    const shouldLoadRating = open && canView && isCompletedOrder && !!serviceOrderId;

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

    useEffect(() => {
        if (!serviceOrderId || !resolvedRating) return;
        writeRatingCache(serviceOrderId, resolvedRating);
    }, [serviceOrderId, resolvedRating]);

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
    const cancelMutation = useCancelServiceOrder();
    const reOrderFailedServiceMutation = useReOrderFailedServiceOrder();

    const [score, setDraftScore] = useState<number>(5);
    const [comment, setDraftComment] = useState<string>('');
    const [prevRatingId, setPrevRatingId] = useState<string | undefined>(undefined);

    const ratingId = (resolvedRating as RatingResponse)?.ratingId || (resolvedRating as RatingResponse)?.id;

    // Direct state adjustment during render when remote data arrives/changes.
    // This is more performant than useEffect for syncing state.
    if (ratingId !== prevRatingId && resolvedRating) {
        setPrevRatingId(ratingId);
        setDraftScore(resolvedRating.score || 5);
        setDraftComment(resolvedRating.comment || '');
    }
    const isAlreadyRated = !!ratingId;
    const isSubmitting = createRatingMutation.isPending || updateRatingMutation.isPending;
    const isCancelling = cancelMutation.isPending;

    const paymentStatus = (data?.paymentStatus || '').toLowerCase();
    const canRetryPayment =
        data?.paymentMethod?.toLowerCase() === 'vnpay' &&
        paymentStatus !== 'paid' &&
        normalizedOrderStatus === 'pending';

    const handleRetryPayment = useCallback(async () => {
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
            // Error is handled by global interceptor
        }
    }, [serviceOrderId, reOrderFailedServiceMutation, toast]);

    const hasCheckIn = !!String(task?.checkIn || '').trim();

    const canCancelService = canView && (
        ['pending', 'confirmed', 'rescheduled'].includes(normalizedOrderStatus)
    ) && !hasCheckIn && ![
        'assigned', 'processing', 'inprogress', 'onroute', 'working',
        'completed', 'cancelled', 'canceled', 'forcedcancelled',
        'managercancel', 'managerforcecancel'
    ].includes(taskStatus.toLowerCase());

    const handleSubmitRating = useCallback(async () => {
        if (!isCompletedOrder) {
            toast.warning('You can rate staff only after service completion.');
            return;
        }

        const trimmedComment = comment.trim();
        if (!trimmedComment) {
            toast.warning('Please add a short review for the assigned staff.');
            return;
        }

        try {
            if (isAlreadyRated) {
                const updated = await updateRatingMutation.mutateAsync({
                    ratingId: ratingId!,
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
            const message = error instanceof Error ? error.message : 'Unable to submit rating.';
            toast.error('Rating submission failed.', message);
        }
    }, [isCompletedOrder, comment, score, isAlreadyRated, ratingId, serviceOrderId, updateRatingMutation, createRatingMutation, toast]);

    const handleCancelService = useCallback(() => {
        if (!canCancelService) return;
        setConfirmOpen(true);
    }, [canCancelService]);

    const handleConfirmCancel = useCallback(async () => {
        if (!canCancelService || !serviceOrderId) return;

        try {
            // Execute standard cancellation
            await cancelMutation.mutateAsync(serviceOrderId);

            toast.success('Cancellation Processed', 'The service order has been successfully cancelled.');
            setConfirmOpen(false);
            setOpen(false); // Close the detail dialog too for a clean exit
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to complete cancellation request.';
            toast.error('Operation Failed', message);
        }
    }, [cancelMutation, serviceOrderId, canCancelService, toast, setOpen]);

    const theme = STATUS_THEME[toThemeKey(data?.status)] || STATUS_THEME.Pending;
    const detailItems = data?.items || data?.orderDetails || data?.serviceOrderItems || [];

    return {
        // Data
        data,
        isPending,
        canView,
        theme,
        detailItems,
        taskStatus,
        hasAssignedStaff,
        ratedStaffName,
        assignedStaffPhone,
        displayAverage,
        resolvedRating,

        // Actions
        handleRetryPayment,
        handleCancelService,
        handleConfirmCancel,
        handleSubmitRating,
        canRetryPayment,
        canCancelService,

        // Modal State
        confirmOpen,
        setConfirmOpen,
        isCancelling,
        setOpen,

        // Rating State
        score,
        setDraftScore,
        comment,
        setDraftComment,
        isSubmitting,
        isAlreadyRated,
        isCompletedOrder,

        // Utils
        reOrderFailedServiceMutation
    };
}
