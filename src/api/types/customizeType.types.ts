// src/api/types/customizeType.types.ts

export type CustomizeTypeCategory = "Other" | "Size" | "Color" | "Pattern" | "Material" | "Embroidery";
export type CustomizeCalculationMode = "FixedAmount" | "Multiplier";
export type ApplicableProductType = "None" | "Mattresses" | "Pillows" | "Cribs";
export type CustomizeTypeStatus = "Active" | "Inactive" | "Archived";

export interface CustomizeTypeResponse {
  id: string;
  name: string;
  summary: string;
  defaultPrice: number;
  category: CustomizeTypeCategory;
  calculationMode: CustomizeCalculationMode;
  defaultMultiplier: number;
  applicableProductType: ApplicableProductType;
  status: CustomizeTypeStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomizeTypePageResponse {
  items: CustomizeTypeResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CustomizeTypeParams {
  pageNumber?: number;
  pageSize?: number;
  name?: string;
  exceedProductCustomizeIds?: string[];
}

export interface CreateCustomizeTypeRequest {
  name: string;
  summary: string;
  defaultPrice: number;
  category: CustomizeTypeCategory;
  calculationMode: CustomizeCalculationMode;
  defaultMultiplier: number;
  applicableProductType: ApplicableProductType;
  status: CustomizeTypeStatus;
}

export interface UpdateCustomizeTypeRequest extends CreateCustomizeTypeRequest {
  id: string;
}
