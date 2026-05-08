import { useState, useMemo, useCallback } from 'react';
import { type TradeInProduct } from '../utils/tradeIn';

export type Step = 'selection' | 'audit' | 'images' | 'logistics' | 'summary';

export interface TradeInAudit {
  hygienic: boolean;
  noSagginess: boolean;
  surfaceIntegrity: boolean;
  description: string;
  isGood: boolean;
}

export type CollectionType = 'pickup' | 'dropoff';

export interface UseTradeInFlowProps {
  eligibleProducts: TradeInProduct[];
  selectedProducts: string[];
  onToggleProduct: (productId: string) => void;
  currentProductVariantId?: string;
  tradeInPercentage?: number;
  onCreateTradeInOrder?: (payload: {
    pOrderItemId: string;
    productVariantId: string;
    description: string;
    isGood: boolean;
    images: File[];
    address: string;
    phoneNumber: string;
    receiverName: string;
  }) => Promise<void>;
  initialContact?: {
    receiverName: string;
    phoneNumber: string;
    address: string;
  };
}

const DEFAULT_AUDIT: TradeInAudit = {
  hygienic: true,
  noSagginess: true,
  surfaceIntegrity: true,
  description: '',
  isGood: true,
};

const FALLBACK_DESCRIPTION_BY_COLLECTION: Record<CollectionType, string> = {
  pickup: 'Home pickup at delivery',
  dropoff: 'Drop-off at hub',
};

/**
 * useTradeInFlow — Updated to support images and detailed audit.
 */
export function useTradeInFlow({
  eligibleProducts,
  selectedProducts,
  onToggleProduct,
  currentProductVariantId,
  onCreateTradeInOrder,
  initialContact,
}: UseTradeInFlowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('selection');

  const [audit, setAudit] = useState<TradeInAudit>(DEFAULT_AUDIT);

  const [images, setImages] = useState<File[]>([]);
  const [collectionType, setCollectionType] = useState<CollectionType>('pickup');
  const [contact, setContact] = useState({
    receiverName: initialContact?.receiverName || '',
    phoneNumber: initialContact?.phoneNumber || '',
    address: initialContact?.address || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  const selectedCount = selectedProducts.length;
  const [sessionOrderId] = useState(() => Math.floor(Math.random() * 90000 + 10000));

  const eligibleProductsMap = useMemo(() => {
    return new Map(eligibleProducts.map((product) => [product.id, product]));
  }, [eligibleProducts]);

  const selectedTradeInItems = useMemo(() => {
    return selectedProducts
      .map((productId) => eligibleProductsMap.get(productId))
      .filter((product): product is TradeInProduct => Boolean(product));
  }, [eligibleProductsMap, selectedProducts]);

  const selectedTradeInItem = selectedTradeInItems[0];

  const totalTradeInValue = useMemo(() => {
    return selectedTradeInItems.reduce((total, product) => {
      if (product.canTradeIn) {
        return total + (typeof product.tradeInValue === 'number' ? product.tradeInValue : 0);
      }
      return total;
    }, 0);
  }, [selectedTradeInItems]);

  const handleNext = useCallback(() => {
    if (step === 'selection') {
      if (selectedCount === 1) setStep('audit');
    } else if (step === 'audit') {
      setStep('images');
    } else if (step === 'images') {
      if (images.length >= 5) setStep('logistics');
    } else if (step === 'logistics') {
      if (!isManualEntry) setStep('summary');
    }
  }, [step, selectedCount, images.length, isManualEntry]);

  const handleBack = useCallback(() => {
    if (step === 'audit') setStep('selection');
    else if (step === 'images') setStep('audit');
    else if (step === 'logistics') setStep('images');
    else if (step === 'summary') setStep('logistics');
  }, [step]);

  const toggleAudit = useCallback((key: keyof TradeInAudit) => {
    setAudit((prev) => {
      if (typeof prev[key] === 'boolean') {
        return { ...prev, [key]: !prev[key] };
      }
      return prev;
    });
  }, []);

  const setAuditDescription = useCallback((val: string) => {
    setAudit(prev => ({ ...prev, description: val }));
  }, []);

  const setAuditIsGood = useCallback((val: boolean) => {
    setAudit(prev => ({ ...prev, isGood: val }));
  }, []);

  const resetFlow = useCallback(() => {
    setStep('selection');
    setAudit({ ...DEFAULT_AUDIT });
    setImages([]);
    setCollectionType('pickup');
    setContact({
      receiverName: initialContact?.receiverName || '',
      phoneNumber: initialContact?.phoneNumber || '',
      address: initialContact?.address || '',
    });
    setIsManualEntry(false);
  }, [initialContact]);

  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const normalizedCurrentVariantId = currentProductVariantId?.trim();
      const normalizedDescription = audit.description.trim() || FALLBACK_DESCRIPTION_BY_COLLECTION[collectionType];

      if (onCreateTradeInOrder) {
        if (!selectedTradeInItem?.porderItemId) {
          throw new Error('Missing trade-in identifiers for submission.');
        }

        if (!normalizedCurrentVariantId) {
          throw new Error('Missing selected product variant for trade-in submission.');
        }

        await onCreateTradeInOrder({
          pOrderItemId: selectedTradeInItem.porderItemId,
          productVariantId: normalizedCurrentVariantId,
          description: normalizedDescription,
          isGood: audit.isGood,
          images,
          address: contact.address,
          phoneNumber: contact.phoneNumber,
          receiverName: contact.receiverName,
        });
      }

      const payload = {
        orderId: `ORD-${sessionOrderId}`,
        items: selectedTradeInItems,
        audit: { ...audit, description: normalizedDescription },
        imagesCount: images.length,
        collectionType,
        totalCredit: totalTradeInValue
      };
      console.log('[API CALL] Submitting Trade-in:', payload);
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionOrderId, selectedTradeInItem, selectedTradeInItems, audit, images, collectionType, totalTradeInValue, currentProductVariantId, onCreateTradeInOrder, contact.address, contact.phoneNumber, contact.receiverName]);

  return useMemo(() => ({
    isOpen,
    setIsOpen,
    step,
    setStep,
    audit,
    toggleAudit,
    setAuditDescription,
    setAuditIsGood,
    images,
    setImages,
    collectionType,
    setCollectionType,
    contact,
    setContact,
    selectedCount,
    totalTradeInValue,
    sessionOrderId,
    isSubmitting,
    isManualEntry,
    setIsManualEntry,
    resetFlow,
    handleNext,
    handleBack,
    handleComplete,
    onToggleProduct
  }), [
    isOpen, step, audit, toggleAudit, setAuditDescription, setAuditIsGood,
    images, collectionType, contact, selectedCount, totalTradeInValue,
    sessionOrderId, isSubmitting, isManualEntry, setIsManualEntry, resetFlow, handleNext, handleBack,
    handleComplete, onToggleProduct
  ]);
}
