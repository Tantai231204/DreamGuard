import { useCallback, useEffect, useRef, memo, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileImage, FileVideo, X, Loader2, ZoomIn } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface MediaFile {
  id: string
  type: "image" | "video"
  url: string
  name: string
  size: number
}

interface MediaUploadZoneProps {
  media: MediaFile[]
  onMediaChange: (media: MediaFile[]) => void
  maxFiles?: number
  className?: string
}

// Memoized media item component for better performance
const MediaItem = memo(function MediaItem({
  item,
  index,
  onRemove,
  formatFileSize,
}: {
  item: MediaFile
  index: number
  onRemove: (id: string) => void
  formatFileSize: (bytes: number) => string
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: index * 0.03, duration: 0.2 }}
        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        {/* Preview */}
        {item.type === "image" ? (
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        ) : (
          <video
            src={item.url}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
            onLoadedMetadata={() => setIsLoading(false)}
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />

        {/* Icon Badge */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs backdrop-blur-sm">
          {item.type === "image" ? (
            <FileImage className="h-3 w-3" />
          ) : (
            <FileVideo className="h-3 w-3" />
          )}
          <span className="hidden sm:inline">
            {formatFileSize(item.size)}
          </span>
        </div>

        {/* Preview Button */}
        <button
          onClick={() => setShowPreview(true)}
          className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
          aria-label="Xem chi tiết"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
          aria-label="Xóa file"
        >
          <X className="h-4 w-4" />
        </button>

        {/* File Name */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-white text-xs truncate">{item.name}</p>
        </div>
      </motion.div>

      {/* Full Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                />
              ) : (
                <video
                  src={item.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg"
                />
              )}
              <button
                onClick={() => setShowPreview(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                aria-label="Đóng"
              >
                <X className="h-8 w-8" />
              </button>
              <p className="text-white text-center mt-2 text-sm">{item.name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})

function MediaUploadZone({
  media,
  onMediaChange,
  maxFiles = 10,
  className,
}: MediaUploadZoneProps) {
  // Track created object URLs for cleanup
  const createdUrlsRef = useRef<Set<string>>(new Set())

  // Cleanup object URLs on unmount
  useEffect(() => {
    const urlsToCleanup = createdUrlsRef.current
    return () => {
      urlsToCleanup.forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newMedia: MediaFile[] = acceptedFiles.map((file, index) => {
        const url = URL.createObjectURL(file)
        createdUrlsRef.current.add(url) // Track for cleanup
        return {
          id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          type: file.type.startsWith("video/") ? "video" : "image",
          url,
          name: file.name,
          size: file.size,
        }
      })

      onMediaChange([...media, ...newMedia].slice(0, maxFiles))
    },
    [media, maxFiles, onMediaChange]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
    maxFiles: maxFiles - media.length,
    disabled: media.length >= maxFiles,
    maxSize: 50 * 1024 * 1024, // 50MB max
  })

  const handleRemove = useCallback((id: string) => {
    const item = media.find((m) => m.id === id)
    if (item && item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url)
      createdUrlsRef.current.delete(item.url)
    }
    onMediaChange(media.filter((m) => m.id !== id))
  }, [media, onMediaChange])

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }, [])

  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Khu vực tải file">
      {/* Dropzone */}
      {media.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200",
            isDragActive && !isDragReject
              ? "border-[#4988c4] bg-blue-50 scale-[1.01]"
              : isDragReject
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-[#4988c4] hover:bg-gray-50"
          )}
          role="button"
          aria-label="Kéo thả hoặc click để chọn file"
        >
          <input {...getInputProps()} />
          <motion.div
            animate={{ scale: isDragActive ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              isDragReject ? "bg-red-100" : "bg-[#4988c4]/10"
            )}>
              <Upload
                className={cn(
                  "h-6 w-6 transition-colors",
                  isDragReject ? "text-red-500" : isDragActive ? "text-[#4988c4]" : "text-gray-400"
                )}
              />
            </div>
            {isDragReject ? (
              <p className="text-red-500 font-medium">File không hợp lệ!</p>
            ) : isDragActive ? (
              <p className="text-[#4988c4] font-medium">Thả file vào đây...</p>
            ) : (
              <>
                <p className="text-gray-900 font-medium">
                  Kéo thả ảnh/video hoặc click để chọn
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, GIF, MP4, WebM • Tối đa {maxFiles} file • Max 50MB/file
                </p>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* File Preview Grid */}
      <AnimatePresence mode="popLayout">
        {media.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {media.map((item, index) => (
              <MediaItem
                key={item.id}
                item={item}
                index={index}
                onRemove={handleRemove}
                formatFileSize={formatFileSize}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Count & Progress */}
      {media.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#4988c4] to-[#3a73a8]"
              initial={{ width: 0 }}
              animate={{ width: `${(media.length / maxFiles) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {media.length}/{maxFiles} file
          </span>
        </div>
      )}
    </div>
  )
}

export default memo(MediaUploadZone)
