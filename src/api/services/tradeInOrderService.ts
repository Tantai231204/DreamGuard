import apiClient from "@/lib/api";
import type {
  AdminTradeInOrderListResponse,
  AdminTradeInOrderSearchParams,
  CalculateTradeInOrderPriceRequest,
  CalculateTradeInOrderPriceResponse,
  CreateTradeInOrderRequest,
  ReOrderFailedTradeInOrderResponse,
  TradeInOrderResponse,
  TradeInUploadStage,
  UploadTradeInOrderImagesOptions,
  UploadTradeInOrderImagesResponse,
  TradeInOrderDetailResponse,
  TradeInActionResponse,
  TradeInDashboardResponse
} from "@/api/types/tradeInOrder";
import { normalizeTradeInStatus } from '@/utils/tradeInWorkflow';

const LARGE_MAX_IMAGE_EDGE = 1600;
const COMPACT_MAX_IMAGE_EDGE = 1280;
const TARGET_IMAGE_SIZE_DEFAULT = 700_000;
const TARGET_IMAGE_SIZE_MANY_FILES = 500_000;
const TARGET_IMAGE_SIZE_HUGE_FILE = 380_000;
const COMPRESSION_SKIP_THRESHOLD = 500_000;
const MAX_QUALITY = 0.84;
const MIN_QUALITY = 0.44;
const QUALITY_SEARCH_STEPS = 5;
const RESIZE_ATTEMPTS = 3;
const COMPRESSION_CONCURRENCY = 2;

const TRADE_IN_STATUS_HANDLERS = {
  COMPLETED: (tradeInOrderId: string) => tradeInOrderService.completed(tradeInOrderId),
} as const;

type CompressionMimeType = "image/webp" | "image/jpeg";

interface CompressionProfile {
  maxEdge: number;
  targetSizeBytes: number;
  mimeType: CompressionMimeType;
  minQuality: number;
  maxQuality: number;
}

const compressionCache = new WeakMap<File, Map<string, Promise<File>>>();

const WEBP_SUPPORTED = (() => {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
})();

const emitProgress = (
  options: UploadTradeInOrderImagesOptions | undefined,
  progress: number,
  stage: TradeInUploadStage,
) => {
  options?.onProgress?.(Math.max(0, Math.min(100, Math.round(progress))), stage);
};

const toCompressedFilename = (fileName: string, mimeType: CompressionMimeType) => {
  const base = fileName.replace(/\.[^/.]+$/, "").trim();
  const extension = mimeType === "image/webp" ? "webp" : "jpg";
  return `${base || "image"}.${extension}`;
};

const canvasToBlob = async (
  canvas: HTMLCanvasElement | OffscreenCanvas,
  mimeType: CompressionMimeType,
  quality: number,
): Promise<Blob> => {
  if ('convertToBlob' in canvas) {
    return await canvas.convertToBlob({ type: mimeType, quality });
  }
  return new Promise((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => {
        if (!blob) reject(new Error("Failed to create image blob."));
        else resolve(blob);
      },
      mimeType,
      quality,
    );
  });
};

const buildCompressionProfile = (totalFiles: number, file: File): CompressionProfile => {
  const manyFiles = totalFiles >= 8;
  const hugeFile = file.size >= 6_000_000;

  let targetSizeBytes = manyFiles ? TARGET_IMAGE_SIZE_MANY_FILES : TARGET_IMAGE_SIZE_DEFAULT;
  if (hugeFile) {
    targetSizeBytes = Math.min(targetSizeBytes, TARGET_IMAGE_SIZE_HUGE_FILE);
  }

  return {
    maxEdge: manyFiles ? COMPACT_MAX_IMAGE_EDGE : LARGE_MAX_IMAGE_EDGE,
    targetSizeBytes,
    mimeType: WEBP_SUPPORTED ? "image/webp" : "image/jpeg",
    minQuality: MIN_QUALITY,
    maxQuality: MAX_QUALITY,
  };
};

const resolveCacheKey = (profile: CompressionProfile) => {
  return `${profile.maxEdge}-${profile.targetSizeBytes}-${profile.mimeType}-${profile.minQuality}-${profile.maxQuality}`;
};

const chooseBlobByQuality = async (
  canvas: HTMLCanvasElement | OffscreenCanvas,
  profile: CompressionProfile,
): Promise<Blob> => {
  // 1. O(1) Short-circuit: Test max quality first (best visual outcome)
  let bestBlob = await canvasToBlob(canvas, profile.mimeType, profile.maxQuality);
  if (bestBlob.size <= profile.targetSizeBytes) {
    return bestBlob; // Done. Extremely fast path.
  }

  // 2. O(1) Bound check: Test min quality
  const minBlob = await canvasToBlob(canvas, profile.mimeType, profile.minQuality);
  if (minBlob.size > profile.targetSizeBytes) {
    // Even the worst quality is too large, need to downscale resolution instead.
    return minBlob;
  }

  // 3. O(log N) Binary Search: We know the perfect quality lies between min and max
  let low = profile.minQuality;
  let high = profile.maxQuality;

  for (let i = 0; i < QUALITY_SEARCH_STEPS; i += 1) {
    const quality = (low + high) / 2;
    const blob = await canvasToBlob(canvas, profile.mimeType, quality);

    if (blob.size <= profile.targetSizeBytes) {
      bestBlob = blob; // Valid candidate
      low = quality; // Try pushing quality higher for better visuals
    } else {
      high = quality; // Still too large, reduce quality
    }
  }

  return bestBlob;
};

