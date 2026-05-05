import { memo, type ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { UploadCloud, X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MAX_EVIDENCE_FILES, MAX_EVIDENCE_FILE_SIZE_MB } from "./constants";
import type { EvidenceItem } from "./useProcessReturn";

interface EvidenceUploadSectionProps {
  evidenceItems: EvidenceItem[];
  isSubmitting: boolean;
  uploadedCount: number;
  addEvidenceFiles: (files: File[]) => void;
  removeEvidenceFile: (file: File) => void;
  compact?: boolean;
}

const formatFileSize = (size: number) => {
  const mb = size / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${Math.round(size / 1024)} KB`;
};

export const EvidenceUploadSection = memo(function EvidenceUploadSection({
  evidenceItems,
  isSubmitting,
  uploadedCount,
  addEvidenceFiles,
  removeEvidenceFile,
  compact = false,
}: EvidenceUploadSectionProps) {
  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    const imageFiles = selected.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== selected.length) {
      toast.error("Only image files are allowed for evidence.");
    }

    const maxBytes = MAX_EVIDENCE_FILE_SIZE_MB * 1024 * 1024;
    const validFiles = imageFiles.filter((file) => file.size <= maxBytes);

    if (validFiles.length > 0) {
      addEvidenceFiles(validFiles);
    }

    event.target.value = "";
  };

  return (
    <div className={cn(
      "space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 animate-in fade-in duration-300",
      compact ? "p-2.5" : "p-4"
    )}>
      <div className="flex items-center justify-between gap-3 px-1">
        <Label className={cn("font-bold text-slate-700", compact ? "text-[11px]" : "text-[13px]")}>Audit Evidence</Label>
        <span className={cn(
          "rounded-md bg-white px-2 py-0.5 border border-slate-200 text-slate-400 font-black uppercase tracking-widest shadow-sm",
          compact ? "text-[7.5px]" : "text-[9px]"
        )}>
          {uploadedCount}/{evidenceItems.length} uploaded
        </span>
      </div>

      <label className={cn(
        "group flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed transition-all duration-300",
        compact ? "px-3 py-3" : "px-4 py-6",
        evidenceItems.length >= MAX_EVIDENCE_FILES
          ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-100"
          : "border-slate-300 bg-white hover:border-sky-400 hover:bg-sky-50/50 hover:shadow-md"
      )}>
        <div className="flex flex-col items-center gap-1.5">
          <UploadCloud className={cn("transition-transform group-hover:scale-110", compact ? "h-4 w-4" : "h-6 w-6", evidenceItems.length >= MAX_EVIDENCE_FILES ? "text-slate-300" : "text-primary")} />
          <div className="text-center">
            <span className={cn("font-bold text-slate-700 leading-none", compact ? "text-[11px]" : "text-[13px]")}>Visual Inspection</span>
            <p className={cn("text-slate-400 mt-0.5 leading-none", compact ? "text-[9px]" : "text-[11px]")}>Max {MAX_EVIDENCE_FILES} images</p>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          disabled={isSubmitting || evidenceItems.length >= MAX_EVIDENCE_FILES}
          className="hidden"
        />
      </label>

      {evidenceItems.length > 0 && (
        <div className={cn(
          "space-y-2 mt-3 overflow-y-auto custom-scrollbar pr-1",
          compact ? "max-h-[140px]" : "max-h-[220px]"
        )}>
          {evidenceItems.map((item) => {
            const progress = item.progress;
            const showProgress = item.status !== "pending" || progress > 0;

            return (
              <div key={item.id} className={cn(
                "flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all animate-in slide-in-from-right-2 duration-300",
                compact ? "p-1.5" : "p-2.5"
              )}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={cn(
                    "rounded-md overflow-hidden border border-slate-100 bg-slate-50 shrink-0 shadow-inner",
                    compact ? "w-8 h-8" : "w-11 h-11"
                  )}>
                    <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("font-bold text-slate-700 truncate", compact ? "text-[10px]" : "text-[12px]")}>{item.file.name}</p>
                    <p className={cn("font-medium text-slate-400 tracking-wide uppercase", compact ? "text-[8px]" : "text-[10px]")}>{formatFileSize(item.file.size)}</p>

                    {showProgress && item.status !== 'uploaded' && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden flex-1">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 w-9 text-right">{progress}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "inline-flex items-center gap-1 rounded-md font-black uppercase tracking-widest",
                    compact ? "px-1.5 py-0.5 text-[7px]" : "px-2 py-0.5 text-[9px]",
                    item.status === "uploaded" && "bg-emerald-50 text-emerald-600",
                    item.status === "uploading" && "bg-blue-50 text-blue-600",
                    item.status === "failed" && "bg-rose-50 text-rose-600",
                    item.status === "pending" && "bg-slate-100 text-slate-500",
                  )}>
                    {item.status === "uploaded" && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {item.status === "failed" && <AlertCircle className="w-2.5 h-2.5" />}
                    {item.status === "uploaded" ? "Uploaded" : item.status === "uploading" ? "Uploading" : item.status === "failed" ? "Failed" : "Ready"}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeEvidenceFile(item.file)}
                    disabled={isSubmitting}
                    className={cn(
                      "rounded-md border-0 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all disabled:opacity-50",
                      compact ? "w-6 h-6" : "w-8 h-8"
                    )}
                  >
                    <X className={compact ? "w-3 h-3" : "w-4 h-4"} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
