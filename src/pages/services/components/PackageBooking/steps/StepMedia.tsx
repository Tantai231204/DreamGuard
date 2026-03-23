import type { ChangeEvent } from "react";
import { useState } from "react";
import { Camera, Trash2, UploadCloud } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { BookingFormValues } from "../schema";

interface StepMediaProps {
  form: UseFormReturn<BookingFormValues>;
  onFilesChange: (files: File[]) => void;
  initialFiles: File[];
}

export default function StepMedia({ form, onFilesChange, initialFiles }: StepMediaProps) {
  const { setValue } = form;
  const [filesList, setFilesList] = useState<File[]>(initialFiles);
  const [previews, setPreviews] = useState<string[]>(initialFiles.map(f => URL.createObjectURL(f)));

  const MAX_FILES = 5;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const added = Array.from(files);
    if (filesList.length + added.length > MAX_FILES) {
      toast.error(`You can only upload a maximum of ${MAX_FILES} files.`);
      return;
    }

    const nextFiles = [...filesList, ...added];
    setFilesList(nextFiles);
    onFilesChange(nextFiles);

    const nextPreviews = added.map(f => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...nextPreviews]);
    setValue("mediaUploads", nextFiles.map(f => f.name));
  };

  const removeMedia = (index: number) => {
    // Revoke the URL to avoid memory leaks
    if (previews[index]?.startsWith("blob:")) {
      URL.revokeObjectURL(previews[index]);
    }

    const nextFiles = filesList.filter((_, i) => i !== index);
    setFilesList(nextFiles);
    onFilesChange(nextFiles);

    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setValue("mediaUploads", nextFiles.map(f => f.name));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[10px] font-black uppercase tracking-widest">
          Step 03
        </div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Condition Verification</h3>
        <p className="text-sm text-slate-500 font-medium tracking-wide">
          Optional: Upload Photos/Videos of your items for <span className="text-emerald-600 font-bold">Faster Review</span>.
        </p>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex gap-3 items-start">
        <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
          <Camera className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-black text-emerald-900 leading-tight">Faster Preparation & Verification</p>
          <p className="text-xs text-emerald-700 font-medium mt-1 leading-relaxed">
            By providing pictures of stains or condition, our tech crew can prepare the exact solution agents before arrival, reducing audit time on-site.
          </p>
        </div>
      </div>

      {/* Dropzone */}
      <div>
        <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 hover:border-[#4988c4]/40 transition-all group bg-white">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center">
            <div className="p-4 rounded-full bg-slate-50 group-hover:bg-[#4988c4]/10 group-hover:scale-110 transition-all duration-300">
              <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-[#4988c4]" />
            </div>
            <p className="mt-3 text-sm font-black text-slate-700">Drag or click to upload</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Supports JPEG, PNG, MP4 up to 50MB</p>
          </div>
        </label>
      </div>

      {/* Previews Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          {previews.map((src, index) => (
            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
              {src.startsWith("data:video") ? (
                <video src={src} className="w-full h-full object-cover" />
              ) : (
                <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-all transform scale-90 group-hover:scale-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Optional Tag indicator */}
      <p className="text-center text-slate-400 text-xs font-medium tracking-wide">
        You can skip this and proceed to Schedule if no media is available.
      </p>
    </div>
  );
}
