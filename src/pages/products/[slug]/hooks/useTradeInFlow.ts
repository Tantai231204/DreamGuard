import { useState, useMemo, useCallback } from 'react';
import { calculateTradeInValue, type TradeInProduct } from '../utils/tradeIn';

export type Step = 'selection' | 'audit' | 'logistics' | 'summary';

export interface TradeInAudit {
  hygienic: boolean;
  noSagginess: boolean;
  surfaceIntegrity: boolean;
}

export type CollectionType = 'pickup' | 'dropoff';

export interface UseTradeInFlowProps {
  eligibleProducts: TradeInProduct[];
  selectedProducts: string[];
  onToggleProduct: (productId: string) => void;
  tradeInPercentage?: number;
}

/**
 * SENIOR HOOK: Decouples business logic from UI rendering
 * - Handles complex step transitions
 * - Manages conditional valuation logic
 * - Prepares payload for future API integration
 */
export function useTradeInFlow({
  eligibleProducts,
  selectedProducts,
  onToggleProduct,
  tradeInPercentage = 30,
}: UseTradeInFlowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('selection');
  
  const [audit, setAudit] = useState<TradeInAudit>({
    hygienic: true,
    noSagginess: true,
    surfaceIntegrity: true,
  });
  
  const [collectionType, setCollectionType] = useState<CollectionType>('pickup');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCount = selectedProducts.length;

  // Stable random order ID for the session
  const [sessionOrderId] = useState(() => Math.floor(Math.random() * 90000 + 10000));

  // Advanced calculation logic with factor-based valuation
  const totalTradeInValue = useMemo(() => {
    return selectedProducts.reduce((total, productId) => {
      const product = eligibleProducts.find(p => p.id === productId);
      if (product && product.canTradeIn) {
        const baseVal = product.tradeInValue || calculateTradeInValue(product.originalPrice, tradeInPercentage);
        
        // Bedding hygiene logic
        if (!audit.hygienic) return total + (baseVal * 0.2); // Recycling flat-rate
        
        const auditFactor = (Object.values(audit).filter(Boolean).length / 3);
        // Base 70% + 30% dynamic based on audit
        return total + (baseVal * (0.7 + (0.3 * auditFactor)));
      }
      return total;
    }, 0);
  }, [selectedProducts, eligibleProducts, tradeInPercentage, audit]);

  const handleNext = useCallback(() => {
    if (step === 'selection' && selectedCount > 0) setStep('audit');
    else if (step === 'audit') setStep('logistics');
    else if (step === 'logistics') setStep('summary');
  }, [step, selectedCount]);

  const handleBack = useCallback(() => {
    if (step === 'audit') setStep('selection');
    else if (step === 'logistics') setStep('audit');
    else if (step === 'summary') setStep('logistics');
  }, [step]);

  const toggleAudit = useCallback((key: keyof TradeInAudit) => {
    setAudit(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // API READINESS: Prepare payload
      const payload = {
        orderId: `ORD-${sessionOrderId}`,
        items: selectedProducts.map(id => eligibleProducts.find(p => p.id === id)),
        audit,
        collectionType,
        totalCredit: totalTradeInValue
      };
      
      console.log('[API CALL Simulation] Submitting Trade-in:', payload);
      
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsOpen(false);
      // Reset after close
      setTimeout(() => setStep('selection'), 300);
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionOrderId, selectedProducts, eligibleProducts, audit, collectionType, totalTradeInValue]);

  return {
    isOpen,
    setIsOpen,
    step,
    setStep,
    audit,
    toggleAudit,
    collectionType,
    setCollectionType,
    selectedCount,
    totalTradeInValue,
    sessionOrderId,
    isSubmitting,
    handleNext,
    handleBack,
    handleComplete,
    onToggleProduct // Fixed: Exposing original toggle function
  };
}
