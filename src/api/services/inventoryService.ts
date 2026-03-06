// src/api/services/inventoryService.ts
import apiClient from "../../lib/api";

export interface AddStockRequest {
  productVariantId: string;
  quantity: number;
}

export interface ReduceStockRequest {
  productVariantId: string;
  quantity: number;
}

export interface InventoryResponse {
  productVariantId: string;
  stockQuantity: number;
}

export const inventoryService = {
  /** Add stock to a variant */
  addStock: (data: AddStockRequest): Promise<InventoryResponse> =>
    apiClient.post("/inventory/add-stock", data),

  /** Reduce stock from a variant */
  reduceStock: (data: ReduceStockRequest): Promise<InventoryResponse> =>
    apiClient.post("/inventory/reduce-stock", data),
};
