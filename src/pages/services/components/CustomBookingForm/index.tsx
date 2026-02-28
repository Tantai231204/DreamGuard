import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ImagePlus, Send, User, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomRequestData } from "../../types";

import FormStepper from "./FormStepper";
import ImageUploader from "./ImageUploader";
import ContactForm from "./ContactForm";
import ReviewSummary from "./ReviewSummary";
import SuccessState from "./SuccessState";
import type { ContactFormData } from "./types";

/* ---------- animation ---------- */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const STEPS = [
  { label: "Request", icon: ImagePlus },
  { label: "Contact", icon: User },
  { label: "Review", icon: Send },
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

  const [form, setForm] = useState<CustomRequestData>(initialFormState);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  /* ---- navigation ---- */
  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setStep((s) => s + dir);
  }, []);

  /* ---- field helpers ---- */
  const set = useCallback(
    <K extends keyof CustomRequestData>(k: K, v: CustomRequestData[K]) =>
      setForm((prev) => ({ ...prev, [k]: v })),
    []
  );

  const setAddr = useCallback(
    (key: keyof CustomRequestData["address"], val: string) =>
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: val },
      })),
    []
  );

  const handleContactFieldChange = useCallback(
    (key: keyof ContactFormData, value: string) => {
      set(key as keyof CustomRequestData, value);
    },
    [set]
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
  const handleSubmit = useCallback(() => {
    // In real app, this would send to API
    console.log("Custom request submitted:", form);
    setIsSubmitted(true);
  }, [form]);

  /* ---- reset ---- */
  const handleReset = useCallback(() => {
    // Revoke all preview URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    setIsSubmitted(false);
    setStep(0);
    setForm(initialFormState);
    setPreviewUrls([]);
  }, [previewUrls]);

  /* ---- Success State ---- */
  if (isSubmitted) {
    return (
      <SuccessState
        contactInfo={form.customerEmail || form.customerPhone}
        onReset={handleReset}
      />
    );
  }

  /* ========== render ========== */
  return (
    <div className="max-w-2xl mx-auto">
      {/* Info Banner */}
      <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-amber-100 flex-shrink-0">
              <Info className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-sm text-amber-800">
              <strong>How it works:</strong> Upload photos of items you want
              cleaned, describe your requirements, and we'll evaluate and send
              you a custom quote within 24 hours.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stepper */}
      <div className="mb-10">
        <FormStepper steps={STEPS} currentStep={step} />
      </div>

      {/* Step body */}
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
          {/* Step 0: Upload Images & Description */}
          {step === 0 && (
            <ImageUploader
              images={form.images}
              previewUrls={previewUrls}
              onImagesChange={(files) => set("images", files)}
              onPreviewUrlsChange={setPreviewUrls}
              description={form.description}
              onDescriptionChange={(val) => set("description", val)}
              maxImages={5}
            />
          )}

          {/* Step 1: Contact & Preferred Schedule */}
          {step === 1 && (
            <ContactForm
              customerName={form.customerName}
              customerPhone={form.customerPhone}
              customerEmail={form.customerEmail}
              address={form.address}
              preferredDate={form.preferredDate}
              preferredTime={form.preferredTime}
              onFieldChange={handleContactFieldChange}
              onAddressChange={setAddr}
            />
          )}

          {/* Step 2: Review */}
          {step === 2 && (
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
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <Button
          variant="outline"
          size="lg"
          onClick={() => go(-1)}
          disabled={step === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {step < 2 ? (
          <Button
            size="lg"
            onClick={() => go(1)}
            disabled={!canContinue}
            className="gap-2 shadow-lg shadow-[#4988c4]/20"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleSubmit}
            className="gap-2 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
          >
            <Send className="h-5 w-5" /> Submit Request
          </Button>
        )}
      </div>
    </div>
  );
}
