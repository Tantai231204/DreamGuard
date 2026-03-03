// Trade-in utility functions

export interface TradeInProduct {
  id: string;
  orderId: string;
  name: string;
  image: string;
  originalPrice: number;
  purchaseDate: string;
  canTradeIn: boolean;
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
  return Math.round(originalPrice * (percentage / 100) * 100) / 100;
};

// Format price in USD
export const formatTradeInPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
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
