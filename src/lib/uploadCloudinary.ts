export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
}

export interface UploadCloudinaryOptions {
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onProgress?: (progress: number) => void;
}

export interface UploadManyCloudinaryOptions extends UploadCloudinaryOptions {
  onFileProgress?: (file: File, progress: number) => void;
}

type CompressionOptions = Required<Pick<UploadCloudinaryOptions, "compress" | "maxWidth" | "maxHeight" | "quality">>;

const DEFAULT_UPLOAD_OPTIONS: CompressionOptions = {
  compress: true,
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
};

const createOptimizedImage = async (
  file: File,
  options: CompressionOptions
): Promise<File> => {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to read image for compression"));
      img.src = objectUrl;
    });

    const ratio = Math.min(
      1,
      options.maxWidth / image.width,
      options.maxHeight / image.height
    );

    // Skip re-encoding if the image already fits constraints.
    if (ratio === 1) return file;

    const targetWidth = Math.max(1, Math.round(image.width * ratio));
    const targetHeight = Math.max(1, Math.round(image.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to initialize image compression context");

    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    const outputType = ["image/jpeg", "image/png", "image/webp"].includes(file.type)
      ? file.type
      : "image/jpeg";

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("Failed to generate compressed image blob"));
            return;
          }
          resolve(result);
        },
        outputType,
        options.quality
      );
    });

    return new File([blob], file.name, {
      type: outputType,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const uploadToCloudinary = async (
  file: File,
  options: UploadCloudinaryOptions = {}
): Promise<CloudinaryResponse> => {
  const compressionOptions: CompressionOptions = {
    compress: options.compress ?? DEFAULT_UPLOAD_OPTIONS.compress,
    maxWidth: options.maxWidth ?? DEFAULT_UPLOAD_OPTIONS.maxWidth,
    maxHeight: options.maxHeight ?? DEFAULT_UPLOAD_OPTIONS.maxHeight,
    quality: options.quality ?? DEFAULT_UPLOAD_OPTIONS.quality,
  };

  const fileToUpload = compressionOptions.compress
    ? await createOptimizedImage(file, compressionOptions)
    : file;

  const formData = new FormData()
  formData.append("file", fileToUpload)
  formData.append("upload_preset", "imageforDG")

  options.onProgress?.(0);

  return await new Promise<CloudinaryResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "https://api.cloudinary.com/v1_1/duvdkladk/image/upload");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      options.onProgress?.(Math.min(99, percent));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onabort = () => reject(new Error("Upload aborted"));

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error("Upload failed"));
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText) as CloudinaryResponse;
        options.onProgress?.(100);
        resolve(data);
      } catch {
        reject(new Error("Invalid Cloudinary response"));
      }
    };

    xhr.send(formData);
  });
}

export const uploadManyToCloudinary = async (
  files: File[],
  options: UploadManyCloudinaryOptions = {}
): Promise<CloudinaryResponse[]> => {
  if (!files.length) return [];

  const { onFileProgress, ...uploadOptions } = options;

  return Promise.all(files.map((file) => uploadToCloudinary(file, {
    ...uploadOptions,
    onProgress: (progress) => {
      uploadOptions.onProgress?.(progress);
      onFileProgress?.(file, progress);
    },
  })));
};