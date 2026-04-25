import { useRef, useMemo, useEffect, useCallback } from "react";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast as sonnerToast } from "sonner";

import { useProductDetail } from "@/hooks/queries/useProduct";
import { useUserOrderItemsForTradeIn } from "@/hooks/queries/useOrder";
import { useBreadcrumb } from "@/components/common/BreadcrumbNav";
import { useFavoriteProducts, useAddFavorite, useDeleteFavorite } from "@/hooks/useFavorite";
import { useAuthStore } from "@/store/authStore";
import { useProductCertificates } from "@/hooks/queries/useCertificate";
import { useProductFeedbacks } from "@/hooks/queries/useProductFeedback";

import variantService, { type VariantResponse } from "@/api/services/variantService";
import userService from "@/api/services/userService";
import { getAddresses } from "@/api/services/address.service";
import tradeInOrderService from "@/api/services/tradeInOrderService";

import type { TradeInEligibleOrderItem } from "@/api/types/order";
import type { CreateTradeInOrderRequest } from "@/api/types/tradeInOrder";
import type { ProductFeedbackResponse } from "@/api/types/feedback";
import type { Address } from "@/api/types/address";
import type { ProductSpec, Review } from "../types";
import { safetyCertifications } from "../constants";

import { useProductDetailState } from "./useProductDetailState";
import {
  pickVariantTradeInNumber,
  pickVariantTradeInBoolean,
  parseTradeInEstimate
} from "../utils/tradeInProcessing";

