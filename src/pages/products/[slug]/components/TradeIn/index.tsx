import { memo } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import { useTradeInFlow } from '../../hooks/useTradeInFlow';
import { STEPS, STEP_TITLES } from './constants';
import type { TradeInSelectorProps } from './types';

import { TradeInTrigger } from './TradeInTrigger';
import { TradeInSidebar } from './TradeInSidebar';
import { TradeInFooter } from './TradeInFooter';
import { StepSelection } from './steps/StepSelection';
import { StepAudit } from './steps/StepAudit';
import { StepLogistics } from './steps/StepLogistics';
import { StepSummary } from './steps/StepSummary';

/**
 * TradeInSelector — top-level orchestrator for the Dream-Renew trade-in flow.
 *
 * Architecture:
 *   TradeIn/
 *     index.tsx          ← this file (Dialog + state wiring)
 *     constants.ts       ← STEPS, AUDIT_ITEMS, LOGISTICS_OPTIONS
 *     types.ts           ← local types
 *     TradeInTrigger.tsx ← entry-point button (always visible on product page)
 *     TradeInSidebar.tsx ← step navigator + credit summary
 *     TradeInFooter.tsx  ← Back / Next / Confirm actions
 *     ProductCard.tsx    ← individual trade-in product row
 *     steps/
 *       StepSelection.tsx
 *       StepAudit.tsx
 *       StepLogistics.tsx
 *       StepSummary.tsx
 */
export const TradeInSelector = memo(function TradeInSelector({
  eligibleProducts,
  selectedProducts,
  onToggleProduct,
  tradeInPercentage = 30,
  className,
}: TradeInSelectorProps) {
  const flow = useTradeInFlow({
    eligibleProducts,
    selectedProducts,
    onToggleProduct,
    tradeInPercentage,
  });

  if (eligibleProducts.length === 0) return null;

  const stepIndex = STEPS.indexOf(flow.step as typeof STEPS[number]);

  return (
    <Dialog
      open={flow.isOpen}
      onOpenChange={(open) => {
        flow.setIsOpen(open);
        if (!open) setTimeout(() => flow.setStep('selection'), 300);
      }}
    >
      {/* ── Trigger (always visible on product page) ── */}
      <DialogTrigger asChild className={className}>
        <TradeInTrigger
          selectedCount={flow.selectedCount}
          totalValue={flow.totalTradeInValue}
        />
      </DialogTrigger>

      {/* ── Dialog ── */}
      {/* [&>button:last-of-type]:hidden suppresses Shadcn's built-in close button */}
      <DialogContent
        className={cn(
          'max-w-[1000px] w-[95vw] p-0 overflow-hidden border-none',
          'rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.05)]',
          'bg-white h-[88vh] max-h-[640px] flex gap-0 outline-none',
          '[&>button:last-of-type]:hidden'
        )}
      >
        {/* Sidebar */}
        <TradeInSidebar
          step={flow.step}
          selectedCount={flow.selectedCount}
          totalTradeInValue={flow.totalTradeInValue}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#FDFCFA]">
          {/* Header bar */}
          <div className="h-12 px-6 flex items-center gap-4 border-b border-[#EDE8E1] bg-white flex-shrink-0">
            {/* Progress segments */}
            <div className="flex gap-1.5 w-32">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    'h-[3px] flex-1 rounded-full transition-all duration-500',
                    i <= stepIndex ? 'bg-[#3D5140]' : 'bg-[#E8E2D9]'
                  )}
                />
              ))}
            </div>
            <DialogTitle className="text-[11px] text-[#8C7A6B] font-medium flex-1 tracking-wide">
              {STEP_TITLES[flow.step]}
            </DialogTitle>
            {/* Custom close button (replaces Shadcn's) */}
            <button
              onClick={() => flow.setIsOpen(false)}
              aria-label="Close trade-in dialog"
              className="w-7 h-7 rounded-lg border border-[#EDE8E1] bg-white flex items-center justify-center text-[#B0A89E] hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrollable step body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <AnimatePresence mode="wait">
              {flow.step === 'selection' && (
                <StepSelection
                  eligibleProducts={eligibleProducts}
                  selectedProducts={selectedProducts}
                  onToggle={flow.onToggleProduct}
                />
              )}
              {flow.step === 'audit' && (
                <StepAudit audit={flow.audit} onToggle={flow.toggleAudit} />
              )}
              {flow.step === 'logistics' && (
                <StepLogistics
                  collectionType={flow.collectionType}
                  setCollectionType={flow.setCollectionType}
                />
              )}
              {flow.step === 'summary' && (
                <StepSummary
                  selectedCount={flow.selectedCount}
                  totalTradeInValue={flow.totalTradeInValue}
                  collectionType={flow.collectionType}
                  sessionOrderId={flow.sessionOrderId}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <TradeInFooter
            step={flow.step}
            stepIndex={stepIndex}
            selectedCount={flow.selectedCount}
            totalTradeInValue={flow.totalTradeInValue}
            isSubmitting={flow.isSubmitting}
            onBack={flow.handleBack}
            onNext={flow.handleNext}
            onComplete={flow.handleComplete}
            onClose={() => flow.setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
});
