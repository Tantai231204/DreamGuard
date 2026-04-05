import type React from 'react';
import type { TradeInProduct } from '../../utils/tradeIn';

// Re-export from the hook to keep a single source of truth
export type { TradeInAudit, CollectionType, Step } from '../../hooks/useTradeInFlow';

export interface TradeInSelectorProps {
  eligibleProducts: TradeInProduct[];
  selectedProducts: string[];
  onToggleProduct: (productId: string) => void;
  tradeInPercentage?: number;
  className?: string;
}

export interface TradeInTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selectedCount: number;
  totalValue: number;
}
