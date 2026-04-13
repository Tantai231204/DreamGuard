import { memo, useCallback, useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { AppRoute } from '@/lib/constants';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { formatTradeInPrice } from '../../utils/tradeIn';

import { useTradeInFlow, type TradeInAudit } from '../../hooks/useTradeInFlow';
import { STEPS, STEP_LABELS } from './constants';
import type { TradeInSelectorProps } from './types';

import { TradeInTrigger } from './TradeInTrigger';
import { TradeInSidebar } from './TradeInSidebar';
import { TradeInFooter } from './TradeInFooter';
import { StepSelection } from './steps/StepSelection';
import { StepAudit } from './steps/StepAudit';
import { StepImages } from './steps/StepImages';
import { StepLogistics } from './steps/StepLogistics';
import { StepSummary } from './steps/StepSummary';

type StepType = typeof STEPS[number];

export const TradeInSelector = memo(function TradeInSelector({
  eligibleProducts,
  selectedProducts,
  product,
  currentProductVariantId,
  onToggleProduct,
  tradeInPercentage = 30,
  className,
  isEligible = true,
  isOpen = false,
  onOpenChange,
  isLoadingItems = false,
  isLoggedIn = false,
  minTradeInPrice = 0,
  depositAmount = 0,
  currentProductPrice = 0,
  estimatedTradeInValue,
  estimatedAmountToPay,
  isEstimatingPrice = false,
  onCreateTradeInOrder,
  initialContact,
}: TradeInSelectorProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const flow = useTradeInFlow({
    eligibleProducts,
    selectedProducts,
    onToggleProduct,
    currentProductVariantId,
    tradeInPercentage,
    onCreateTradeInOrder,
    initialContact,
  });

  const dialogOpen = onOpenChange ? isOpen : flow.isOpen;
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);

  const setDialogOpen = useCallback((open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
      return;
    }
    flow.setIsOpen(open);
  }, [flow, onOpenChange]);

  const redirectToLogin = useCallback(() => {
    navigate(AppRoute.LOGIN, {
      state: {
        from: `${location.pathname}${location.search}${location.hash}`,
        reason: 'unauthenticated',
      },
    });
  }, [location.hash, location.pathname, location.search, navigate]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (open && !isLoggedIn) {
      redirectToLogin();
      return;
    }

    setDialogOpen(open);

    if (!open) {
      setTimeout(() => flow.resetFlow(), 300);
    }
  }, [flow, isLoggedIn, redirectToLogin, setDialogOpen]);

  const handleSelectSourceItemInSummary = useCallback((productId: string) => {
    if (!productId || selectedProducts[0] === productId) return;
    onToggleProduct(productId);
  }, [onToggleProduct, selectedProducts]);


  const handleComplete = useCallback(async () => {
    try {
      await flow.handleComplete();
      if (selectedProducts[0]) {
        onToggleProduct(selectedProducts[0]);
      }
      toast.success(
        flow.images.length > 0
          ? 'Trade-in order created. Images are uploading in background.'
          : 'Trade-in order created successfully.'
      );
      setDialogOpen(false);
      flow.resetFlow();
    } catch (error) {
      if (error instanceof ApiError) {
        return;
      }

      const description = error instanceof Error ? error.message : 'Unexpected error occurred.';
      toast.error('Action Failed', { description });
    }
  }, [flow, onToggleProduct, selectedProducts, setDialogOpen]);

  const handleOpenCreateConfirm = useCallback(() => {
    if (flow.isSubmitting) return;
    setIsCreateConfirmOpen(true);
  }, [flow.isSubmitting]);

  const handleConfirmCreateTradeIn = useCallback(() => {
    setIsCreateConfirmOpen(false);
    void handleComplete();
  }, [handleComplete]);

  if (!isEligible) {
    return <TradeInTrigger isEligible={false} selectedCount={0} totalValue={0} className={className} />;
  }

  const stepIndex = STEPS.indexOf(flow.step as StepType);
  const safeStepIndex = stepIndex >= 0 ? stepIndex : 0;
  const hasEstimatedTradeInValue = typeof estimatedTradeInValue === 'number';
  const displayTradeInValue = hasEstimatedTradeInValue ? estimatedTradeInValue : 0;
  const selectedSourceProductName = eligibleProducts.find((item) => item.id === selectedProducts[0])?.name || 'selected trade-in item';
  const createConfirmDescription = `DreamGuard will create a trade-in request for "${selectedSourceProductName}" and continue payment for deposit ${formatTradeInPrice(depositAmount)}. Continue now?`;

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={handleDialogOpenChange}
    >
      <DialogTrigger asChild className={className}>
        <TradeInTrigger
          selectedCount={flow.selectedCount}
          totalValue={displayTradeInValue}
        />
      </DialogTrigger>

      <DialogContent
        className={cn(
          '!max-w-[1100px] w-[95vw] h-[750px] p-0 overflow-hidden border-none antialiased',
          'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] bg-[#FDFCFA] flex outline-none gap-0',
          'duration-500 rounded-[32px] [&>button]:hidden'
        )}
      >
        <DialogHeader className="sr-only">
            <DialogTitle>Dream-Renew Trade-In</DialogTitle>
            <DialogDescription>A luxury trade-in flow to upgrade your sanctuary.</DialogDescription>
        </DialogHeader>

        {/* ── Left Sidebar (Brand & Progress) ── */}
        <TradeInSidebar 
          step={flow.step} 
          selectedCount={flow.selectedCount} 
          totalTradeInValue={displayTradeInValue} 
          depositAmount={depositAmount}
          hasEstimatedValue={hasEstimatedTradeInValue}
          isEstimatingPrice={isEstimatingPrice}
        />

        {/* ── Right Content Area ── */}
        <div className="flex-1 flex flex-col h-full bg-[#FDFCFA] relative">
          
          {/* Top progress bar (matching image style) */}
          <div className="h-16 px-10 flex items-center gap-6 border-b border-[#EDE8E1] bg-white flex-shrink-0">
            <div className="flex gap-1.5 w-32">
              {STEPS.map((s) => {
                  const sIdx = STEPS.indexOf(s as typeof STEPS[number]);
                  const currentIdx = STEPS.indexOf(flow.step as typeof STEPS[number]);
                  return (
                    <div
                      key={s}
                      className={cn(
                        'h-[3px] flex-1 rounded-full transition-all duration-700',
                        sIdx <= currentIdx ? 'bg-[#3D5140]' : 'bg-[#E8E2D9]'
                      )}
                    />
                  );
              })}
            </div>
            <div className="text-[11px] text-[#A89E94] font-bold tracking-[0.14em] uppercase flex-1">
              Step {safeStepIndex + 1} of {STEPS.length} — {STEP_LABELS[flow.step] || flow.step}
            </div>
            {/* Custom close button */}
            <button
              onClick={() => handleDialogOpenChange(false)}
              className="w-8 h-8 rounded-full border border-[#EDE8E1] flex items-center justify-center text-[#B0A89E] hover:text-[#3D5140] hover:bg-[#F4F7F4] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-10 py-3 border-b border-[#EDE8E1] bg-[#F6FAF7] flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-[#3D5140]/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3D5140]">
              Pay Today: {formatTradeInPrice(depositAmount)} deposit (selected new variant)
            </span>
            <span className="text-[11px] font-semibold text-[#6A7A6B]">
              Deduction is shown as From estimate from the old variant you select.
            </span>
          </div>

          {/* Precision Content Area */}
          <div className="flex-1 overflow-y-auto px-12 py-12 scrollbar-hide subpixel-antialiased">
            <AnimatePresence mode="wait">
              {flow.step === 'selection' && (
                <StepSelection
                  eligibleProducts={eligibleProducts}
                  selectedProducts={selectedProducts}
                  onToggle={flow.onToggleProduct}
                  isLoading={isLoadingItems}
                  estimatedTradeInValue={estimatedTradeInValue}
                  isEstimatingPrice={isEstimatingPrice}
                  depositAmount={depositAmount}
                />
              )}
              {flow.step === 'audit' && (
                <StepAudit 
                  audit={flow.audit} 
                  onToggle={(key) => flow.toggleAudit(key as keyof TradeInAudit)} 
                  onDescriptionChange={flow.setAuditDescription}
                  onIsGoodChange={flow.setAuditIsGood}
                />
              )}
              {flow.step === 'images' && (
                <StepImages
                   images={flow.images}
                   onImagesChange={flow.setImages}
                />
              )}
              {flow.step === 'logistics' && (
                <StepLogistics
                  collectionType={flow.collectionType}
                  setCollectionType={flow.setCollectionType}
                  contact={flow.contact}
                  setContact={flow.setContact}
                />
              )}
              {flow.step === 'summary' && (
                <StepSummary
                  eligibleProducts={eligibleProducts}
                  selectedProducts={selectedProducts}
                  onSelectTradeInProduct={handleSelectSourceItemInSummary}
                  targetProductName={product?.name}
                  totalTradeInValue={flow.totalTradeInValue}
                  sessionOrderId={flow.sessionOrderId}
                  depositAmount={depositAmount}
                  minTradeInPrice={minTradeInPrice}
                  currentProductPrice={currentProductPrice}
                  estimatedTradeInValue={estimatedTradeInValue}
                  estimatedAmountToPay={estimatedAmountToPay}
                  isEstimatingPrice={isEstimatingPrice}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer (Final Breakdown) */}
          <TradeInFooter
            step={flow.step}
            stepIndex={safeStepIndex}
            selectedCount={flow.selectedCount}
            totalTradeInValue={displayTradeInValue}
            hasEstimatedValue={hasEstimatedTradeInValue}
            isEstimatingPrice={isEstimatingPrice}
            isSubmitting={flow.isSubmitting}
            imagesCount={flow.images.length}
            onBack={flow.handleBack}
            onNext={flow.handleNext}
            onComplete={handleOpenCreateConfirm}
            onClose={() => handleDialogOpenChange(false)}
            contact={flow.contact}
          />

          <ConfirmDialog
            open={isCreateConfirmOpen}
            onOpenChange={setIsCreateConfirmOpen}
            title="Confirm trade-in request creation?"
            description={createConfirmDescription}
            confirmText="Create Request"
            cancelText="Review Again"
            onConfirm={handleConfirmCreateTradeIn}
            variant="tradein"
            isLoading={flow.isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
});
