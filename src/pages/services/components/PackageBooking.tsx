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

  const { setValue, trigger, handleSubmit, control } = form;
  const packageId = useWatch({ control, name: "packageId" }) ?? "";
  const selectedPkg = pricingPackages.find((p) => p.id === packageId);

  const go = useCallback(
    async (dir: 1 | -1) => {
      if (dir === 1) {
        const valid = await trigger(STEP_FIELDS[step]);
        if (!valid) return;
      }
      setDirection(dir);
      setStep((s) => s + dir);
    },
    [step, trigger],
  );

  const onSubmit = handleSubmit((data) => {
    alert("Booking submitted!\n\n" + JSON.stringify(data, null, 2));
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Stepper currentStep={step} />

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
              form={form.getValues()}
              selectedPkg={selectedPkg}
              appliedVoucher={appliedVoucher}
              onApplyVoucher={handleApplyVoucher}
              onRemoveVoucher={handleRemoveVoucher}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-10">
        <Button
          type="button"
          variant="outline"
          onClick={() => go(-1)}
          disabled={step === 0}
          size="lg"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {step < 3 ? (
          <Button
            type="button"
            size="lg"
            onClick={() => go(1)}
            className="gap-2 shadow-lg shadow-blue-200"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={onSubmit}
            className="gap-2 bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 shadow-lg shadow-green-200"
          >
            <Check className="h-5 w-5" /> Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
}