export function useProductDetailViewModel() {
  const { slug } = useParams<{ slug: string }>();
  const productImageRef = useRef<HTMLDivElement | null>(null);
  const { setItems: setBreadcrumb } = useBreadcrumb();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    data: product,
    isLoading,
    isError: isProductError,
  } = useProductDetail(slug || "", !!slug);

  const { state, actions, getVariantSize } = useProductDetailState({
    product,
    productImageRef,
  });

  // 3. Trade-In Logic
  const { data: eligibleTradeInItemsRaw, isLoading: isTradeInItemsLoading } = useUserOrderItemsForTradeIn(
    state.currentVariant?.id || "",
    { enabled: !!state.currentVariant?.id && state.isTradeInOpen && isAuthenticated }
  );

  const { data: tradeInAddresses = [] } = useQuery<Address[]>({
    queryKey: ["trade-in", "addresses"],
    queryFn: getAddresses,
    enabled: isAuthenticated && state.isTradeInOpen,
    staleTime: 5 * 60 * 1000,
  });

  const { data: tradeInProfile } = useQuery<{ fullName?: string; phoneNumber?: string }>({
    queryKey: ["trade-in", "profile"],
    queryFn: async () => {
      const profile = await userService.getProfile();
      return {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
      };
    },
    enabled: isAuthenticated && state.isTradeInOpen,
    staleTime: 5 * 60 * 1000,
  });

  const createTradeInOrderMutation = useMutation({
    mutationFn: (request: CreateTradeInOrderRequest) => tradeInOrderService.create(request),
  });

  const rawTradeInItems = useMemo(() => {
    if (!Array.isArray(eligibleTradeInItemsRaw)) return [];
    return (eligibleTradeInItemsRaw as TradeInEligibleOrderItem[]).filter(
      (item): item is TradeInEligibleOrderItem => Boolean(item?.id && item?.productVariantId)
    );
  }, [eligibleTradeInItemsRaw]);

  const tradeInVariantIds = useMemo(
    () => Array.from(new Set(rawTradeInItems.map((item) => item.productVariantId).filter(Boolean))),
    [rawTradeInItems]
  );

  const tradeInVariantQueries = useQueries({
    queries: tradeInVariantIds.map((variantId) => ({
      queryKey: ["variants", "trade-in", variantId],
      queryFn: () => variantService.getById(variantId),
      enabled: state.isTradeInOpen && isAuthenticated,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isTradeInVariantLoading = tradeInVariantQueries.some((query) => query.isLoading);

  const variantDetailMap = useMemo(() => {
    const map = new Map<string, VariantResponse>();
    tradeInVariantQueries.forEach((query, index) => {
      if (query.data) map.set(tradeInVariantIds[index], query.data);
    });
    return map;
  }, [tradeInVariantIds, tradeInVariantQueries]);

  const resolveVariantImage = useCallback((variant?: VariantResponse) => {
    const attrs = (variant?.attributes || {}) as Record<string, unknown>;
    return (typeof attrs.imageUrl === "string" && attrs.imageUrl) ||
      (typeof attrs.image === "string" && attrs.image) ||
      (typeof attrs.thumbnail === "string" && attrs.thumbnail) || undefined;
  }, []);

  const resolveVariantLabel = useCallback((variant?: VariantResponse) => {
    if (!variant) return "";
    const attrs = (variant.attributes || {}) as Record<string, unknown>;
    const color = String(attrs.color || attrs.Color || "").trim();
    const size = typeof variant.size === "string" ? variant.size : "";
    return [color, size].filter(Boolean).join(" • ");
  }, []);

  const eligibleTradeInProducts = useMemo(() => {
    if (!rawTradeInItems.length) return [];
    const fallbackImage = "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg";

    return rawTradeInItems
      .filter((item) => (item.tradeInUsedAmount ?? 0) < ((item.quantity ?? 1) || 1))
      .map((item) => {
        const variant = variantDetailMap.get(item.productVariantId);
        const variantLabel = resolveVariantLabel(variant);
        const variantTradeInValue = pickVariantTradeInNumber(variant, [
          "tradeInPrice", "tradeInValue", "minTradeInPrice", "minimumTradeInPrice", "guaranteedTradeInValue",
        ]);
        const normalizedQuantity = item.quantity ?? 1;
        const normalizedUnitPrice = item.unitPrice ?? (normalizedQuantity > 0 ? Math.round((item.totalPrice ?? 0) / normalizedQuantity) : undefined) ?? variant?.salePrice ?? variant?.basePrice ?? 0;
        const resolvedName = item.itemName ?? "Trade-in item";
        const displayName = variantLabel && !resolvedName.includes(variantLabel) ? `${resolvedName} (${variantLabel})` : resolvedName;
        const normalizedTotalPrice = item.totalPrice ?? normalizedUnitPrice * normalizedQuantity;

        return {
          id: item.id,
          orderId: item.orderId ?? item.id,
          porderItemId: item.id,
          productVariantId: item.productVariantId,
          name: displayName,
          image: item.productVariantImageUrl || item.image || resolveVariantImage(variant) || fallbackImage,
          quantity: normalizedQuantity,
          unitPrice: normalizedUnitPrice,
          totalPrice: normalizedTotalPrice,
          originalPrice: normalizedUnitPrice,
          purchaseDate: item.purchaseDate ?? item.createdAt ?? "",
          canTradeIn: true,
          tradeInUsedAmount: item.tradeInUsedAmount ?? 0,
          tradeInValue: typeof item.tradeInValue === "number" ? item.tradeInValue : variantTradeInValue,
        };
      });
  }, [rawTradeInItems, resolveVariantImage, resolveVariantLabel, variantDetailMap]);

  const selectedTradeInItem = useMemo(
    () => eligibleTradeInProducts.find((item) => item.id === state.selectedTradeInProducts[0]),
    [eligibleTradeInProducts, state.selectedTradeInProducts],
  );

  const { data: tradeInEstimateRaw, isFetching: isTradeInEstimateLoading } = useQuery({
    queryKey: ["trade-in", "estimate", selectedTradeInItem?.productVariantId, state.currentVariant?.id],
    queryFn: async () => tradeInOrderService.calculateTradeInOrderPrice({
      oldProductVariantId: selectedTradeInItem!.productVariantId!,
      productVariantId: state.currentVariant!.id,
    }),
    enabled: state.isTradeInOpen && isAuthenticated && !!selectedTradeInItem?.productVariantId && !!state.currentVariant?.id,
    staleTime: 30 * 1000,
  });

  const tradeInEstimate = useMemo(() => parseTradeInEstimate(tradeInEstimateRaw), [tradeInEstimateRaw]);

  const { data: apiCertificates } = useProductCertificates(product?.id || "", {
    enabled: !!product?.id && (state.activeTab === 'specs' || state.activeTab === 'description')
  });

  const { data: apiFeedbacks } = useProductFeedbacks(product?.id || "", {
    enabled: !!product?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: favorites } = useFavoriteProducts();
  const addFavorite = useAddFavorite();
  const deleteFavorite = useDeleteFavorite();

  const isWishlisted = useMemo(() => {
    if (!favorites?.items || !product) return false;
    return favorites.items.some((f) => f.productId === product.id);
  }, [favorites, product]);

  const handleToggleWishlist = useCallback(() => {
    if (!product) return;
    if (isWishlisted) {
      deleteFavorite.mutate(product.id, {
        onSuccess: () => { if (actions.setIsWishlisted) actions.setIsWishlisted(false); }
      });
    } else {
      addFavorite.mutate(product.id, {
        onSuccess: () => { if (actions.setIsWishlisted) actions.setIsWishlisted(true); }
      });
    }
  }, [product, isWishlisted, deleteFavorite, addFavorite, actions]);

  const apiSpecs: ProductSpec[] = useMemo(() => {
    if (!product) return [];
    const specs: ProductSpec[] = [];
    if (product.material) specs.push({ label: "Material", value: product.material });
    if (product.ageGroup !== null && product.ageGroup !== undefined) specs.push({ label: "Age Group", value: `${product.ageGroup} months` });
    if (product.categoryName) specs.push({ label: "Category", value: product.categoryName });
    if (typeof product.warrantyPolicyDay === "number") specs.push({ label: "Warranty", value: `${product.warrantyPolicyDay} days` });
    if (typeof product.returnPolicyDay === "number") specs.push({ label: "Return Policy", value: `${product.returnPolicyDay} days` });
    return specs;
  }, [product]);

  const reviews: Review[] = useMemo(() => {
    const feedbackItems = apiFeedbacks?.items || [];
    if (!Array.isArray(feedbackItems)) return [];
    return feedbackItems
      .filter((f: ProductFeedbackResponse) => f.status === "Visible")
      .map((f: ProductFeedbackResponse) => ({
        id: f.id,
        name: f.customerName || "Anonymous",
        avatar: f.customerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.customerName || "A")}&background=random`,
        rating: f.score,
        date: f.createdAt,
        comment: f.comment,
        helpful: 0,
        verified: true,
      }));
  }, [apiFeedbacks]);

  const averageRatingValue = useMemo(() => {
    if (!product) return 0;
    if (product.averageRating > 0) return product.averageRating;
    if (reviews.length > 0) return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    return 0;
  }, [product, reviews]);

  const tradeInConfig = useMemo(() => {
    const variantTradeInEligible = pickVariantTradeInBoolean(state.currentVariant, ["isTradeInEligible", "tradeInEligible", "canTradeIn"]);
    const variantDepositAmount = pickVariantTradeInNumber(state.currentVariant, ["depositAmount", "requiredDeposit", "tradeInDeposit"]);
    const variantMinTradeInPrice = pickVariantTradeInNumber(state.currentVariant, ["tradeInPrice", "minTradeInPrice", "minimumTradeInPrice", "guaranteedTradeInValue", "tradeInValue"]);

    return {
      isTradeInEligible: variantTradeInEligible ?? Boolean(product?.isTradeInEligible),
      minTradeInPrice: variantMinTradeInPrice ?? product?.minTradeInPrice ?? 0,
      depositAmount: variantDepositAmount ?? product?.depositAmount ?? 0,
      currentProductPrice: state.currentPriceInfo.price || product?.minPrice || 0,
    };
  }, [product, state.currentPriceInfo.price, state.currentVariant]);

  const tradeInSummary = useMemo(() => {
    const resolvedMinTradeInPrice = tradeInConfig.minTradeInPrice;
    const resolvedTradeInValue = tradeInEstimate.estimatedTradeInValue ?? selectedTradeInItem?.tradeInValue ?? resolvedMinTradeInPrice;
    const resolvedCurrentProductPrice = tradeInEstimate.currentProductPrice ?? tradeInConfig.currentProductPrice;
    const resolvedDepositAmount = tradeInConfig.depositAmount;
    const resolvedAmountToPay = tradeInEstimate.estimatedAmountToPay ?? Math.max(0, resolvedCurrentProductPrice - resolvedMinTradeInPrice - resolvedDepositAmount);

    return {
      estimatedTradeInValue: resolvedTradeInValue,
      estimatedAmountToPay: resolvedAmountToPay,
      currentProductPrice: resolvedCurrentProductPrice,
      depositAmount: resolvedDepositAmount,
      minTradeInPrice: resolvedMinTradeInPrice,
    };
  }, [tradeInConfig, tradeInEstimate, selectedTradeInItem]);

  const tradeInContact = useMemo(() => {
    const defaultAddress = tradeInAddresses.find((address) => address.isDefault) || tradeInAddresses[0];
    return {
      receiverName: defaultAddress?.receiverName || tradeInProfile?.fullName || "",
      phoneNumber: defaultAddress?.phoneNumber || tradeInProfile?.phoneNumber || "",
      address: defaultAddress ? [defaultAddress.street, defaultAddress.ward, defaultAddress.district, defaultAddress.province].filter(Boolean).join(", ") : "",
    };
  }, [tradeInAddresses, tradeInProfile]);

  const handleCreateTradeInOrder = useCallback(async (payload: {
    pOrderItemId: string;
    productVariantId: string;
    description: string;
    isGood: boolean;
    images: File[];
  }) => {
    if (!tradeInContact.address || !tradeInContact.phoneNumber || !tradeInContact.receiverName) {
      sonnerToast.error("Please set a default address and phone number before submitting trade-in.");
      throw new Error("Missing trade-in contact information.");
    }

    const normalizedDescription = payload.description?.trim() || "Drop-off at hub";
    const createdTradeInOrder = await createTradeInOrderMutation.mutateAsync({
      address: tradeInContact.address,
      description: normalizedDescription,
      phoneNumber: tradeInContact.phoneNumber,
      receiverName: tradeInContact.receiverName,
      pOrderItemId: payload.pOrderItemId,
      productVariantId: payload.productVariantId,
      isGood: payload.isGood,
    });

    const paymentUrl = typeof createdTradeInOrder.paymentUrl === "string" ? createdTradeInOrder.paymentUrl.trim() : "";
    const shouldRedirectToPayment = paymentUrl.length > 0;

    if (payload.images.length > 0) {
      const tradeInOrderId = createdTradeInOrder.tradeInOrderId || createdTradeInOrder.id || createdTradeInOrder.orderId;
      if (tradeInOrderId) {
        const uploadToastId = `trade-in-upload-${String(tradeInOrderId)}-${Date.now()}`;
        const uploadTask = tradeInOrderService.uploadImages(String(tradeInOrderId), payload.images, {
          compress: true,
          onProgress: (progress, stage) => {
            const label = stage === "compressing" ? "Optimizing photos" : "Uploading photos";
            sonnerToast.loading(`${label}: ${progress}%`, { id: uploadToastId });
          },
        });

        if (shouldRedirectToPayment) {
          try { await uploadTask; sonnerToast.success("Trade-in images uploaded successfully.", { id: uploadToastId }); }
          catch { sonnerToast.warning("Image upload failed before payment redirect.", { id: uploadToastId }); }
        } else {
          void uploadTask.then(() => sonnerToast.success("Uploaded successfully.", { id: uploadToastId })).catch(() => sonnerToast.warning("Upload failed.", { id: uploadToastId }));
        }
      }
    }

    if (shouldRedirectToPayment) { 
      sessionStorage.setItem('lastOrderType', 'trade-in');
      window.location.assign(paymentUrl); 
    }
  }, [createTradeInOrderMutation, tradeInContact]);

  const handleToggleTradeIn = useCallback((id: string) => {
    actions.setSelectedTradeInProducts((prev: string[]) => prev[0] === id ? [] : [id]);
  }, [actions]);

  useEffect(() => {
    if (product) {
      setBreadcrumb([{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name, active: true }]);
    }
    return () => setBreadcrumb([]);
  }, [product, setBreadcrumb]);

  return {
    product,
    isLoading,
    isProductError,
    state,
    actions,
    getVariantSize,
    tradeInSummary,
    tradeInConfig,
    eligibleTradeInProducts,
    isTradeInItemsLoading: isTradeInItemsLoading || isTradeInVariantLoading,
    isTradeInEstimateLoading,
    handleCreateTradeInOrder,
    handleToggleTradeIn,
    handleToggleWishlist,
    isWishlisted,
    apiSpecs,
    reviews,
    averageRating: averageRatingValue,
    certifications: apiCertificates || safetyCertifications,
    productImageRef,
    isAuthenticated,
    tradeInContact,
    tradeInAddresses
  };
}
