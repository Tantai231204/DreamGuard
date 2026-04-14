import { uploadToCloudinary, type UploadCloudinaryOptions } from "@/lib/uploadCloudinary";

const DEFAULT_UPLOAD_CONCURRENCY = 3;

export interface EvidenceUploadTask {
  id: string;
  file: File;
  uploadedUrl?: string;
}

export interface UploadEvidenceItemsOptions {
  concurrency?: number;
  uploadOptions?: Omit<UploadCloudinaryOptions, "onProgress">;
  onStart?: (id: string) => void;
  onProgress?: (id: string, progress: number) => void;
  onSuccess?: (id: string, uploadedUrl: string) => void;
  onError?: (id: string, message: string) => void;
}

const normalizeProgress = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};

const buildUploadErrorMessage = (fileName: string) => `Failed to upload ${fileName}.`;

export const uploadEvidenceItems = async (
  items: EvidenceUploadTask[],
  options: UploadEvidenceItemsOptions = {},
): Promise<string[]> => {
  if (!items.length) return [];

  const concurrency = Math.max(
    1,
    Math.min(options.concurrency ?? DEFAULT_UPLOAD_CONCURRENCY, items.length),
  );

  const results: Array<string | undefined> = new Array(items.length);
  const errors: string[] = [];

  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;

      if (index >= items.length) return;

      const item = items[index];

      if (item.uploadedUrl) {
        results[index] = item.uploadedUrl;
        options.onSuccess?.(item.id, item.uploadedUrl);
        continue;
      }

      options.onStart?.(item.id);

      try {
        const uploaded = await uploadToCloudinary(item.file, {
          compress: true,
          maxWidth: 1800,
          maxHeight: 1800,
          quality: 0.82,
          ...options.uploadOptions,
          onProgress: (progress) => {
            options.onProgress?.(item.id, normalizeProgress(progress));
          },
        });

        results[index] = uploaded.secure_url;
        options.onSuccess?.(item.id, uploaded.secure_url);
      } catch {
        const message = buildUploadErrorMessage(item.file.name);
        errors.push(message);
        options.onError?.(item.id, message);
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  if (errors.length > 0) {
    throw new Error(errors[0]);
  }

  return results.filter((value): value is string => Boolean(value));
};