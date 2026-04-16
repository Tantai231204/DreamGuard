import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { tradeInOrderService } from "@/api/services";
import type { TradeInOrderDetailResponse } from "@/api/types/tradeInOrder";
import {
  tradeInOrderKeys,
  useConfirmTradeInDeal,
} from "@/hooks/queries";
import { useShippingTasksByTradeInOrder } from "@/hooks/queries/useShippingTask";
import { usePermission } from "@/hooks/usePermission";
import { useStaffById, useStaffProfile } from "@/hooks/queries/useStaff";
import {
  isTradeInAdminCancelableStatus,
  isTradeInActiveProgressStatus,
  isTradeInFinalStatus,
  normalizeTradeInStatus,
} from "@/utils/tradeInWorkflow";

const DELIVERY_WORKFLOW_STATUS_SET = new Set([
  "CONFIRMED",
  "PROCESSING",
  "DELIVERING",
  "ARRIVED",
  "DELIVERED",
  "RETURNING",
  "EXCHANGE_REQUESTED",
  "SHIPPING_REPLACEMENT",
  "COMPLETED",
  "FORCED_CANCELLED",
  "REFUNDED_AND_RESTOCKED",
  "REFUNDED_AND_DAMAGED",
]);

const ACTIVE_MONITOR_STATUS_SET = new Set([
  "CONFIRMED",
  "PROCESSING",
  "DELIVERING",
  "ARRIVED",
  "DELIVERED",
  "RETURNING",
  "EXCHANGE_REQUESTED",
  "SHIPPING_REPLACEMENT",
]);

const FINALIZED_STATUS_SET = new Set([
  "COMPLETED",
  "CANCELLED",
  "FORCED_CANCELLED",
  "REFUNDED_AND_RESTOCKED",
  "REFUNDED_AND_DAMAGED",
]);

interface Identifiable {
  id?: string;
  conversationId?: string;
}

