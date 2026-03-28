// src/api/services/customizeTypeService.ts
import api from "../../lib/api";
import type {
  CustomizeTypePageResponse,
  CustomizeTypeParams,
  CustomizeTypeResponse,
  CreateCustomizeTypeRequest,
} from "../types/customizeType.types";

const customizeTypeService = {
  /** Get all customize types (Paginated) */
  getAll: (params?: CustomizeTypeParams): Promise<CustomizeTypePageResponse> =>
    // Based on Hoppscotch, this uses POST /api/customize-types/get-all
    api.post("/customize-types/get-all", params).then((res) => res.data),

  /** Get customize type detail by ID */
  getById: (id: string): Promise<CustomizeTypeResponse> =>
    api.get(`/customize-types/${id}`).then((res) => res.data?.data ?? res.data),

  /** Create new customize type */
  create: (data: CreateCustomizeTypeRequest): Promise<CustomizeTypeResponse> =>
    api.post("/customize-types", data).then((res) => res.data?.data ?? res.data),

  /** Update customize type */
  update: (id: string, data: CreateCustomizeTypeRequest): Promise<CustomizeTypeResponse> =>
    api.put(`/customize-types/${id}`, data).then((res) => res.data?.data ?? res.data),

  /** Delete customize type */
  delete: (id: string): Promise<void> =>
    api.delete(`/customize-types/${id}`).then((res) => res.data?.data ?? res.data),
};

export default customizeTypeService;
