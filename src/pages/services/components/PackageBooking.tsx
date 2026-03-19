import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, PartyPopper, CalendarDays, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { slideVariants } from "./PackageBooking/constants";
import Stepper from "./PackageBooking/Stepper";
import StepProducts from "./PackageBooking/steps/StepProducts";
import StepPackage from "./PackageBooking/steps/StepPackage";
import StepSchedule from "./PackageBooking/steps/StepSchedule";
import StepContact from "./PackageBooking/steps/StepContact";
import StepConfirm from "./PackageBooking/steps/StepConfirm";
import { bookingSchema, STEP_FIELDS, type BookingFormValues } from "./PackageBooking/schema";
import { findVoucher, type Voucher } from "./PackageBooking/vouchers";
import { formatPrice, formatDate } from "@/lib/utils";
import { productTypes, getProductTierPrice } from "../data";

// Validation error messages per step
const stepErrorMessages: Record<number, string> = {
  0: "Please select at least one product to continue.",
  1: "Please choose a service tier for each selected product.",
  2: "Please select both a date and time slot.",
  3: "Please fill in all required contact fields.",
};

const DRAFT_KEY = "dreamguard_booking_draft";
const TOTAL_STEPS = 5;

interface PackageBookingProps {
  initialPackageId?: string;
}

export default function PackageBooking({ initialPackageId }: PackageBookingProps) {
  const [step, setStep] = useState(initialPackageId ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeBtn, setShakeBtn] = useState(false);

  const handleApplyVoucher = useCallback((code: string): "ok" | "invalid" => {
    const v = findVoucher(code);
    if (v) { setAppliedVoucher(v); return "ok"; }
    return "invalid";
  }, []);

  const handleRemoveVoucher = useCallback(() => setAppliedVoucher(null), []);

  // Restore draft from sessionStorage
  const savedDraft = (() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) return JSON.parse(raw) as { step: number; values: Partial<BookingFormValues> };
    } catch { /* ignore */ }
    return null;
  })();

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
    mode: "onTouched",
  });

  // Restore step from draft
  useEffect(() => {
    if (savedDraft && savedDraft.step > 0) {
      setStep(savedDraft.step);
      toast.info("Your previous booking draft has been restored.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { trigger, handleSubmit, watch, getValues } = form;
  const watchedValues = watch();

  // Persist draft to sessionStorage on every change
  useEffect(() => {
    if (isSuccess) return;
    const timeout = setTimeout(() => {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, values: getValues() }));
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timeout);
  }, [watchedValues, step, getValues, isSuccess]);

  const go = useCallback(
    async (dir: 1 | -1) => {
      if (dir === 1) {
        const valid = await trigger(STEP_FIELDS[step]);
        if (!valid) {
          toast.error(stepErrorMessages[step] || "Please fill in all required fields.");
          setShakeBtn(true);
          setTimeout(() => setShakeBtn(false), 500);
          return;
        }
      }
      setDirection(dir);
      setStep((s) => s + dir);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [step, trigger],
  );

  // Jump to specific step (for edit shortcuts)
  const jumpToStep = useCallback((target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Booking submitted:", data);
      // Clear draft
      sessionStorage.removeItem(DRAFT_KEY);
      setIsSuccess(true);
      toast.success("Booking confirmed successfully!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  // Calculate total for success screen
  const items = watchedValues.items ?? [];
  const total = items.reduce((sum, f) => sum + getProductTierPrice(f.itemType, f.packageId) * f.quantity, 0);
  const discount = appliedVoucher ? Math.round(total * (appliedVoucher.discountPct / 100)) : 0;

  // ====== SUCCESS STATE ======
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-12 space-y-8"
      >
        {/* Success animation */}
        <div className="relative mx-auto w-24 h-24">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="absolute inset-0 rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/30 flex items-center justify-center"
          >
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </motion.div>
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute inset-0 rounded-full bg-emerald-400"
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Booking Confirmed!</h2>
          <p className="text-sm text-slate-400 font-medium">Your appointment has been scheduled successfully.</p>
        </div>

        {/* Confirmation card */}
        <div className="rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-lg text-left space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <PartyPopper className="h-3.5 w-3.5 text-[#4988c4]" />
            Booking Summary
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => {
              const product = productTypes.find(p => p.id === it.itemType);
              const tier = product?.tiers.find(t => t.tierId === it.packageId);
              return (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">{product?.label} — {tier?.name} (x{it.quantity})</span>
                  <span className="font-black text-slate-900">{formatPrice(getProductTierPrice(it.itemType, it.packageId) * it.quantity)}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-between">
            <span className="font-black text-slate-900">Total Paid</span>
            <span className="text-xl font-black text-[#4988c4] tracking-tighter">{formatPrice(total - discount)}</span>
          </div>

          {watchedValues.scheduledDate && (
            <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
              <CalendarDays className="h-4 w-4 text-[#4988c4]" />
              <span className="text-sm font-bold text-slate-600">
                {formatDate(watchedValues.scheduledDate)} at {watchedValues.scheduledTime}
              </span>
            </div>
          )}
        </div>

        {/* Assurance */}
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" /> Confirmation details sent to your contact information
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Button
            type="button"
            onClick={() => {
              form.reset();
              setStep(0);
              setIsSuccess(false);
              setAppliedVoucher(null);
            }}
            className="h-11 px-6 rounded-xl bg-[#4988c4] hover:bg-[#3a73a8] text-white shadow-lg shadow-[#4988c4]/10 transition-all font-bold text-sm border-none"
          >
            Book Another Service
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-50 pb-2">
        <Stepper currentStep={step} />
      </div>

      <div className={step < 4 ? "lg:grid lg:grid-cols-12 lg:gap-12 items-start" : "max-w-2xl mx-auto"}>
        <div className={`min-h-[450px] ${step < 4 ? "lg:col-span-7" : ""}`}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            {step === 0 && <StepProducts form={form} />}
            {step === 1 && <StepPackage form={form} />}
            {step === 2 && <StepSchedule form={form} />}
            {step === 3 && <StepContact form={form} />}
            {step === 4 && (
              <StepConfirm
                form={watchedValues}
                appliedVoucher={appliedVoucher}
                onApplyVoucher={handleApplyVoucher}
                onRemoveVoucher={handleRemoveVoucher}
                onEditStep={jumpToStep}
                isSidebar={false}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={() => go(-1)}
            disabled={step === 0}
            className="h-11 px-5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all font-bold text-sm flex items-center gap-2 disabled:opacity-30"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>

          {step < TOTAL_STEPS - 1 ? (
            <Button
              type="button"
              onClick={() => go(1)}
              className={`h-11 px-7 rounded-xl bg-[#4988c4] hover:bg-[#3a73a8] text-white shadow-lg shadow-[#4988c4]/10 transition-all font-bold text-sm flex items-center gap-2 border-none ${shakeBtn ? "animate-shake" : ""}`}
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="h-11 px-7 rounded-xl bg-[#4988c4] hover:bg-[#3a73a8] text-white shadow-lg shadow-[#4988c4]/10 transition-all font-bold text-sm flex items-center gap-2 border-none disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Confirm Booking
                </>
              )}
            </Button>
          )}
        </div>
      </div>

        {/* Sticky Sidebar (Step 0 - 3) */}
        {step < 4 && (
          <div className="hidden lg:block lg:col-span-5 sticky top-24">
            <StepConfirm
              form={watchedValues}
              appliedVoucher={appliedVoucher}
              onApplyVoucher={handleApplyVoucher}
              onRemoveVoucher={handleRemoveVoucher}
              onEditStep={jumpToStep}
              isSidebar={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
