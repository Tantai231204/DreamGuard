import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ImagePlus, Send, User, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomRequestData } from "../../types";

import FormStepper from "./FormStepper";
import ImageUploader from "./ImageUploader";
import ContactForm from "./ContactForm";
import ReviewSummary from "./ReviewSummary";
import SuccessState from "./SuccessState";

import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customBookingSchema, type CustomBookingFormValues, STEP_FIELDS } from "./schema";
import { useToast } from "@/hooks/useToast";

/* ---------- animation ---------- */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const STEPS = [
  { label: "Request", icon: ImagePlus },
  { label: "Contact", icon: User },
  { label: "Review", icon: ClipboardCheck },
] as const;

const initialFormState: CustomRequestData = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  images: [],
  description: "",
  preferredDate: "",
  preferredTime: "",
  address: { street: "", ward: "", district: "", city: "" },
};

export default function CustomBookingForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toast = useToast();
  const { setValue, watch, trigger, formState: { errors }, reset, handleSubmit } = useForm<CustomBookingFormValues>({
    resolver: zodResolver(customBookingSchema),
    defaultValues: initialFormState as unknown as CustomBookingFormValues,
    mode: "onChange",
  });

  const form = watch() as CustomRequestData;
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  /* ---- navigation ---- */
  const go = useCallback(
    async (dir: 1 | -1) => {
      if (dir === 1) {
        const isValid = await trigger(STEP_FIELDS[step] as Path<CustomBookingFormValues>[]);
        if (!isValid) return;
      }
      setDirection(dir);
      setStep((s) => s + dir);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [step, trigger]
  );

  const setAddr = useCallback(
    (addrUpdate: Partial<CustomRequestData["address"]>) => {
      if (addrUpdate.street !== undefined) setValue("address.street", addrUpdate.street, { shouldValidate: true });
      if (addrUpdate.ward !== undefined) setValue("address.ward", addrUpdate.ward, { shouldValidate: true });
      if (addrUpdate.district !== undefined) setValue("address.district", addrUpdate.district, { shouldValidate: true });
      if (addrUpdate.city !== undefined) setValue("address.city", addrUpdate.city, { shouldValidate: true });
    },
    [setValue]
  );

  const handleContactFieldChange = useCallback(
    (key: string, value: string) => {
      const validKeys = ["customerName", "customerPhone", "customerEmail"] as const;
      if (validKeys.includes(key as typeof validKeys[number])) {
        setValue(key as typeof validKeys[number], value, { shouldValidate: true });
      }
    },
    [setValue]
  );

  /* ---- validation ---- */
  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return form.images.length > 0 && form.description.trim().length >= 10;
      case 1:
        return (
          !!form.customerName &&
          !!form.customerPhone &&
          !!form.address.street &&
          !!form.address.district &&
          !!form.address.city
        );
      default:
        return true;
    }
  }, [step, form]);

  /* ---- submit ---- */
  const onSubmit = handleSubmit((data) => {
    console.log("Custom request submitted:", data);
    setIsSubmitted(true);
    toast.success("Gửi yêu cầu thành công!", "Chúng tôi sẽ sớm phản hồi.");
  });

  /* ---- reset ---- */
  const handleReset = useCallback(() => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setIsSubmitted(false);
    setStep(0);
    reset();
    setPreviewUrls([]);
  }, [previewUrls, reset]);

  if (isSubmitted) {
    return (
      <SuccessState
        contactInfo={form.customerEmail || form.customerPhone}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-50 pb-2">
        <FormStepper steps={STEPS} currentStep={step} />
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
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[9px] font-black uppercase tracking-widest">
                    Step 01
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Post Your Request</h3>
                  <p className="text-xs text-slate-400 font-medium">Add descriptions and photos for dimension sizing lookup details.</p>
                </div>

                <ImageUploader
                  images={form.images}
                  previewUrls={previewUrls}
                  onImagesChange={(files) => setValue("images", files, { shouldValidate: true })}
                  onPreviewUrlsChange={setPreviewUrls}
                  description={form.description}
                  onDescriptionChange={(val) => setValue("description", val, { shouldValidate: true })}
                  maxImages={5}
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[9px] font-black uppercase tracking-widest">
                    Step 02
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Contact Information</h3>
                  <p className="text-xs text-slate-400 font-medium">Verify your coordinate destinations layouts accurately.</p>
                </div>
                <ContactForm
                  customerName={form.customerName}
                  customerPhone={form.customerPhone}
                  customerEmail={form.customerEmail}
                  address={form.address}
                  onFieldChange={handleContactFieldChange}
                  onAddressChange={setAddr}
                  errors={errors}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[9px] font-black uppercase tracking-widest">
                    Step 03
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Review & submit</h3>
                  <p className="text-xs text-slate-400 font-medium">Check your custom booking overview before continuous headers sizing.</p>
                </div>
                <ReviewSummary
                  previewUrls={previewUrls}
                  description={form.description}
                  customerName={form.customerName}
                  customerPhone={form.customerPhone}
                  customerEmail={form.customerEmail}
                  address={form.address}
                  preferredDate={form.preferredDate}
                  preferredTime={form.preferredTime}
                />
              </div>
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

          {step < 2 ? (
            <Button
              type="button"
              onClick={() => go(1)}
              disabled={!canContinue}
              className="h-11 px-7 rounded-xl bg-gradient-to-r from-[#4988c4] to-[#3a73a8] text-white hover:to-[#2d5d8a] shadow-xl shadow-[#4988c4]/20 transition-all font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 border-none disabled:opacity-50"
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!canContinue}
              className="h-11 px-7 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:to-emerald-700 shadow-xl shadow-emerald-500/20 transition-all font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 border-none disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Submit Request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
