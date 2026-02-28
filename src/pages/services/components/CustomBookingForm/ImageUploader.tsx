import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Upload, X, MessageSquare, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ImageUploaderProps } from "./types";

interface Props extends ImageUploaderProps {
  description: string;
  onDescriptionChange: (value: string) => void;
}

export default function ImageUploader({
  images,
  previewUrls,
  onImagesChange,
  onPreviewUrlsChange,
  description,
  onDescriptionChange,
  maxImages = 5,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;
      const newFiles = fileArray.slice(0, remainingSlots);

      // Create preview URLs
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));

      onImagesChange([...images, ...newFiles]);
      onPreviewUrlsChange([...previewUrls, ...newUrls]);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [images, previewUrls, maxImages, onImagesChange, onPreviewUrlsChange]
  );

  const removeImage = useCallback(
    (index: number) => {
      URL.revokeObjectURL(previewUrls[index]);
      onPreviewUrlsChange(previewUrls.filter((_, i) => i !== index));
      onImagesChange(images.filter((_, i) => i !== index));
    },
    [images, previewUrls, onImagesChange, onPreviewUrlsChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleImageSelect(e.dataTransfer.files);
    },
    [handleImageSelect]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#4988c4]" />
                Upload Photos
              </CardTitle>
              <CardDescription className="mt-1">
                Take clear photos of items you want cleaned
              </CardDescription>
            </div>
            <Badge variant={previewUrls.length >= maxImages ? "success" : "default"}>
              {previewUrls.length}/{maxImages}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageSelect(e.target.files)}
            className="hidden"
          />

          {/* Upload Area */}
          {previewUrls.length < maxImages && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-300 group
                ${
                  isDragging
                    ? "border-[#4988c4] bg-[#bde8f5]/20 scale-[1.02]"
                    : "border-gray-300 hover:border-[#4988c4] hover:bg-[#bde8f5]/10"
                }
              `}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`
                    flex items-center justify-center h-16 w-16 rounded-full transition-all duration-300
                    ${
                      isDragging
                        ? "bg-[#4988c4] text-white scale-110"
                        : "bg-gray-100 group-hover:bg-[#4988c4] group-hover:text-white"
                    }
                  `}
                >
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">
                    {isDragging ? "Drop images here" : "Click or drag to upload"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 10MB each
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Image Previews */}
          <AnimatePresence mode="popLayout">
            {previewUrls.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                {previewUrls.map((url, index) => (
                  <motion.div
                    key={url}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                    className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Image {index + 1}
                    </Badge>
                  </motion.div>
                ))}

                {/* Add More Button */}
                {previewUrls.length < maxImages && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-[#4988c4] hover:bg-[#bde8f5]/10 transition-all group"
                  >
                    <ImagePlus className="h-6 w-6 text-gray-400 group-hover:text-[#4988c4]" />
                    <span className="text-xs text-gray-400 group-hover:text-[#4988c4]">
                      Add more
                    </span>
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5 text-[#4988c4]" />
            Describe Your Cleaning Needs
          </CardTitle>
          <CardDescription>
            Provide details about stains, materials, sizes, and any special concerns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={4}
              placeholder="Please describe what you want cleaned, any stains or specific concerns, materials, sizes, etc..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#4988c4]/20 focus:border-[#4988c4] outline-none resize-none transition-all text-sm"
            />
            <div className="absolute bottom-3 right-3">
              <Badge
                variant={description.length >= 10 ? "success" : "warning"}
                className="text-xs"
              >
                {description.length}/10+ chars
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
