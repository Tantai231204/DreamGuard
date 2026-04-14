import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { useUserVouchers } from "@/hooks/queries";
import { useAuthStore } from "@/store/authStore";
import { calculateVoucherDiscount, getVoucherDiscountRatio, isUserVoucherUsable } from "@/utils/user-voucher";
import { bookingSchema, STEP_FIELDS, type BookingFormValues } from "../schema";
import { useBookingData } from "../useBookingData";
import { type BookingVoucher, type SubmissionStatus } from "../types";

const DRAFT_KEY = "dreamguard_booking_draft";

const stepErrorMessages: Record<number, string> = {
  0: "Select at least one product.",
  1: "Select a tier for each product.",
  2: "",
  3: "Select date & time.",
  4: "Enter contact details.",
};

export function usePackageBooking(initialPackageId?: string) {
  // Restore draft from sessionStorage
  const savedDraft = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) return JSON.parse(raw) as { step: number; values: Partial<BookingFormValues> };
    } catch { /* ignore */ }
    return null;
  }, []);

  const [step, setStep] = useState(() => {
    if (savedDraft && savedDraft.step > 0) return savedDraft.step;
    return initialPackageId ? 1 : 0;
  });
  const [direction, setDirection] = useState(1);
  const [appliedVoucher, setAppliedVoucher] = useState<BookingVoucher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeBtn, setShakeBtn] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");

  const persistenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { productTypes, getProductTierPrice, isLoading: isLoadingData } = useBookingData();
  const { isAuthenticated } = useAuthStore();
  const {
    data: voucherPage,
    isLoading: isLoadingVouchers,
    isError: isVoucherError,
    refetch: refetchVouchers,
  } = useUserVouchers(isAuthenticated);

  const availableVouchers = useMemo<BookingVoucher[]>(() => {
    const items = voucherPage?.items ?? [];

    return items
      .filter((voucher) => isUserVoucherUsable(voucher, "service"))
      .map((voucher) => {
        const discountRatio = getVoucherDiscountRatio(voucher);
        const maxDiscountAmount =
          typeof voucher.maxDiscountAmount === "number" && Number.isFinite(voucher.maxDiscountAmount) && voucher.maxDiscountAmount > 0
            ? voucher.maxDiscountAmount
            : undefined;

        return {
          userVoucherId: voucher.userVoucherId,
          code: voucher.code,
          label: voucher.name || voucher.description || "Service Voucher",
          discountRatio,
          discountPct: Math.round(discountRatio * 100),
          maxDiscountAmount,
        };
      });
  }, [voucherPage?.items]);



  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      selectedProducts: savedDraft?.values.selectedProducts ?? [],
      items: savedDraft?.values.items ?? [],
      customerName: savedDraft?.values.customerName ?? "",
      customerPhone: savedDraft?.values.customerPhone ?? "",
      customerEmail: savedDraft?.values.customerEmail ?? "",
      scheduledDate: savedDraft?.values.scheduledDate ?? "",
      scheduledTime: savedDraft?.values.scheduledTime ?? "",
      address: savedDraft?.values.address ?? { street: "", ward: "", district: "", city: "" },
      notes: savedDraft?.values.notes ?? "",
    },
    mode: "onBlur",
  });

  const { trigger, handleSubmit, getValues, reset, control } = form;

  // Use specialized useWatch calls for better performance
  const itemsRaw = useWatch({ control, name: "items" });
  const items = useMemo(() => itemsRaw || [], [itemsRaw]);

  const selectedProductsRaw = useWatch({ control, name: "selectedProducts" });
  const selectedProducts = useMemo(() => selectedProductsRaw || [], [selectedProductsRaw]);

  // Memoized derived data
  const { total, discount, finalPrice } = useMemo(() => {
    const totalValue = items.reduce((sum: number, f: { itemType: string, packageId: string, quantity: number }) => sum + getProductTierPrice(f.itemType, f.packageId) * f.quantity, 0);
    const discountValue = appliedVoucher
      ? calculateVoucherDiscount(totalValue, {
        discountValue: appliedVoucher.discountRatio,
        maxDiscountAmount: appliedVoucher.maxDiscountAmount,
      })
      : 0;

    return {
      total: totalValue,
      discount: discountValue,
      finalPrice: Math.max(0, totalValue - discountValue),
    };
  }, [items, appliedVoucher, getProductTierPrice]);

  // Effects
  useEffect(() => {
    if (savedDraft && savedDraft.step > 0) {
      toast.info("Resumed your draft.");
    }
  }, [savedDraft]);

  useEffect(() => {
    if (isSuccess) return;
    if (persistenceTimeout.current) clearTimeout(persistenceTimeout.current);
    persistenceTimeout.current = setTimeout(() => {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, values: getValues() }));
      } catch { /* ignore */ }
    }, 1000);
    return () => { if (persistenceTimeout.current) clearTimeout(persistenceTimeout.current); };
  }, [selectedProducts, items, step, getValues, isSuccess]);

  useEffect(() => {
    if (!appliedVoucher) return;

    const nextVoucher = availableVouchers.find(
      (voucher) => voucher.userVoucherId === appliedVoucher.userVoucherId,
    );

    if (!nextVoucher) {
      setAppliedVoucher(null);
      return;
    }

    if (
      nextVoucher.discountRatio !== appliedVoucher.discountRatio
      || nextVoucher.maxDiscountAmount !== appliedVoucher.maxDiscountAmount
      || nextVoucher.code !== appliedVoucher.code
      || nextVoucher.label !== appliedVoucher.label
    ) {
      setAppliedVoucher(nextVoucher);
    }
  }, [availableVouchers, appliedVoucher]);

  // Handlers
  const handleApplyVoucher = useCallback((voucher: BookingVoucher) => {
    setAppliedVoucher(voucher);
  }, []);

  const handleRemoveVoucher = useCallback(() => setAppliedVoucher(null), []);

  const go = useCallback(
    async (dir: 1 | -1) => {
      if (dir === 1) {
        // Run Zod validation first
        const valid = await trigger(STEP_FIELDS[step]);
        if (!valid) {
          toast.error(stepErrorMessages[step] || "Required fields missing.");
          setShakeBtn(true);
          setTimeout(() => setShakeBtn(false), 500);
          return;
        }

        // Custom validation for Step 1 (Services/Tiers) 
        // Must ensure EVERY product category selected in Step 0 has a package chosen in Step 1
        if (step === 1) {
          const currentValues = getValues();
          const selectedCount = (currentValues.selectedProducts || []).length;
          const itemsCount = (currentValues.items || []).length;
          
          if (itemsCount < selectedCount) {
             toast.error(`Please select a cleaning package for all ${selectedCount} selected items.`);
             setShakeBtn(true);
             setTimeout(() => setShakeBtn(false), 500);
             return;
          }
        }
      }
      setDirection(dir);
      setStep((s) => s + dir);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [step, trigger, getValues],
  );

  const jumpToStep = useCallback((target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleClearDraft = useCallback(() => {
    sessionStorage.removeItem(DRAFT_KEY);
    reset({
      selectedProducts: [],
      items: [],
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      scheduledDate: "",
      scheduledTime: "",
      address: { street: "", ward: "", district: "", city: "" },
      notes: "",
    });
    setStep(0);
    setUploadedFiles([]);
    setAppliedVoucher(null);
    toast.success("Draft cleared.");
  }, [reset]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    setSubmissionStatus("creating");
    setUploadProgress(0);

    try {
      const payload = {
        servicePackageMappingOrderRequest: (data.items || []).map(it => ({
          servicePackageMappingId: it.packageId,
          quantity: it.quantity
        })),
        phoneNumber: data.customerPhone,
        receiverName: data.customerName,
        address: `${data.address.street}, ${data.address.ward}, ${data.address.district}, ${data.address.city}`,
        customerNote: (data.notes && data.notes.trim() !== "") ? data.notes : "Cleaning Service",
        appointmentDate: new Date(`${data.scheduledDate}T${data.scheduledTime}:00Z`).toISOString(),
        paymentMethod: paymentMethod,
        userVoucherId: appliedVoucher?.userVoucherId ?? null
      };

      const res = await apiClient.post('/ServiceOrders/OrderService', payload);
      const orderData = res.data?.data ?? res.data;
      const orderId = typeof orderData === 'string' ? orderData : orderData?.serviceOrderId || orderData?.id;

      if (uploadedFiles.length > 0 && orderId) {
        setSubmissionStatus("uploading");
        const formData = new FormData();
        uploadedFiles.forEach(f => formData.append('files', f));

        await apiClient.post(`/ServiceOrders/OrderService/${orderId}/assets`, formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          }
        });
      }

      setSubmissionStatus("finishing");
      sessionStorage.removeItem(DRAFT_KEY);
      setUploadedFiles([]);

      if (orderData?.paymentUrl) {
        window.location.assign(orderData.paymentUrl);
        return;
      }

      setIsSuccess(true);
      toast.success("Success!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Process interrupted. Try again.");
    } finally {
      setIsSubmitting(false);
      setSubmissionStatus("idle");
    }
  });

  return {
    // State
    step,
    direction,
    appliedVoucher,
    isSubmitting,
    isSuccess,
    shakeBtn,
    uploadedFiles,
    paymentMethod,
    uploadProgress,
    submissionStatus,
    isLoadingData,
    availableVouchers,
    isLoadingVouchers,
    isVoucherError,

    // Form & Derived Data
    form,
    productTypes,
    getProductTierPrice,
    items,
    total,
    discount,
    finalPrice,

    // Handlers
    setUploadedFiles,
    setPaymentMethod,
    handleApplyVoucher,
    handleRemoveVoucher,
    refetchVouchers,
    go,
    jumpToStep,
    handleClearDraft,
    onSubmit
  };
}
