import api, { ApiError, type CustomAxiosRequestConfig } from "../../lib/api";
import type {
  BabyProfile,
  CreateBabyProfilePayload,
  UpdateBabyProfilePayload,
} from "../types/babyProfile";

// GET ALL
export const getBabyProfiles = async (): Promise<BabyProfile[]> => {
  try {
    const res = await api.get("/BabyProfiles?pageNumber=1", {
      _suppressToast: true,
    } as CustomAxiosRequestConfig);
    return res.data?.items ?? res.data;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      // Nếu backend trả 404 vì không có dữ liệu
      if (error.status === 404) {
        return [];
      }
      console.log("GET BABY PROFILES ERROR:", error.message);
    } else {
      console.log("GET BABY PROFILES ERROR:", error);
    }
    throw error;
  }
};

// GET BY ID
export const getBabyProfileById = async (id: string): Promise<BabyProfile> => {
  const res = await api.get(`/BabyProfiles/${id}`);
  return res.data;
};

// CREATE
export const createBabyProfile = async (
  payload: CreateBabyProfilePayload,
): Promise<string> => {
  try {
    const res = await api.post("/BabyProfiles", payload)
    return res.data
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.log("CREATE ERROR:", error.message)
    } else {
      console.log("CREATE ERROR:", error)
    }
    throw error
  }
}

// UPDATE
export const updateBabyProfile = async (
  payload: UpdateBabyProfilePayload,
): Promise<void> => {
  const { babyId, ...data } = payload

  try {
    await api.put(`/BabyProfiles/${babyId}`, data)
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.log("UPDATE ERROR:", error.message)
    } else {
      console.log("UPDATE ERROR:", error)
    }
    throw error
  }
}

// DELETE
export const deleteBabyProfile = async (id: string): Promise<void> => {
  await api.delete(`/BabyProfiles/${id}`);
};
