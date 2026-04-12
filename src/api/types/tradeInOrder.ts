export interface CreateTradeInOrderRequest {
  address: string;
  description?: string;
  phoneNumber: string;
  receiverName: string;
  pOrderItemId: string;
  productVariantId: string;
  isGood: boolean;
}

export interface CalculateTradeInOrderPriceRequest {
  oldProductVariantId: string;
  productVariantId: string;
}

export interface CalculateTradeInOrderPriceResponse {
  estimatedTradeInValue?: number;
  estimatedCredit?: number;
  tradeInValue?: number;
  estimatedAmountToPay?: number;
  amountToPay?: number;
  finalAmount?: number;
  depositAmount?: number;
  minTradeInPrice?: number;
  currentProductPrice?: number;
  [key: string]: unknown;
}

export interface TradeInPayment {
  id: string;
  orderCode: string;
  paymentType: string;
  status: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
}

export interface TradeInImage {
  tradeInImageId: string;
  tradeInOrderId: string;
  imageUrl: string;
  publicId: string;
}

export interface TradeInConversationInfo {
  id?: string;
  conversationId?: string;
  tradeInOrderId?: string;
  customerId?: string;
  staffId?: string;
  createdAt?: string;
}

export interface TradeInOrderDetailResponse {
  tradeInOrderId: string;
  customerId: string;
  productVariantId: string;
  pOrderItemId: string;
  orderCode: string;
  createdAt: string;
  status: string;
  isGood: boolean;
  description: string;
  receiverName: string;
  phoneNumber: string;
  address: string;
  tradeInPrice: number;
  amountToPay: number;
  depositAmount: number;
  payments: TradeInPayment[];
  tradeInImages: TradeInImage[];
  orderItem?: {
    id: string;
    productVariantId: string;
    comboId: string | null;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    tradeInUsedAmount: number;
    productCustomizeDetails: unknown[];
    customizeHash: string;
  };
  productVariant?: {
    id: string;
    sku: string;
    basePrice: number;
    salePrice: number;
    weight: number;
    attributes: Record<string, unknown>;
    size: string;
    isNew: boolean;
    isCustomizable: boolean;
    status: string;
    createdAt: string;
    productId: string;
  };
  conversation?: TradeInConversationInfo | null;
}

export interface TradeInOrderResponse {
  id?: string;
  tradeInOrderId?: string;
  orderId?: string;
  paymentUrl?: string;
  [key: string]: unknown;
}

export interface TradeInOrderListItem {
  tradeInOrderId: string;
  orderCode: string;
  customerId: string;
  productVariantId: string;
  pOrderItemId: string;
  createdAt: string;
  status: string;
  isGood: boolean;
  description: string;
  receiverName: string;
  phoneNumber: string;
  address: string;
  tradeInPrice: number;
  amountToPay: number;
  depositAmount: number;
}

export interface AdminTradeInOrderSearchParams {
  customerId?: string;
  productVariantId?: string;
  status?: string;
  isGood?: boolean;
  tradeInPrice?: number;
  amountToPay?: number;
  depositAmount?: number;
  phoneNumber?: string;
  key?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AdminTradeInOrderListResponse {
  items: TradeInOrderListItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UploadTradeInOrderImagesResponse {
  imageUrls?: string[];
  uploadedUrls?: string[];
  [key: string]: unknown;
}

export interface NegotiateTradeInPriceRequest {
  tradeInPrice: number;
}

export interface UpdateTradeInStatusRequest {
  status: string;
}

export interface TradeInActionResponse {
  success: boolean;
  message: string;
  data?: TradeInOrderDetailResponse;
}

export type TradeInUploadStage = "compressing" | "uploading";

export interface UploadTradeInOrderImagesOptions {
  compress?: boolean;
  onProgress?: (progress: number, stage: TradeInUploadStage) => void;
}