const loadImageElement = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to decode image for compression."));
    };

    image.src = url;
  });
};

const compressImage = (file: File, profile: CompressionProfile): Promise<File> => {
  if (!file.type.startsWith("image/") || file.size <= COMPRESSION_SKIP_THRESHOLD) {
    return Promise.resolve(file);
  }

  const profileKey = resolveCacheKey(profile);
  const profileCache = compressionCache.get(file);
  const cachedTask = profileCache?.get(profileKey);
  if (cachedTask) {
    return cachedTask;
  }

  const task = (async (): Promise<File> => {
    try {
      const image = await loadImageElement(file);

      let width = image.naturalWidth;
      let height = image.naturalHeight;

      const scale = Math.min(1, profile.maxEdge / Math.max(width, height));
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));

      const canvas = typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(width, height)
        : document.createElement("canvas");

      const context = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

      if (!context) {
        return file;
      }

      let bestBlob: Blob | null = null;
      let attempts = 0;

      while (attempts < RESIZE_ATTEMPTS) {
        if ('width' in canvas) {
          canvas.width = width;
          canvas.height = height;
        }
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        const candidate = await chooseBlobByQuality(canvas, profile);

        if (!bestBlob || candidate.size < bestBlob.size) {
          bestBlob = candidate;
        }

        if (candidate.size <= profile.targetSizeBytes) {
          break;
        }

        width = Math.max(1, Math.round(width * 0.82));
        height = Math.max(1, Math.round(height * 0.82));
        attempts += 1;
      }

      if (!bestBlob || bestBlob.size >= file.size * 0.95) {
        return file;
      }

      return new File([bestBlob], toCompressedFilename(file.name, profile.mimeType), {
        type: profile.mimeType,
        lastModified: file.lastModified,
      });
    } catch {
      return file;
    }
  })();

  if (profileCache) {
    profileCache.set(profileKey, task);
  } else {
    compressionCache.set(file, new Map([[profileKey, task]]));
  }

  return task;
};

const compressWithConcurrency = async (
  files: File[],
  options?: UploadTradeInOrderImagesOptions,
): Promise<File[]> => {
  const total = files.length;
  const optimized = new Array<File>(total);
  let completed = 0;
  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= total) {
        return;
      }

      const currentFile = files[currentIndex];
      const profile = buildCompressionProfile(total, currentFile);
      optimized[currentIndex] = await compressImage(currentFile, profile);
      completed += 1;
      emitProgress(options, (completed / total) * 30, "compressing");
    }
  };

  const workerCount = Math.min(COMPRESSION_CONCURRENCY, total);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return optimized;
};

const prepareUploadFiles = async (
  files: File[],
  options?: UploadTradeInOrderImagesOptions,
): Promise<File[]> => {
  const shouldCompress = options?.compress ?? true;
  if (!shouldCompress || files.length === 0) {
    return files;
  }

  return compressWithConcurrency(files, options);
};

