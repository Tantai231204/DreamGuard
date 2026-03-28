// src/api/types/customizeType.types.ts

export interface CustomizeTypeResponse {
  id: string;
  name: string;
  summary: string;
  defaultPrice: number;
  status: string; // "Active" | "Inactive" | etc.
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
  status?: string;
}

export interface UpdateCustomizeTypeRequest extends CreateCustomizeTypeRequest {
  id: string;
}
