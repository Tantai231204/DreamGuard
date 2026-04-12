import type React from 'react';
import type { TradeInProduct } from '../../utils/tradeIn';
import type { ProductResponse } from '@/api';

export interface CreateTradeInOrderPayload {
  pOrderItemId: string;
  productVariantId: string;
  description: string;
  isGood: boolean;
  images: File[];
  address: string;
  phoneNumber: string;
  receiverName: string;
}

// Re-export from the hook to keep a single source of truth
export type { TradeInAudit, CollectionType, Step } from '../../hooks/useTradeInFlow';

export interface TradeInSelectorProps {
  eligibleProducts: TradeInProduct[];
  selectedProducts: string[];
  product?: ProductResponse | null;
  currentProductVariantId?: string;
  onToggleProduct: (productId: string) => void;
  tradeInPercentage?: number;
  className?: string;
  isEligible?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isLoadingItems?: boolean;
  isLoggedIn?: boolean;
  minTradeInPrice?: number;
  depositAmount?: number;
  currentProductPrice?: number;
  estimatedTradeInValue?: number;
  estimatedAmountToPay?: number;
  isEstimatingPrice?: boolean;
  onCreateTradeInOrder?: (payload: CreateTradeInOrderPayload) => Promise<void>;
  initialContact?: {
    receiverName: string;
    phoneNumber: string;
    address: string;
  };
}

export interface TradeInTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selectedCount: number;
  totalValue: number;
  isEligible?: boolean;
}
