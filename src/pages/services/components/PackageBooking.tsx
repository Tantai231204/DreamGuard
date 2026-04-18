import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Internal Booking Components & Hooks
import Stepper from "./PackageBooking/Stepper";
import StepProducts from "./PackageBooking/steps/StepProducts";
import StepPackage from "./PackageBooking/steps/StepPackage";
import StepMedia from "./PackageBooking/steps/StepMedia";
import StepSchedule from "./PackageBooking/steps/StepSchedule";
import StepContact from "./PackageBooking/steps/StepContact";
import StepConfirm from "./PackageBooking/steps/StepConfirm";

// Layout & UI Components
import SuccessView from "./PackageBooking/components/layout/SuccessView";
import SubmissionOverlay from "./PackageBooking/components/layout/SubmissionOverlay";

// Logic & Utilities
import { usePackageBooking } from "./PackageBooking/hooks/usePackageBooking";
import { smoothSlideVariants } from "./PackageBooking/constants/animations";

const TOTAL_STEPS = 6;

export default function PackageBooking({ initialPackageId }: { initialPackageId?: string }) {
  const {
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
    
    // Form & Data
    form,
    productTypes,
    getProductTierPrice,
    items,
    total,
    discount,
    
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
  } = usePackageBooking(initialPackageId);

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#4988c4] mb-4" />
        <p className="text-sm font-bold text-slate-500">Wait a moment...</p>
      </div>
    );
  }

  // ====== SUCCESS STATE ======
  if (isSuccess) {
    const values = form.getValues();
    return (
      <SuccessView
        items={items}
        productTypes={productTypes}
        total={total}
        discount={discount}
        scheduledDate={values.scheduledDate}
        scheduledTime={values.scheduledTime}
        getProductTierPrice={getProductTierPrice}
        onReset={() => {
          handleClearDraft();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-50 pb-2">
        <Stepper currentStep={step} />
      </div>

      <div className={step < 5 ? "lg:grid lg:grid-cols-12 lg:gap-12 items-start" : "max-w-2xl mx-auto"}>
        <div className={`min-h-[450px] ${step < 5 ? "lg:col-span-7" : ""}`}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={smoothSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 30,
                opacity: { duration: 0.15 }
              }}
            >
              {step === 0 && <StepProducts form={form} />}
              {step === 1 && <StepPackage form={form} />}
              {step === 2 && <StepMedia form={form} onFilesChange={setUploadedFiles} initialFiles={uploadedFiles} />}
              {step === 3 && <StepSchedule form={form} />}
              {step === 4 && <StepContact form={form} />}
              {step === 5 && (
                <StepConfirm
                  form={form}
                  appliedVoucher={appliedVoucher}
                  availableVouchers={availableVouchers}
                  isVoucherLoading={isLoadingVouchers}
                  isVoucherError={isVoucherError}
                  onApplyVoucher={handleApplyVoucher}
                  onRemoveVoucher={handleRemoveVoucher}
                  onRetryVouchers={refetchVouchers}
                  onEditStep={jumpToStep}
                  isSidebar={false}
                  paymentMethod={paymentMethod}
                  onPaymentChange={setPaymentMethod}
                  onClearDraft={handleClearDraft}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => go(-1)}
                disabled={step === 0 || isSubmitting}
                className="h-11 px-5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all font-bold text-sm flex items-center gap-2 disabled:opacity-30"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            </div>

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
                <Check className="h-4 w-4" /> Confirm Booking
              </Button>
            )}
          </div>
        </div>

        {/* Submission Loading Overlay */}
        <SubmissionOverlay
          isSubmitting={isSubmitting}
          status={submissionStatus}
          progress={uploadProgress}
        />

        {/* Sticky Sidebar (Step 0 - 3) */}
        {step < 5 && (
          <div className="hidden lg:block lg:col-span-5 sticky top-24">
            <StepConfirm
              form={form}
              appliedVoucher={appliedVoucher}
              availableVouchers={availableVouchers}
              isVoucherLoading={isLoadingVouchers}
              isVoucherError={isVoucherError}
              onApplyVoucher={handleApplyVoucher}
              onRemoveVoucher={handleRemoveVoucher}
              onRetryVouchers={refetchVouchers}
              onEditStep={jumpToStep}
              isSidebar={true}
              paymentMethod={paymentMethod}
              onPaymentChange={setPaymentMethod}
              onClearDraft={handleClearDraft}
            />
          </div>
        )}
      </div>
    </div>
  );
}
