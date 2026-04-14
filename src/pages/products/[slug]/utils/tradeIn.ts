// Trade-in utility functions

export interface TradeInProduct {
  id: string;
  orderId: string;
  porderItemId?: string; // Capturing porder_item_id
  productVariantId?: string; // Capturing ProductVariantId
  name: string;
  image: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  originalPrice: number;
  purchaseDate: string;
  canTradeIn: boolean;
  tradeInUsedAmount?: number;
  cateParentId?: number; // For filtering
  reason?: string;
  tradeInValue?: number;
}

export interface TradeInInfo {
  products: TradeInProduct[];
  totalValue: number;
  percentage: number;
}

// Calculate trade-in value based on original price and percentage
export const calculateTradeInValue = (originalPrice: number, percentage: number = 30): number => {
  // Trade-in values in this project are treated as integer VND amounts.
  return Math.round(originalPrice * (percentage / 100));
};

// Format price in VND (consistent with `formatPrice` in src/lib/utils.ts)
export const formatTradeInPrice = (price: number): string => {
  const safe = Number.isFinite(price) ? price : 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(safe);
};

// Calculate total trade-in value from selected products
export const calculateTotalTradeInValue = (
  selectedProductIds: string[],
  eligibleProducts: TradeInProduct[],
  percentage: number = 30
): number => {
  return selectedProductIds.reduce((total, productId) => {
    const product = eligibleProducts.find(p => p.id === productId);
    if (product && product.canTradeIn) {
      return total + (product.tradeInValue || calculateTradeInValue(product.originalPrice, percentage));
    }
    return total;
  }, 0);
};

// Get trade-in info for cart/checkout
export const getTradeInInfo = (
  selectedProductIds: string[],
  eligibleProducts: TradeInProduct[],
  percentage: number = 30
): TradeInInfo => {
  const selectedProducts = eligibleProducts.filter(
    p => selectedProductIds.includes(p.id) && p.canTradeIn
  );

  return {
    products: selectedProducts,
    totalValue: calculateTotalTradeInValue(selectedProductIds, eligibleProducts, percentage),
    percentage,
  };
};