const resolveChatOwnerStaffId = (
  order: TradeInOrderDetailResponse,
): string | undefined => {
  const rawConversation = order.conversation as unknown as
    | Record<string, unknown>
    | null
    | undefined;

  const candidates = [
    order.conversation?.staffId,
    rawConversation && typeof rawConversation.staffId === "string"
      ? rawConversation.staffId
      : undefined,
    rawConversation && typeof rawConversation.staffID === "string"
      ? rawConversation.staffID
      : undefined,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return undefined;
};

export function useTradeInStaffManagement(order: TradeInOrderDetailResponse) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAdmin, isManager, isSeller } = usePermission();

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCompleteConfirmDialogOpen, setIsCompleteConfirmDialogOpen] = useState(false);
  const [isAcceptConfirmDialogOpen, setIsAcceptConfirmDialogOpen] = useState(false);
  const [isDealConfirmDialogOpen, setIsDealConfirmDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isProcessReturnDialogOpen, setIsProcessReturnDialogOpen] = useState(false);
  const [isProcessExchangeDialogOpen, setIsProcessExchangeDialogOpen] = useState(false);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(
    order.tradeInPrice || 0,
  );

  const status = useMemo(
    () => normalizeTradeInStatus(order.status),
    [order.status],
  );
  const chatOwnerStaffId = useMemo(
    () => resolveChatOwnerStaffId(order),
    [order],
  );
  const canResolveDeliveryStaff = DELIVERY_WORKFLOW_STATUS_SET.has(status);


  const { data: shippingTasks } = useShippingTasksByTradeInOrder(
    canResolveDeliveryStaff ? order.tradeInOrderId : ""
  );

  // API đã trả về đúng shipping tasks cho tradeInOrderId, không cần filter/map lại
  const sortedTradeInTasks = useMemo(() => {
    return [...(shippingTasks || [])].sort((a, b) => {
      const aTime = new Date(a.completionDate || a.shippingDate || 0).getTime();
      const bTime = new Date(b.completionDate || b.shippingDate || 0).getTime();
      return bTime - aTime;
    });
  }, [shippingTasks]);

  const activeShippingTask = useMemo(() => {
    return sortedTradeInTasks.find((task) => task.status !== "Reassigned");
  }, [sortedTradeInTasks]);

  const returningShippingTask = useMemo(() => {
    return sortedTradeInTasks.find(
      (task) =>
        task.status !== "Reassigned" &&
        normalizeTradeInStatus(task.status) === "RETURNING"
    );
  }, [sortedTradeInTasks]);

  const deliveryOwnerStaffId = canResolveDeliveryStaff
    ? activeShippingTask?.staffId
    : undefined;

  const canAccessTradeInChat = isSeller;
  const shouldShowAssignedStaff = isAdmin || isManager || !canAccessTradeInChat;
  const shouldFetchChatOwner = shouldShowAssignedStaff && !!chatOwnerStaffId;
  const shouldFetchDeliveryOwner =
    shouldShowAssignedStaff && !!deliveryOwnerStaffId;

  const { data: chatOwnerStaff, isLoading: isLoadingChatOwner } = useStaffById(
    chatOwnerStaffId || "",
    {
      enabled: shouldFetchChatOwner,
    },
  );
  const { data: deliveryOwnerStaff, isLoading: isLoadingDeliveryOwner } =
    useStaffById(deliveryOwnerStaffId || "", {
      enabled: shouldFetchDeliveryOwner,
    });
  const { data: currentStaffProfile } = useStaffProfile({ enabled: isSeller });

  const chatOwnerLabel =
    chatOwnerStaff?.fullName ||
    chatOwnerStaff?.email ||
    chatOwnerStaffId ||
    "Unassigned";
  const assignedStaffHint =
    chatOwnerStaff?.fullName ||
    (chatOwnerStaffId ? chatOwnerStaffId.slice(0, 8) : "Unassigned");
  const chatOwnerEmail = chatOwnerStaff?.email || "";
  const chatOwnerAvatar = chatOwnerStaff?.avatarUrl || "";
  const chatOwnerInitial = useMemo(
    () => chatOwnerLabel.trim().charAt(0).toUpperCase() || "?",
    [chatOwnerLabel],
  );

  const deliveryOwnerLabel =
    deliveryOwnerStaff?.fullName ||
    deliveryOwnerStaff?.email ||
    deliveryOwnerStaffId ||
    "Unassigned";
  const deliveryOwnerEmail = deliveryOwnerStaff?.email || "";
  const deliveryOwnerAvatar = deliveryOwnerStaff?.avatarUrl || "";
  const deliveryOwnerInitial = useMemo(
    () => deliveryOwnerLabel.trim().charAt(0).toUpperCase() || "?",
    [deliveryOwnerLabel],
  );

  const currentSellerStaffId = currentStaffProfile?.staffId;
  const isCurrentSellerOwner = !!(
    isSeller &&
    currentSellerStaffId &&
    chatOwnerStaffId &&
    currentSellerStaffId === chatOwnerStaffId
  );
  const isAssignedToOtherSeller = !!(
    isSeller &&
    currentSellerStaffId &&
    chatOwnerStaffId &&
    currentSellerStaffId !== chatOwnerStaffId
  );

  const detailQueryKey = useMemo(
    () => tradeInOrderKeys.detail(order.tradeInOrderId),
    [order.tradeInOrderId],
  );
  const invalidateTradeInDetail = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: detailQueryKey });
  }, [detailQueryKey, queryClient]);

  const navigateToChat = useCallback(
    (conversation?: Identifiable | null) => {
      const cid = conversation?.id || conversation?.conversationId;
      if (cid) {
        navigate(`/admin/chat?id=${cid}`);
        return;
      }
      navigate("/admin/chat");
    },
    [navigate],
  );

  const { mutate: acceptTask, isPending: isAccepting } = useMutation({
    mutationFn: () =>
      tradeInOrderService.createConversation(order.tradeInOrderId),
    onSuccess: async (conv) => {
      invalidateTradeInDetail();
      void queryClient.invalidateQueries({ queryKey: ['admin', 'conversations'] });
      toast.success("Task accepted. Redirecting...");
      navigateToChat(conv as Identifiable);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to accept task.");
    },
  });

  const { mutate: confirmDeal, isPending: isConfirming } =
    useConfirmTradeInDeal(order.tradeInOrderId);

  const { mutate: adminCancel, isPending: isCancelling } = useMutation({
    mutationFn: (reason: string) =>
      tradeInOrderService.adminCancel(order.tradeInOrderId, reason),
    onSuccess: () => {
      setIsCancelDialogOpen(false);
      invalidateTradeInDetail();
      toast.success("Cancelled.");
    },
  });

  // Removed transitionStatus to solve isTransitioning double declaration conflict

  const previewAmountToPay = useMemo(
    () =>
      Math.max(
        0,
        (order.productVariant?.salePrice || 0) -
          negotiatedPrice -
          order.depositAmount,
      ),
    [order.depositAmount, order.productVariant?.salePrice, negotiatedPrice],
  );

  const formattedNegotiatedPrice = useMemo(
    () => (negotiatedPrice ? negotiatedPrice.toLocaleString("vi-VN") : ""),
    [negotiatedPrice],
  );

  const isActiveProgressStatus =
    isTradeInActiveProgressStatus(status) || ACTIVE_MONITOR_STATUS_SET.has(status);
  const isFinalizedStatus =
    isTradeInFinalStatus(status) || FINALIZED_STATUS_SET.has(status);
  const isAdminOrManager = isAdmin || isManager;
  const canFinalizeTradeIn = isAdminOrManager && status === "DELIVERED";
  const canHandleUnhappyCase =
    isAdminOrManager && isTradeInAdminCancelableStatus(status);
  const canProcessReturningUnhappy =
    isAdminOrManager && status === "RETURNING" && !!returningShippingTask?.shippingTaskId;
  const canAssignDeliveryTask =
    isAdminOrManager &&
    isTradeInActiveProgressStatus(status) &&
    status !== "NEGOTIATING";
  const activeShippingTaskId = activeShippingTask?.shippingTaskId || "";
  const returningShippingTaskId = returningShippingTask?.shippingTaskId || "";
  const defaultProductVariantId =
    (typeof order.productVariant?.id === "string" && order.productVariant.id) ||
    order.productVariantId ||
    "";

  const handleAcceptTask = useCallback(() => {
    setIsAcceptConfirmDialogOpen(true);
  }, []);

  const handleConfirmAcceptTask = useCallback(() => {
    acceptTask();
    setIsAcceptConfirmDialogOpen(false);
  }, [acceptTask]);

  const handleConfirmDeal = useCallback(() => {
    setIsDealConfirmDialogOpen(true);
  }, []);

  const handleConfirmDealFinal = useCallback(() => {
    if (isConfirming) return;

    confirmDeal(
      { fromStatus: status, tradeInPrice: negotiatedPrice },
      {
        onSuccess: () => {
          setIsDealConfirmDialogOpen(false);
          toast.success("Confirmed.");
        },
        onError: (error: Error) => {
          setIsDealConfirmDialogOpen(false);
          toast.error(error.message || "Unable to confirm deal.");
        },
      },
    );
  }, [confirmDeal, isConfirming, negotiatedPrice, status]);

  const handleNegotiatedPriceChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      setNegotiatedPrice(raw ? Number(raw) : 0);
    },
    [],
  );

  const handleOpenTradeInChat = useCallback(() => {
    navigateToChat(order.conversation as Identifiable);
  }, [navigateToChat, order.conversation]);

  const handleOpenCancelDialog = useCallback(() => {
    if (!canHandleUnhappyCase) return;
    setIsCancelDialogOpen(true);
  }, [canHandleUnhappyCase]);

  const { mutate: finalizeTradeInOrder, isPending: isTransitioning } = useMutation({
    mutationFn: () => tradeInOrderService.completed(order.tradeInOrderId),
    onSuccess: () => {
      setIsCompleteConfirmDialogOpen(false);
      invalidateTradeInDetail();
      toast.success("Trade-in completed successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete trade-in.");
    },
  });

  const handleFinalizeTradeIn = useCallback(() => {
    if (isTransitioning) return;
    setIsCompleteConfirmDialogOpen(true);
  }, [isTransitioning]);

  const handleConfirmFinalizeTradeIn = useCallback(() => {
    if (isTransitioning) return;
    finalizeTradeInOrder();
  }, [isTransitioning, finalizeTradeInOrder]);

  const handleCloseCompleteConfirmDialog = useCallback(() => {
    if (isTransitioning) return;
    setIsCompleteConfirmDialogOpen(false);
  }, [isTransitioning]);

  const handleOpenAssignDialog = useCallback(() => {
    setIsAssignDialogOpen(true);
  }, []);

  const handleOpenProcessReturnDialog = useCallback(() => {
    if (!canProcessReturningUnhappy) return;
    if (!returningShippingTaskId) {
      toast.error("No RETURNING shipping task found for this order.");
      return;
    }
    setIsProcessReturnDialogOpen(true);
  }, [canProcessReturningUnhappy, returningShippingTaskId]);

  const handleOpenProcessExchangeDialog = useCallback(() => {
    if (!canProcessReturningUnhappy) return;
    if (!returningShippingTaskId) {
      toast.error("No RETURNING shipping task found for this order.");
      return;
    }
    setIsProcessExchangeDialogOpen(true);
  }, [canProcessReturningUnhappy, returningShippingTaskId]);

  const handleCloseAssignDialog = useCallback(() => {
    setIsAssignDialogOpen(false);
    invalidateTradeInDetail();
  }, [invalidateTradeInDetail]);

  const handleCloseProcessReturnDialog = useCallback(() => {
    setIsProcessReturnDialogOpen(false);
  }, []);

  const handleCloseProcessExchangeDialog = useCallback(() => {
    setIsProcessExchangeDialogOpen(false);
  }, []);

  return {
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
    assignedStaffLabel: chatOwnerLabel,
    assignedStaffHint,
    assignedStaffEmail: chatOwnerEmail,
    assignedStaffAvatar: chatOwnerAvatar,
    assignedStaffInitial: chatOwnerInitial,
    isLoadingAssignedStaff: isLoadingChatOwner,
    assignedStaffId: chatOwnerStaffId,
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
    isAcceptConfirmDialogOpen,
    setIsAcceptConfirmDialogOpen,
    handleConfirmAcceptTask,
    isDealConfirmDialogOpen,
    setIsDealConfirmDialogOpen,
    handleConfirmDealFinal,
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
  };
}
