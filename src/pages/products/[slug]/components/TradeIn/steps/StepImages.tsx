import React, { useCallback, useEffect, useMemo, useRef, memo } from 'react';
import { Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface StepImagesProps {
  images: File[];
  onImagesChange: (files: File[]) => void;
}

const MIN_REQUIRED_IMAGES = 5;
const MAX_UPLOAD_IMAGES = 12;

export const StepImages = memo(function StepImages({ images, onImagesChange }: StepImagesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewEntries = useMemo(
    () =>
      images.map((file, index) => ({
        key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
        url: URL.createObjectURL(file),
      })),
    [images],
  );

  useEffect(() => {
    return () => {
      previewEntries.forEach((entry) => {
        URL.revokeObjectURL(entry.url);
      });
    };
  }, [previewEntries]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      e.target.value = '';
      return;
    }

    const remainingSlots = Math.max(0, MAX_UPLOAD_IMAGES - images.length);
    if (remainingSlots <= 0) {
      e.target.value = '';
      return;
    }

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    const acceptedFiles = validFiles.slice(0, remainingSlots);

    if (acceptedFiles.length > 0) {
      onImagesChange([...images, ...acceptedFiles]);
    }

    // Allow selecting the same file again in the next pick.
    e.target.value = '';
  }, [images, onImagesChange]);

  const removeImage = useCallback((index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  }, [images, onImagesChange]);

  const remainingRequired = Math.max(0, MIN_REQUIRED_IMAGES - images.length);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-serif italic text-[24px] text-[#1A1A1A] font-normal leading-tight mb-1 flex items-center gap-3">
            Verification Photos
          </h3>
          <p className="text-[12px] text-[#A89E94] font-medium tracking-wide max-w-sm">
            Upload clear documentation. This helps us speed up your approval.
          </p>
        </div>
        <div className="inline-flex items-center justify-center bg-[#F4F7F4] border border-[#3D5140]/10 rounded-full px-3 py-1.5 text-[10px] text-[#3D5140] font-black tracking-widest uppercase shrink-0 h-fit">
           Min. {MIN_REQUIRED_IMAGES} • Max. {MAX_UPLOAD_IMAGES}
        </div>
      </div>

      {/* Compact Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
        <AnimatePresence>
          {previewEntries.map((entry, i) => (
            <motion.div
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              key={entry.key}
              className="group relative aspect-square rounded-[18px] overflow-hidden bg-gray-100 border-[1px] border-[#EDE8E1] shadow-sm"
            >
              <img 
                src={entry.url}
                alt="preview" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => removeImage(i)}
                  className="w-7 h-7 rounded-full bg-white text-rose-500 shadow-xl flex items-center justify-center transition-all transform hover:rotate-90 hover:scale-110"
                >
                   <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "aspect-square rounded-[18px] border-[1.5px] border-dashed flex flex-col items-center justify-center transition-all duration-500 gap-1.5",
            images.length < 5 
              ? "border-[#3D5140]/30 bg-[#F4F7F4]/20 hover:bg-[#F4F7F4]/40 hover:border-[#3D5140]" 
              : "border-[#EDE8E1] bg-white hover:border-[#3D5140]/20"
          )}
        >
           <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#3D5140]">
              <Camera className="w-4 h-4" />
           </div>
           <span className="text-[9px] font-black text-[#3D5140] tracking-[0.05em] uppercase">
              Add
           </span>
           <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        </button>
      </div>

      {/* Minimalist Status Banner */}
      <div className={cn(
        "px-4 py-3 rounded-[20px] flex items-center gap-3 transition-all duration-500 border-[1px]",
        images.length >= MIN_REQUIRED_IMAGES 
          ? "bg-emerald-50/40 border-emerald-100 text-emerald-800" 
          : "bg-amber-50/40 border-amber-100 text-amber-800"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          images.length >= MIN_REQUIRED_IMAGES ? "bg-emerald-500 text-white" : "bg-amber-200 text-amber-700"
        )}>
          {images.length >= MIN_REQUIRED_IMAGES ? <ImageIcon className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        </div>
        <div className="flex-1">
           <span className="block text-[12px] font-bold leading-none mb-0.5">
             {images.length >= MIN_REQUIRED_IMAGES ? 'Requirement Met' : `Remaining: ${remainingRequired} photos`}
           </span>
           <span className="block text-[11px] opacity-70 font-medium tracking-tight">
             {images.length >= MIN_REQUIRED_IMAGES
               ? 'You can proceed to the next step.'
               : `Please upload at least ${MIN_REQUIRED_IMAGES} verification photos.`}
           </span>
        </div>
      </div>
    </div>
  );
});