const tradeInOrderService = {
  getAdminTradeInOrders: async (
    params?: AdminTradeInOrderSearchParams,
  ): Promise<AdminTradeInOrderListResponse> => {
    const res = await apiClient.get("/TradeInOrders/AdminSearchTradeInOrder", { params });
    return res.data?.data ?? res.data;
  },

  getCustomerTradeInOrders: async (
    params?: { pageNumber?: number; pageSize?: number }
  ): Promise<AdminTradeInOrderListResponse> => {
    const res = await apiClient.get("/TradeInOrders/my-orders", { params });
    return res.data?.data ?? res.data;
  },

  getWaitingOrders: async (
    params?: { pageNumber?: number; pageSize?: number }
  ): Promise<AdminTradeInOrderListResponse> => {
    const res = await apiClient.get("/TradeInOrders/waiting-orders", { params });
    return res.data?.data ?? res.data;
  },

  create: async (payload: CreateTradeInOrderRequest): Promise<TradeInOrderResponse> => {
    const res = await apiClient.post("/TradeInOrders", payload);
    return res.data?.data ?? res.data;
  },

  getTradeInOrderById: async (
    tradeInOrderId: string,
  ): Promise<TradeInOrderDetailResponse> => {
    const res = await apiClient.get(`/TradeInOrders/${tradeInOrderId}`);
    return res.data?.data ?? res.data;
  },

  getTradeInConversationId: async (tradeInOrderId: string): Promise<string | null> => {
    const detail = await tradeInOrderService.getTradeInOrderById(tradeInOrderId);
    const conversationId = detail.conversation?.conversationId || detail.conversation?.id;
    return conversationId || null;
  },

  calculateTradeInOrderPrice: async (
    payload: CalculateTradeInOrderPriceRequest,
  ): Promise<CalculateTradeInOrderPriceResponse> => {
    const res = await apiClient.post("/TradeInOrders/calculate-trade-in-order-price", payload);
    return res.data?.data ?? res.data;
  },

  uploadImages: async (
    tradeInOrderId: string,
    files: File[],
    options?: UploadTradeInOrderImagesOptions,
  ): Promise<UploadTradeInOrderImagesResponse> => {
    emitProgress(options, 1, "compressing");
    const optimizedFiles = await prepareUploadFiles(files, options);

    const formData = new FormData();
    optimizedFiles.forEach((file) => {
      formData.append("files", file);
    });

    const res = await apiClient.post(`/TradeInOrders/${tradeInOrderId}/upload-image`, formData, {
      timeout: 120000,
      onUploadProgress: (event) => {
        const ratio =
          typeof event.progress === "number"
            ? event.progress
            : typeof event.total === "number" && event.total > 0
              ? event.loaded / event.total
              : undefined;

        if (typeof ratio !== "number") return;
        emitProgress(options, 30 + ratio * 70, "uploading");
      },
    });

    emitProgress(options, 100, "uploading");

    return res.data?.data ?? res.data;
  },


  /** POST /TradeInOrders/{id}/confirm?tradeInPrice=... */
  confirmDeal: async (tradeInOrderId: string, tradeInPrice: number): Promise<TradeInActionResponse> => {
    const res = await apiClient.post(`/TradeInOrders/${tradeInOrderId}/confirm`, null, {
      params: { tradeInPrice }
    });
    return res.data;
  },

  /** PATCH /TradeInOrders/{id}/processing */
  processing: async (tradeInOrderId: string): Promise<TradeInActionResponse> => {
    const res = await apiClient.patch(`/TradeInOrders/${tradeInOrderId}/processing`, {});
    return res.data;
  },

  /** PATCH /TradeInOrders/{id}/delivered */
  delivered: async (tradeInOrderId: string): Promise<TradeInActionResponse> => {
    const res = await apiClient.patch(`/TradeInOrders/${tradeInOrderId}/delivered`, {});
    return res.data;
  },

  /** PATCH /TradeInOrders/{id}/completed */
  completed: async (tradeInOrderId: string): Promise<TradeInActionResponse> => {
    const res = await apiClient.patch(`/TradeInOrders/${tradeInOrderId}/completed`, {});
    return res.data;
  },

  /** Transition status helper for component usage */
  updateStatus: async (tradeInOrderId: string, status: string): Promise<TradeInActionResponse> => {
    const normalizedStatus = normalizeTradeInStatus(status);
    const statusHandler = TRADE_IN_STATUS_HANDLERS[normalizedStatus as keyof typeof TRADE_IN_STATUS_HANDLERS];

    if (!statusHandler) {
      throw new Error(`Unsupported status update: ${status}`);
    }

    return statusHandler(tradeInOrderId);
  },

  /** User specific cancel */
  cancelDeal: async (tradeInOrderId: string, reason?: string): Promise<TradeInActionResponse> => {
    const res = await apiClient.patch(`/TradeInOrders/${tradeInOrderId}/cancel`, { reason });
    return res.data;
  },

  /** Retry payment for a failed pending trade-in order */
  reOrderFailedTradeInOrder: async (tradeInOrderId: string): Promise<ReOrderFailedTradeInOrderResponse> => {
    const normalizedId = String(tradeInOrderId || "").trim();
    if (!normalizedId) throw new Error("Missing trade-in order id for re-payment.");

    const res = await apiClient.post(`/TradeInOrders/${normalizedId}/ReOrderFailedTradeIn`);
    const payload = (res.data as { data?: unknown })?.data ?? res.data;
    return payload as ReOrderFailedTradeInOrderResponse;
  },

  /** Admin specific cancel */
  adminCancel: async (tradeInOrderId: string, reason?: string): Promise<TradeInActionResponse> => {
    const res = await apiClient.patch(`/TradeInOrders/${tradeInOrderId}/admin-cancel`, { reason });
    return res.data;
  },

  /** POST /TradeInOrders/:orderId/CreateConversation */
  createConversation: async (tradeInOrderId: string): Promise<Record<string, unknown>> => {
    const res = await apiClient.post(`/TradeInOrders/${tradeInOrderId}/CreateConversation`);
    return res.data?.data ?? res.data;
  },

  getTradeInDashboard: async (params: { fromDate: string; toDate: string }): Promise<TradeInDashboardResponse> => {
    const res = await apiClient.get("/TradeInOrders/get-trade-in-dash-board", { params });
    return res.data?.data ?? res.data;
  },
};



export default tradeInOrderService;
