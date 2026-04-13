import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { tradeInOrderService } from "@/api/services";
import type { TradeInOrderDetailResponse } from "@/api/types/tradeInOrder";
import {
  tradeInOrderKeys,
  useConfirmTradeInDeal,
  useTransitionTradeInStatus,
} from "@/hooks/queries";
import { useShippingTasksByTradeInOrder } from "@/hooks/queries/useShippingTask";
import { usePermission } from "@/hooks/usePermission";
import { useStaffById, useStaffProfile } from "@/hooks/queries/useStaff";
import {
  isTradeInActiveProgressStatus,
  isTradeInFinalStatus,
  normalizeTradeInStatus,
} from "@/utils/tradeInWorkflow";

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
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
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
  const canResolveDeliveryStaff =
    status === "CONFIRMED" ||
    status === "PROCESSING" ||
    status === "DELIVERED" ||
    status === "COMPLETED";

  const { data: shippingTasks } = useShippingTasksByTradeInOrder(
    canResolveDeliveryStaff ? order.tradeInOrderId : "",
  );

  const filteredTradeInTasks = useMemo(() => {
    const normalizedTradeInOrderId = order.tradeInOrderId.trim().toLowerCase();
    return (shippingTasks || []).filter(
      (task) =>
        typeof task.tradeInOrderId === "string" &&
        task.tradeInOrderId.trim().toLowerCase() === normalizedTradeInOrderId,
    );
  }, [order.tradeInOrderId, shippingTasks]);

  const activeShippingTask = useMemo(() => {
    const sortedTasks = [...filteredTradeInTasks].sort((a, b) => {
      const aTime = new Date(a.completionDate || a.shippingDate || 0).getTime();
      const bTime = new Date(b.completionDate || b.shippingDate || 0).getTime();
      return bTime - aTime;
    });

    return sortedTasks.find((task) => task.status !== "Reassigned");
  }, [filteredTradeInTasks]);

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

  const { mutate: transitionStatus, isPending: isTransitioning } =
    useTransitionTradeInStatus(order.tradeInOrderId);

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

  const isActiveProgressStatus = isTradeInActiveProgressStatus(status);
  const isFinalizedStatus = isTradeInFinalStatus(status);
  const canAdminOrManagerUpdateStatus = !(isAdmin || isManager) || !deliveryOwnerStaffId;
  const canAssignDeliveryTask =
    (isAdmin || isManager) && status === "CONFIRMED";

  const handleTransitionStatus = useCallback(
    (toStatus: string) => {
      if (isTransitioning) return;

      transitionStatus(
        { fromStatus: status, toStatus },
        {
          onSuccess: () => {
            toast.success("Status updated.");
          },
          onError: (error: Error) => {
            toast.error(error.message || "Unable to update status.");
          },
        },
      );
    },
    [isTransitioning, status, transitionStatus],
  );

  const handleAcceptTask = useCallback(() => {
    acceptTask();
  }, [acceptTask]);

  const handleConfirmDeal = useCallback(() => {
    if (isConfirming) return;

    confirmDeal(
      { fromStatus: status, tradeInPrice: negotiatedPrice },
      {
        onSuccess: () => {
          toast.success("Confirmed.");
        },
        onError: (error: Error) => {
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
    setIsCancelDialogOpen(true);
  }, []);

  const handleMarkArrived = useCallback(() => {
    handleTransitionStatus("PROCESSING");
  }, [handleTransitionStatus]);

  const handleCompleteSuccess = useCallback(() => {
    handleTransitionStatus("DELIVERED");
  }, [handleTransitionStatus]);

  const handleMarkCompleted = useCallback(() => {
    handleTransitionStatus("COMPLETED");
  }, [handleTransitionStatus]);

  const handleOpenAssignDialog = useCallback(() => {
    setIsAssignDialogOpen(true);
  }, []);

  const handleCloseAssignDialog = useCallback(() => {
    setIsAssignDialogOpen(false);
    invalidateTradeInDetail();
  }, [invalidateTradeInDetail]);

  return {
    status,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    isAssignDialogOpen,
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
    canAdminOrManagerUpdateStatus,
    canAssignDeliveryTask,
    handleAcceptTask,
    handleConfirmDeal,
    handleNegotiatedPriceChange,
    handleOpenTradeInChat,
    handleOpenCancelDialog,
    handleMarkArrived,
    handleCompleteSuccess,
    handleMarkCompleted,
    handleOpenAssignDialog,
    handleCloseAssignDialog,
    adminCancel,
  };
}
