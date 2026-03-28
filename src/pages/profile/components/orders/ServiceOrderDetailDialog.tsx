import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, MapPin, Phone, Package2, CreditCard, Star } from 'lucide-react';
import { useProfile } from '@/hooks/queries';
import { useServiceOrderDetail } from '@/hooks/queries/useServiceOrder';
import { useCreateRating, useRatingByServiceOrder, useUpdateRating } from '@/hooks/queries/useRating';
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

export function ServiceOrderDetailDialog({ serviceOrderId, orderCode, trigger }: ServiceOrderDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const { data: profile } = useProfile();
  const [cachedRating, setCachedRating] = useState<RatingResponse | null>(null);

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

  const task = data?.serviceTask || data?.task || data?.orderTask || data?.serviceOrderTask;
  const assignedStaff = data?.staff || data?.technician || null;
  const assignedStaffId = String(assignedStaff?.staffId || task?.staffId || '').trim();
  const assignedStaffNameFromOrder = String(assignedStaff?.fullName || '').trim();

  const { data: existingRating, isPending: isRatingPending } = useRatingByServiceOrder(serviceOrderId, {
    enabled: shouldLoadRating,
  });

  const embeddedRating = useMemo(
    () => mapEmbeddedRating((data || undefined) as Record<string, unknown> | undefined),
    [data]
  );

  const resolvedRating = existingRating || embeddedRating || cachedRating;

  const ratedStaffName = assignedStaffNameFromOrder || resolvedRating?.staffName || 'Assigned Staff';
  const assignedStaffPhone = String(assignedStaff?.phoneNumber || '').trim();
  const assignedStaffPosition = String(assignedStaff?.position || '').trim();
  const hasAssignedStaff = !!assignedStaffId;
  const taskStatus = String(task?.status || '').trim();
  const canRateAssignedStaff = !!serviceOrderId && isCompletedOrder;

  const createRatingMutation = useCreateRating();
  const updateRatingMutation = useUpdateRating();

  const [draftScore, setDraftScore] = useState<number | null>(null);
  const [draftComment, setDraftComment] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceOrderId) {
      setCachedRating(null);
      return;
    }

    const cache = readRatingCache();
    setCachedRating(cache[serviceOrderId] || null);
  }, [serviceOrderId]);

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

  const theme = STATUS_THEME[toThemeKey(data?.status)] || STATUS_THEME.Pending;
  const detailItems = data?.items || data?.orderDetails || data?.serviceOrderItems || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200 p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-lg font-bold text-slate-900">
              Service Order #{orderCode || data?.orderCode || serviceOrderId.slice(0, 8)}
            </DialogTitle>
            <Badge
              variant="secondary"
              className="w-fit px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none"
              style={{ backgroundColor: `${theme.color}14`, color: theme.color }}
            >
              {theme.label}
            </Badge>
          </div>
        </DialogHeader>

        {isPending ? (
          <div className="py-16 text-center text-sm text-slate-500 font-medium">Loading service order details...</div>
        ) : !canView ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-rose-600">Access denied for this service order.</p>
            <p className="text-xs text-slate-500 mt-1">You can only view service orders created by your account.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Created At</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{formatDate(data?.createdAt || '')}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{formatPrice(data?.totalPrice || 0)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 p-4 space-y-3 bg-blue-50/30">
              <div className="flex items-center gap-2 text-slate-700">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold">Appointment: {data?.appointmentDate ? formatDate(data.appointmentDate) : 'Not scheduled'}</span>
              </div>
              <div className="border-t border-blue-100 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Receiver Information</p>
                <div className="space-y-2">
                  {data?.receiverName && <p className="text-sm text-slate-700"><span className="text-slate-500">Name:</span> {data.receiverName}</p>}
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{data?.phoneNumber || 'No phone number'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 mt-0.5 text-slate-500 flex-shrink-0" />
<span className="text-sm">{parseAddress(data?.address)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Package2 className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-900">Service Items</h4>
              </div>

              {detailItems.length ? (
                <div className="space-y-2">
                  {detailItems.map((item, idx) => {
                    const name = item.itemName || item.serviceName || item.packageName || `Service item ${idx + 1}`;
                    return (
                      <div key={item.id || idx} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/40 px-3 py-2.5">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{name}</p>
                          <p className="text-[11px] text-slate-500">Qty: {item.quantity || 1}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{formatPrice(item.totalPrice || item.unitPrice || 0)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No service items found in this order.</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-sm font-bold text-slate-900">Assigned Staff</h4>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-slate-200 text-slate-600">
                  {hasAssignedStaff ? 'Assigned' : 'Pending Assignment'}
                </Badge>
              </div>

              {hasAssignedStaff ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-500">Name:</span> <span className="font-semibold">{ratedStaffName}</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-500">Phone:</span> {assignedStaffPhone || 'Updating...'}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="text-slate-500">Position:</span> {assignedStaffPosition || 'Service Staff'}
                  </p>
                  {taskStatus && (
                    <p className="text-sm text-slate-700">
                      <span className="text-slate-500">Task Status:</span> {taskStatus}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No staff has been assigned to this service order yet.</p>
              )}

              {resolvedRating && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Your Submitted Rating</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={`staff-preview-${value}`}
                        className={`h-4 w-4 ${value <= Number(resolvedRating.score || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                    <span className="text-xs font-semibold text-slate-600">
                      {Math.max(1, Math.min(5, Number(resolvedRating.score || 0) || 0)) || '-'}/5
                    </span>
                  </div>
                  {resolvedRating.comment && (
                    <p className="text-sm text-slate-700">{resolvedRating.comment}</p>
                  )}
                </div>
              )}
            </div>

            {data?.paymentMethod && (
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  <h4 className="text-sm font-bold text-slate-900">Payment Information</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Method:</span>
                    <Badge variant="outline" className="text-xs font-semibold">{data.paymentMethod === 'COD' ? 'Cash on Delivery' : data.paymentMethod}</Badge>
                  </div>
                  {data?.paymentStatus && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Status:</span>
                      <Badge 
                        style={{
                          backgroundColor: data.paymentStatus === 'Paid' ? '#d1fae5' : '#fef3c7',
                          color: data.paymentStatus === 'Paid' ? '#065f46' : '#92400e',
                        }}
                        className="text-xs font-semibold border-none"
                      >
                        {data.paymentStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(data?.customerNote || data?.note) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">Customer Note</p>
                <p className="text-sm text-amber-800">{data.customerNote || data.note}</p>
              </div>
            )}

            {isCompletedOrder && (
              <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-slate-900">Staff Rating</h4>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-slate-200 text-slate-600">
                    {ratingId ? 'Staff Rated' : 'Pending Staff Rating'}
                  </Badge>
                </div>

                {isRatingPending ? (
                  <p className="text-sm text-slate-500">Loading staff rating...</p>
                ) : (
                  <>
                    <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Staff</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {canRateAssignedStaff ? ratedStaffName : 'No staff assigned yet'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const active = value <= score;
                        return (
                          <button
                            key={value}
                            type="button"
                            className="rounded-md p-1 transition hover:bg-amber-50"
                            aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                            onClick={() => setDraftScore(value)}
                            disabled={isSubmitting || !canRateAssignedStaff || isAlreadyRated}
                          >
                            <Star
                              className={`h-5 w-5 ${active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            />
                          </button>
                        );
                      })}
                      <span className="text-xs font-semibold text-slate-500 ml-1">{score}/5</span>
                    </div>

                    <Textarea
                      value={comment}
                      onChange={(event) => setDraftComment(event.target.value)}
                      placeholder="Share your experience with this staff..."
                      className="min-h-[96px] border-slate-200"
                      maxLength={500}
                      disabled={isSubmitting || !canRateAssignedStaff || isAlreadyRated}
                    />

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] text-slate-500">{comment.trim().length}/500 characters</p>
                      <Button
                        type="button"
                        onClick={handleSubmitRating}
                        disabled={isSubmitting || !canRateAssignedStaff || isAlreadyRated}
                        className="h-9 rounded-lg px-4 text-xs font-bold uppercase tracking-wider"
                      >
                        {isAlreadyRated ? 'Already Rated' : (isSubmitting ? 'Saving...' : 'Submit Rating')}
                      </Button>
                    </div>

                    {isAlreadyRated && (
                      <p className="text-xs font-medium text-slate-500">
                        This service order has already been rated and is now read-only.
                      </p>
                    )}

                    {!hasAssignedStaff && (
                      <p className="text-xs font-medium text-amber-700">
                        Staff detail is still syncing. You can still submit your rating for this completed order.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* <div className="pt-1">
              <Button variant="outline" className="w-full rounded-xl border-slate-200" type="button">
                Close
              </Button>
            </div> */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
