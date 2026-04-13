import { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  UserRound,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { tradeInOrderService } from '@/api/services';
import { tradeInOrderKeys, useConfirmTradeInDeal, useTransitionTradeInStatus } from '@/hooks/queries';
import { useStaffById, useStaffProfile } from '@/hooks/queries/useStaff';
import { usePermission } from '@/hooks/usePermission';
import type { TradeInOrderDetailResponse } from '@/api/types/tradeInOrder';
import { CancelTradeInOrderDialog } from '@/pages/admin/orders/components/CancelTradeInOrderDialog';
import { isTradeInActiveProgressStatus, isTradeInFinalStatus, normalizeTradeInStatus } from '@/utils/tradeInWorkflow';
import {
  ActiveProgressSection,
  FinalizedSection,
  NegotiatingSection,
  WaitingForStaffSection,
} from './TradeInStatusSections';
import { TradeInTelemetryPanel } from './TradeInTelemetryPanel';

interface TradeInStaffManagementProps {
  order: TradeInOrderDetailResponse;
}

interface Identifiable {
  id?: string;
  conversationId?: string;
}

const resolveAssignedStaffId = (order: TradeInOrderDetailResponse): string | undefined => {
  const rawOrder = order as unknown as Record<string, unknown>;
  const rawConversation = order.conversation as unknown as Record<string, unknown> | null | undefined;

  const candidates = [
    order.conversation?.staffId,
    typeof rawOrder.staffId === 'string' ? rawOrder.staffId : undefined,
    typeof rawOrder.staffID === 'string' ? rawOrder.staffID : undefined,
    typeof rawOrder.sellerId === 'string' ? rawOrder.sellerId : undefined,
    typeof rawOrder.assigneeId === 'string' ? rawOrder.assigneeId : undefined,
    rawConversation && typeof rawConversation.staffId === 'string' ? rawConversation.staffId : undefined,
    rawConversation && typeof rawConversation.staffID === 'string' ? rawConversation.staffID : undefined,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return undefined;
};

export function TradeInStaffManagement({ order }: TradeInStaffManagementProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAdmin, isManager, isSeller } = usePermission();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(order.tradeInPrice || 0);
  const status = useMemo(() => normalizeTradeInStatus(order.status), [order.status]);
  const assignedStaffId = useMemo(() => resolveAssignedStaffId(order), [order]);

  const canAccessTradeInChat = isSeller;
  const shouldShowAssignedStaff = isAdmin || isManager || !canAccessTradeInChat;
  const shouldFetchAssignedStaff = shouldShowAssignedStaff && !!assignedStaffId;

  const { data: assignedStaff, isLoading: isLoadingAssignedStaff } = useStaffById(assignedStaffId || '', {
    enabled: shouldFetchAssignedStaff,
  });
  const { data: currentStaffProfile } = useStaffProfile({ enabled: isSeller });

  const assignedStaffLabel = assignedStaff?.fullName || assignedStaff?.email || assignedStaffId || 'Unassigned';
  const assignedStaffEmail = assignedStaff?.email || '';
  const assignedStaffAvatar = assignedStaff?.avatarUrl || '';
  const assignedStaffInitial = useMemo(() => assignedStaffLabel.trim().charAt(0).toUpperCase() || '?', [assignedStaffLabel]);
  const currentSellerStaffId = currentStaffProfile?.staffId;
  const isCurrentSellerOwner = !!(isSeller && currentSellerStaffId && assignedStaffId && currentSellerStaffId === assignedStaffId);
  const isAssignedToOtherSeller = !!(isSeller && currentSellerStaffId && assignedStaffId && currentSellerStaffId !== assignedStaffId);

  const detailQueryKey = useMemo(() => tradeInOrderKeys.detail(order.tradeInOrderId), [order.tradeInOrderId]);

  const invalidateTradeInDetail = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: detailQueryKey });
  }, [detailQueryKey, queryClient]);

  const navigateToChat = useCallback((conversation?: Identifiable | null) => {
    const cid = conversation?.id || conversation?.conversationId;
    if (cid) {
      navigate(`/admin/chat?id=${cid}`);
      return;
    }
    navigate('/admin/chat');
  }, [navigate]);

  const { mutate: acceptTask, isPending: isAccepting } = useMutation({
    mutationFn: () => tradeInOrderService.createConversation(order.tradeInOrderId),
    onSuccess: async (conv) => {
      invalidateTradeInDetail();
      toast.success('Task accepted. Redirecting...');

      navigateToChat(conv as Identifiable);
    },
  });

  const { mutate: confirmDeal, isPending: isConfirming } = useConfirmTradeInDeal(order.tradeInOrderId);

  const { mutate: adminCancel, isPending: isCancelling } = useMutation({
    mutationFn: (reason: string) => tradeInOrderService.adminCancel(order.tradeInOrderId, reason),
    onSuccess: () => {
      setIsCancelDialogOpen(false);
      invalidateTradeInDetail();
      toast.success('Cancelled.');
    },
  });

  const { mutate: transitionStatus, isPending: isTransitioning } = useTransitionTradeInStatus(order.tradeInOrderId);

  const previewAmountToPay = useMemo(
    () => Math.max(0, (order.productVariant?.salePrice || 0) - negotiatedPrice - order.depositAmount),
    [order.depositAmount, order.productVariant?.salePrice, negotiatedPrice],
  );
  const formattedNegotiatedPrice = useMemo(
    () => (negotiatedPrice ? negotiatedPrice.toLocaleString('vi-VN') : ''),
    [negotiatedPrice],
  );
  const isActiveProgressStatus = isTradeInActiveProgressStatus(status);
  const isFinalizedStatus = isTradeInFinalStatus(status);
  const shouldShowTelemetryPanel = isAdmin || isManager;

  const handleTransitionStatus = useCallback((toStatus: string) => {
    if (isTransitioning) return;

    transitionStatus(
      { fromStatus: status, toStatus },
      {
        onSuccess: () => {
          toast.success('Status updated.');
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Unable to update status.');
        },
      },
    );
  }, [isTransitioning, status, transitionStatus]);

  const handleAcceptTask = useCallback(() => {
    acceptTask();
  }, [acceptTask]);

  const handleConfirmDeal = useCallback(() => {
    if (isConfirming) {
      return;
    }

    confirmDeal(
      { fromStatus: status, tradeInPrice: negotiatedPrice },
      {
        onSuccess: () => {
          toast.success('Confirmed.');
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Unable to confirm deal.');
        },
      },
    );
  }, [confirmDeal, isConfirming, negotiatedPrice, status]);

  const handleNegotiatedPriceChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setNegotiatedPrice(raw ? Number(raw) : 0);
  }, []);

  const handleOpenTradeInChat = useCallback(() => {
    navigateToChat(order.conversation as Identifiable);
  }, [navigateToChat, order.conversation]);

  const handleOpenCancelDialog = useCallback(() => {
    setIsCancelDialogOpen(true);
  }, []);

  const handleMarkArrived = useCallback(() => {
    handleTransitionStatus('PROCESSING');
  }, [handleTransitionStatus]);

  const handleCompleteSuccess = useCallback(() => {
    handleTransitionStatus('DELIVERED');
  }, [handleTransitionStatus]);

  const handleMarkCompleted = useCallback(() => {
    handleTransitionStatus('COMPLETED');
  }, [handleTransitionStatus]);

  return (
    <div className="space-y-4">
      {/* SECTION HEADER - Slimmer */}
      <div className="flex items-center gap-3 px-1">
        <div className="h-4 w-1 rounded-full bg-primary/40" />
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
          Staff Management
        </h3>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

        {isSeller && (
          <div
            className={cn(
              'px-4 py-3 border-b',
              isCurrentSellerOwner
                ? 'bg-emerald-50/60 border-emerald-100'
                : isAssignedToOtherSeller
                  ? 'bg-amber-50/60 border-amber-100'
                  : 'bg-slate-50/60 border-slate-100',
            )}
          >
            <div className="flex items-center gap-2">
              {isCurrentSellerOwner ? (
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <UserRound className="w-4 h-4 text-slate-500" />
              )}
              <p
                className={cn(
                  'text-[10px] font-black uppercase tracking-widest',
                  isCurrentSellerOwner
                    ? 'text-emerald-700'
                    : isAssignedToOtherSeller
                      ? 'text-amber-700'
                      : 'text-slate-500',
                )}
              >
                {isCurrentSellerOwner
                  ? 'This ticket belongs to you'
                  : isAssignedToOtherSeller
                    ? 'This ticket is assigned to another staff'
                    : 'This ticket is currently unassigned'}
              </p>
            </div>
          </div>
        )}

        {/* Assigned staff visibility for roles that cannot access chat */}
        {shouldShowAssignedStaff && (
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Task owner</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-500">
                {assignedStaffAvatar ? (
                  <img
                    src={assignedStaffAvatar}
                    alt={assignedStaffLabel}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="text-[10px] font-black">{assignedStaffInitial}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate">
                  {isLoadingAssignedStaff ? 'Loading staff...' : assignedStaffLabel}
                </p>
                {assignedStaffEmail ? (
                  <p className="text-[10px] text-slate-500 truncate">{assignedStaffEmail}</p>
                ) : assignedStaffId ? (
                  <p className="text-[10px] text-slate-400 font-mono truncate">ID: {assignedStaffId}</p>
                ) : (
                  <p className="text-[10px] text-slate-400">Unassigned</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* State: WAITING_FOR_STAFF - Compact Version */}
        {status === 'WAITING_FOR_STAFF' && (
          <WaitingForStaffSection
            canAccessTradeInChat={canAccessTradeInChat}
            isAccepting={isAccepting}
            onAcceptTask={handleAcceptTask}
          />
        )}

        {/* State: NEGOTIATING - Compact & Professional */}
        {status === 'NEGOTIATING' && (
          <NegotiatingSection
            previewAmountToPay={previewAmountToPay}
            formattedNegotiatedPrice={formattedNegotiatedPrice}
            onNegotiatedPriceChange={handleNegotiatedPriceChange}
            isConfirming={isConfirming}
            canAccessTradeInChat={canAccessTradeInChat}
            onOpenTradeInChat={handleOpenTradeInChat}
            onOpenCancelDialog={handleOpenCancelDialog}
            onConfirmDeal={handleConfirmDeal}
            assignedStaffHint={assignedStaff?.fullName || (assignedStaffId ? assignedStaffId.slice(0, 8) : 'Unassigned')}
          />
        )}

        {/* State: CONFIRMED, PROCESSING & DELIVERED - Streamlined */}
        {isActiveProgressStatus && (
          <ActiveProgressSection
            status={status}
            isTransitioning={isTransitioning}
            onMarkArrived={handleMarkArrived}
            onCompleteSuccess={handleCompleteSuccess}
            onMarkCompleted={handleMarkCompleted}
            onOpenCancelDialog={handleOpenCancelDialog}
          />
        )}

        {/* FINALIZED STATES */}
        {isFinalizedStatus && (
          <FinalizedSection status={status} />
        )}
      </div>

      {shouldShowTelemetryPanel && <TradeInTelemetryPanel />}

      <CancelTradeInOrderDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={adminCancel}
        isLoading={isCancelling}
        orderCode={order.orderCode}
      />
    </div>
  );
}
