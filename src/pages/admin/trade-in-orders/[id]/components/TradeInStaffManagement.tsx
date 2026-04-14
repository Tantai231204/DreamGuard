import { memo } from 'react';
import {
  UserRound,
  BadgeCheck,
  Truck,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { TradeInOrderDetailResponse } from '@/api/types/tradeInOrder';
import { CancelTradeInOrderDialog } from '@/pages/admin/orders/components/CancelTradeInOrderDialog';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AssignShippingStaffDialog } from '@/pages/admin/orders/components/AssignShippingStaffDialog';
import {
  ActiveProgressSection,
  FinalizedSection,
  NegotiatingSection,
  WaitingForStaffSection,
} from './TradeInStatusSections';
import { TradeInProcessExchangeDialog } from './TradeInProcessExchangeDialog';
import { TradeInProcessReturnDialog } from './TradeInProcessReturnDialog';
import { TradeInDeliveryQuickActionsCard } from './TradeInDeliveryQuickActionsCard';
import { TradeInShippingAssignmentCard } from './TradeInShippingAssignmentCard';
import { useTradeInStaffManagement } from './useTradeInStaffManagement';

interface TradeInStaffManagementProps {
  order: TradeInOrderDetailResponse;
}

export const TradeInStaffManagement = memo(function TradeInStaffManagement({ order }: TradeInStaffManagementProps) {
  const {
    status,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    isCompleteConfirmDialogOpen,
    setIsCompleteConfirmDialogOpen,
    isAssignDialogOpen,
    isProcessReturnDialogOpen,
    isProcessExchangeDialogOpen,
    isSeller,
    canAccessTradeInChat,
    shouldShowAssignedStaff,
    assignedStaffLabel,
    assignedStaffHint,
    assignedStaffEmail,
    assignedStaffAvatar,
    assignedStaffInitial,
    isLoadingAssignedStaff,
    assignedStaffId,
    deliveryOwnerLabel,
    deliveryOwnerEmail,
    deliveryOwnerAvatar,
    deliveryOwnerInitial,
    deliveryOwnerStaffId,
    isLoadingDeliveryOwner,
    isCurrentSellerOwner,
    isAssignedToOtherSeller,
    isAccepting,
    isConfirming,
    isCancelling,
    isTransitioning,
    previewAmountToPay,
    formattedNegotiatedPrice,
    isActiveProgressStatus,
    isFinalizedStatus,
    canFinalizeTradeIn,
    canHandleUnhappyCase,
    canProcessReturningUnhappy,
    canAssignDeliveryTask,
    activeShippingTaskId,
    returningShippingTaskId,
    defaultProductVariantId,
    handleAcceptTask,
    handleConfirmDeal,
    handleNegotiatedPriceChange,
    handleOpenTradeInChat,
    handleOpenCancelDialog,
    handleFinalizeTradeIn,
    handleConfirmFinalizeTradeIn,
    handleCloseCompleteConfirmDialog,
    handleOpenAssignDialog,
    handleOpenProcessReturnDialog,
    handleOpenProcessExchangeDialog,
    handleCloseAssignDialog,
    handleCloseProcessReturnDialog,
    handleCloseProcessExchangeDialog,
    adminCancel,
  } = useTradeInStaffManagement(order);

  const showDeliveryPanel = [
    'CONFIRMED',
    'PROCESSING',
    'DELIVERING',
    'ARRIVED',
    'DELIVERED',
    'RETURNING',
    'EXCHANGE_REQUESTED',
    'SHIPPING_REPLACEMENT',
    'COMPLETED',
    'CANCELLED',
    'FORCED_CANCELLED',
    'REFUNDED_AND_RESTOCKED',
    'REFUNDED_AND_DAMAGED',
  ].includes(status);

  if (showDeliveryPanel) {
    return (
      <div className="space-y-8">
        <TradeInDeliveryQuickActionsCard
          status={status}
          hasTask={!!activeShippingTaskId}
          canFinalizeTradeIn={canFinalizeTradeIn}
          canHandleUnhappyCase={canHandleUnhappyCase}
          canProcessReturningUnhappy={canProcessReturningUnhappy}
          onFinalizeTradeIn={handleFinalizeTradeIn}
          onProcessReturn={handleOpenProcessReturnDialog}
          onProcessExchange={handleOpenProcessExchangeDialog}
          onOpenCancelDialog={handleOpenCancelDialog}
          delay={0}
        />

        <TradeInShippingAssignmentCard
          tradeInOrderId={order.tradeInOrderId}
          onOpenAssign={handleOpenAssignDialog}
          canAssign={canAssignDeliveryTask}
          delay={0.08}
        />

        <CancelTradeInOrderDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          onConfirm={adminCancel}
          isLoading={isCancelling}
          orderCode={order.orderCode}
        />

        <ConfirmDialog
          open={isCompleteConfirmDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseCompleteConfirmDialog();
            } else {
              setIsCompleteConfirmDialogOpen(true);
            }
          }}
          title="Finalize Trade-In?"
          description="Are you sure you want to mark this trade-in as Completed? This confirms delivery closure and is intended as a final action."
          confirmText="Confirm Complete"
          onConfirm={handleConfirmFinalizeTradeIn}
          variant="success"
          isLoading={isTransitioning}
        />

        <AssignShippingStaffDialog
          tradeInOrderId={order.tradeInOrderId}
          isOpen={isAssignDialogOpen}
          onClose={handleCloseAssignDialog}
        />

        <TradeInProcessReturnDialog
          isOpen={isProcessReturnDialogOpen}
          onClose={handleCloseProcessReturnDialog}
          tradeInOrderId={order.tradeInOrderId}
          taskId={returningShippingTaskId}
          defaultProductVariantId={defaultProductVariantId}
        />

        <TradeInProcessExchangeDialog
          isOpen={isProcessExchangeDialogOpen}
          onClose={handleCloseProcessExchangeDialog}
          tradeInOrderId={order.tradeInOrderId}
          taskId={returningShippingTaskId}
          defaultProductVariantId={defaultProductVariantId}
        />
      </div>
    );
  }

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
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Chat owner</p>
            <div className="flex items-start sm:items-center gap-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-500 shrink-0">
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

            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivery owner</p>
              <div className="flex items-start sm:items-center gap-3 mt-1">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-500 shrink-0">
                  {deliveryOwnerAvatar ? (
                    <img
                      src={deliveryOwnerAvatar}
                      alt={deliveryOwnerLabel}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="text-[10px] font-black">{deliveryOwnerInitial}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {isLoadingDeliveryOwner ? 'Loading staff...' : deliveryOwnerLabel}
                  </p>
                  {deliveryOwnerEmail ? (
                    <p className="text-[10px] text-slate-500 truncate">{deliveryOwnerEmail}</p>
                  ) : deliveryOwnerStaffId ? (
                    <p className="text-[10px] text-slate-400 font-mono truncate">ID: {deliveryOwnerStaffId}</p>
                  ) : (
                    <p className="text-[10px] text-slate-400">Unassigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {canAssignDeliveryTask && (
          <div className="px-4 py-4 border-b border-slate-100 bg-blue-50/40 space-y-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Delivery Assignment (Confirmed Stage)</p>
            <Button
              className="h-10 rounded-lg bg-primary text-[10px] font-black uppercase tracking-widest"
              onClick={handleOpenAssignDialog}
            >
              <Truck className="w-3.5 h-3.5 mr-1.5" />
              Assign Delivery Staff
            </Button>
          </div>
        )}

        {/* State: WAITING_FOR_STAFF - Compact Version */}
        {status === 'WAITING_FOR_STAFF' && (
          <WaitingForStaffSection
            canAccessTradeInChat={canAccessTradeInChat}
            isAccepting={isAccepting}
            canAbortDeal={canHandleUnhappyCase}
            onAcceptTask={handleAcceptTask}
            onOpenCancelDialog={handleOpenCancelDialog}
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
            canAbortDeal={canHandleUnhappyCase}
            onOpenTradeInChat={handleOpenTradeInChat}
            onOpenCancelDialog={handleOpenCancelDialog}
            onConfirmDeal={handleConfirmDeal}
            assignedStaffHint={assignedStaffHint}
          />
        )}

        {/* State: CONFIRMED, PROCESSING & DELIVERED - Streamlined */}
        {isActiveProgressStatus && (
          <ActiveProgressSection
            status={status}
            isTransitioning={isTransitioning}
            canFinalizeTradeIn={canFinalizeTradeIn}
            canHandleUnhappyCase={canHandleUnhappyCase}
            canProcessReturningUnhappy={canProcessReturningUnhappy}
            onFinalizeTradeIn={handleFinalizeTradeIn}
            onProcessReturn={handleOpenProcessReturnDialog}
            onProcessExchange={handleOpenProcessExchangeDialog}
            onOpenCancelDialog={handleOpenCancelDialog}
          />
        )}

        {/* FINALIZED STATES */}
        {isFinalizedStatus && (
          <FinalizedSection status={status} />
        )}
      </div>

      <CancelTradeInOrderDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={adminCancel}
        isLoading={isCancelling}
        orderCode={order.orderCode}
      />

      <ConfirmDialog
        open={isCompleteConfirmDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseCompleteConfirmDialog();
          } else {
            setIsCompleteConfirmDialogOpen(true);
          }
        }}
        title="Finalize Trade-In?"
        description="Are you sure you want to mark this trade-in as Completed? This confirms delivery closure and is intended as a final action."
        confirmText="Confirm Complete"
        onConfirm={handleConfirmFinalizeTradeIn}
        variant="success"
        isLoading={isTransitioning}
      />

      <AssignShippingStaffDialog
        tradeInOrderId={order.tradeInOrderId}
        isOpen={isAssignDialogOpen}
        onClose={handleCloseAssignDialog}
      />

      <TradeInProcessReturnDialog
        isOpen={isProcessReturnDialogOpen}
        onClose={handleCloseProcessReturnDialog}
        tradeInOrderId={order.tradeInOrderId}
        taskId={returningShippingTaskId}
        defaultProductVariantId={defaultProductVariantId}
      />

      <TradeInProcessExchangeDialog
        isOpen={isProcessExchangeDialogOpen}
        onClose={handleCloseProcessExchangeDialog}
        tradeInOrderId={order.tradeInOrderId}
        taskId={returningShippingTaskId}
        defaultProductVariantId={defaultProductVariantId}
      />
    </div>
  );
});
