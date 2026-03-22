import { useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPackages } from "../data";
import { slideVariants } from "./PackageBooking/constants";
import Stepper from "./PackageBooking/Stepper";
import StepPackage from "./PackageBooking/steps/StepPackage";
import StepSchedule from "./PackageBooking/steps/StepSchedule";
import StepContact from "./PackageBooking/steps/StepContact";
import StepConfirm from "./PackageBooking/steps/StepConfirm";
import { bookingSchema, STEP_FIELDS, type BookingFormValues } from "./PackageBooking/schema";
import { findVoucher, type Voucher } from "./PackageBooking/vouchers";

interface PackageBookingProps {
  initialPackageId?: string;
}

export default function PackageBooking({ initialPackageId }: PackageBookingProps) {
  const [step, setStep] = useState(initialPackageId ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  const handleApplyVoucher = useCallback((code: string): "ok" | "invalid" => {
    const v = findVoucher(code);
    if (v) { setAppliedVoucher(v); return "ok"; }
    return "invalid";
  }, []);

  const handleRemoveVoucher = useCallback(() => setAppliedVoucher(null), []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      packageId: initialPackageId ?? "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      scheduledDate: "",
      scheduledTime: "",
      address: { street: "", ward: "", district: "", city: "" },
      notes: "",
    },
    mode: "onTouched",
  });

  const { setValue, trigger, handleSubmit, control, watch } = form;
  const packageId = useWatch({ control, name: "packageId" }) ?? "";
  const selectedPkg = pricingPackages.find((p) => p.id === packageId);

  // Continuous watching for side summary updates
  const watchedValues = watch();

  const go = useCallback(
    async (dir: 1 | -1) => {
      if (dir === 1) {
        const valid = await trigger(STEP_FIELDS[step]);
        if (!valid) return;
      }
      setDirection(dir);
      setStep((s) => s + dir);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [step, trigger],
  );

  const onSubmit = handleSubmit((data) => {
    alert("Booking submitted!\n\n" + JSON.stringify(data, null, 2));
  });

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-50 pb-2">
        <Stepper currentStep={step} />
      </div>

      <div className="max-w-2xl mx-auto min-h-[450px]">
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
            {step === 0 && (
              <StepPackage
                packageId={packageId}
                onSelect={(id) => {
                  setValue("packageId", id, { shouldValidate: true });
                }}
              />
            )}
            {step === 1 && <StepSchedule form={form} />}
            {step === 2 && <StepContact form={form} />}
            {step === 3 && selectedPkg && (
              <StepConfirm
                form={watchedValues}
                selectedPkg={selectedPkg}
                appliedVoucher={appliedVoucher}
                onApplyVoucher={handleApplyVoucher}
                onRemoveVoucher={handleRemoveVoucher}
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
            className="h-11 px-5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 disabled:opacity-30"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={() => go(1)}
              className="h-11 px-7 rounded-xl bg-gradient-to-r from-[#4988c4] to-[#3a73a8] text-white hover:to-[#2d5d8a] shadow-xl shadow-[#4988c4]/20 transition-all font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 border-none"
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              className="h-11 px-7 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:to-emerald-700 shadow-xl shadow-emerald-500/20 transition-all font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 border-none"
            >
              <Check className="h-4 w-4" /> Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
