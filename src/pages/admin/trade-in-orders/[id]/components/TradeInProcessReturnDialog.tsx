import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { toast } from "react-hot-toast";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  UploadCloud,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useProcessReturnedTradeInShippingTask } from "@/hooks/queries/useShippingTask";
import { useVariant } from "@/hooks/queries/useVariant";
import { getColorHex } from "@/utils/color-utils";
import { uploadEvidenceItems } from "@/utils/evidenceUpload";

const MAX_EVIDENCE_FILES = 5;
const MAX_EVIDENCE_FILE_SIZE_MB = 10;

type EvidenceStatus = "pending" | "uploading" | "uploaded" | "failed";

interface EvidenceItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: EvidenceStatus;
  uploadedUrl?: string;
  error?: string;
}

interface TradeInProcessReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tradeInOrderId: string;
  taskId: string;
  defaultProductVariantId?: string;
}

const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const formatFileSize = (size: number) => {
  const mb = size / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${Math.round(size / 1024)} KB`;
};

const getEvidenceStatusLabel = (status: EvidenceStatus) => {
  if (status === "uploaded") return "Uploaded";
  if (status === "uploading") return "Uploading";
  if (status === "failed") return "Failed";
  return "Ready";
};

export function TradeInProcessReturnDialog({
  isOpen,
  onClose,
  tradeInOrderId,
  taskId,
  defaultProductVariantId,
}: TradeInProcessReturnDialogProps) {
  const [damageNote, setDamageNote] = useState("");
  const [isDamagedSelected, setIsDamagedSelected] = useState(false);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const evidenceItemsRef = useRef<EvidenceItem[]>([]);
  const resolvedProductVariantId = useMemo(
    () => String(defaultProductVariantId || "").trim(),
    [defaultProductVariantId],
  );
  const canMarkDamaged = Boolean(resolvedProductVariantId);

  const processReturned = useProcessReturnedTradeInShippingTask();
  const { data: targetVariant, isLoading: isLoadingTargetVariant } = useVariant(resolvedProductVariantId);
  const isSubmitting = processReturned.isPending || isUploadingEvidence;
  const isDamagedOutcome = isDamagedSelected && canMarkDamaged;
  const targetVariantAttributes = (targetVariant?.attributes || {}) as Record<string, unknown>;
  const targetVariantColor = typeof targetVariantAttributes.color === "string" ? targetVariantAttributes.color : "";

  useEffect(() => {
    evidenceItemsRef.current = evidenceItems;
  }, [evidenceItems]);

  useEffect(() => {
    return () => {
      evidenceItemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsDamagedSelected(false);
      setDamageNote("");
      setEvidenceItems((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        return [];
      });
      setIsUploadingEvidence(false);
    }
  }, [isOpen]);

  const uploadedEvidenceCount = useMemo(
    () => evidenceItems.filter((item) => !!item.uploadedUrl).length,
    [evidenceItems],
  );

  const resetAndClose = useCallback(() => {
    setDamageNote("");
    setIsDamagedSelected(false);
    setEvidenceItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    setIsUploadingEvidence(false);
    onClose();
  }, [onClose]);

  const handleOutcomeSelect = useCallback(
    (damaged: boolean) => {
      if (damaged && !canMarkDamaged) return;
      setIsDamagedSelected(damaged);
      if (!damaged) {
        setDamageNote("");
        setEvidenceItems((prev) => {
          prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
          return [];
        });
      }
    },
    [canMarkDamaged],
  );

  const updateEvidenceItem = useCallback((id: string, patch: Partial<EvidenceItem>) => {
    setEvidenceItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const handleEvidenceFilesChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    const imageFiles = selected.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== selected.length) {
      toast.error("Only image files are allowed for evidence.");
    }

    const maxBytes = MAX_EVIDENCE_FILE_SIZE_MB * 1024 * 1024;
    const validSizeFiles = imageFiles.filter((file) => file.size <= maxBytes);
    if (validSizeFiles.length !== imageFiles.length) {
      toast.error(`Some files exceed ${MAX_EVIDENCE_FILE_SIZE_MB}MB and were skipped.`);
    }

    setEvidenceItems((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));
      const incoming = validSizeFiles
        .filter((file) => !existingIds.has(getFileKey(file)))
        .map((file) => ({
          id: getFileKey(file),
          file,
          previewUrl: URL.createObjectURL(file),
          progress: 0,
          status: "pending" as EvidenceStatus,
        }));

      const merged = [...prev, ...incoming];
      if (merged.length <= MAX_EVIDENCE_FILES) return merged;

      const allowed = merged.slice(0, MAX_EVIDENCE_FILES);
      const allowedIds = new Set(allowed.map((item) => item.id));
      merged.forEach((item) => {
        if (!allowedIds.has(item.id)) URL.revokeObjectURL(item.previewUrl);
      });

      toast.error(`You can upload up to ${MAX_EVIDENCE_FILES} evidence images.`);
      return allowed;
    });

    event.target.value = "";
  }, []);

  const handleRemoveEvidenceFile = useCallback((id: string) => {
    setEvidenceItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const uploadEvidenceUrls = useCallback(async (): Promise<string[]> => {
    if (!evidenceItems.length) return [];

    return uploadEvidenceItems(
      evidenceItems.map((item) => ({
        id: item.id,
        file: item.file,
        uploadedUrl: item.uploadedUrl,
      })),
      {
        concurrency: 3,
        uploadOptions: {
          compress: true,
          maxWidth: 1800,
          maxHeight: 1800,
          quality: 0.82,
        },
        onStart: (id) => {
          updateEvidenceItem(id, {
            status: "uploading",
            progress: 0,
            error: undefined,
          });
        },
        onProgress: (id, progress) => {
          updateEvidenceItem(id, {
            status: "uploading",
            progress,
          });
        },
        onSuccess: (id, uploadedUrl) => {
          updateEvidenceItem(id, {
            status: "uploaded",
            progress: 100,
            uploadedUrl,
            error: undefined,
          });
        },
        onError: (id, message) => {
          updateEvidenceItem(id, {
            status: "failed",
            error: message,
          });
        },
      },
    );
  }, [evidenceItems, updateEvidenceItem]);

  const handleConfirm = useCallback(async () => {
    if (!taskId) {
      toast.error("No active shipping task found for this trade-in order.");
      return;
    }

    try {
      if (isDamagedOutcome && evidenceItems.length > 0) {
        setIsUploadingEvidence(true);
      }
      const evidenceUrls = isDamagedOutcome ? await uploadEvidenceUrls() : [];
      const normalizedProductVariantId = isDamagedOutcome ? resolvedProductVariantId : "";

      await processReturned.mutateAsync({
        taskId,
        tradeInOrderId,
        data: {
          damageNote: isDamagedOutcome ? damageNote.trim() || undefined : undefined,
          evidenceUrls: isDamagedOutcome && evidenceUrls.length > 0 ? evidenceUrls : undefined,
          productVariantId: normalizedProductVariantId || undefined,
        },
      });

      toast.success(
        normalizedProductVariantId
          ? "Processed as RefundedAndDamaged."
          : "Processed as RefundedAndRestocked.",
      );

      resetAndClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process trade-in return.";
      toast.error(message);
    } finally {
      setIsUploadingEvidence(false);
    }
  }, [
    damageNote,
    isDamagedOutcome,
    processReturned,
    resetAndClose,
    resolvedProductVariantId,
    taskId,
    tradeInOrderId,
    uploadEvidenceUrls,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-xl gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-base font-bold text-slate-900">Process Trade-In Return</DialogTitle>
          <DialogDescription className="text-[13px] text-slate-500">
            Returning branch: choose restocked or damaged outcome.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 bg-white max-h-[62vh] overflow-y-auto custom-scrollbar">
          <div
            className={cn(
              "rounded-lg px-3 py-2.5 text-[11px] font-medium border",
              isDamagedOutcome
                ? "border-rose-100 bg-rose-50/60 text-rose-700"
                : "border-blue-100 bg-blue-50/60 text-blue-700",
            )}
          >
            {isDamagedOutcome
              ? "Damaged outcome selected. Return will be processed as RefundedAndDamaged."
              : "Restock outcome selected. Return will be processed as RefundedAndRestocked."}
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-slate-700">Return Outcome</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOutcomeSelect(false)}
                disabled={isSubmitting}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition disabled:opacity-60",
                  !isDamagedOutcome
                    ? "border-blue-300 bg-blue-50/70"
                    : "border-slate-200 bg-white hover:border-blue-200",
                )}
              >
                <p className="text-[12px] font-semibold text-slate-800">RefundedAndRestocked</p>
                <p className="text-[11px] text-slate-500 mt-0.5">No damage recorded</p>
              </button>

              <button
                type="button"
                onClick={() => handleOutcomeSelect(true)}
                disabled={isSubmitting || !canMarkDamaged}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition disabled:opacity-60",
                  isDamagedOutcome
                    ? "border-rose-300 bg-rose-50/70"
                    : "border-slate-200 bg-white hover:border-rose-200",
                )}
              >
                <p className="text-[12px] font-semibold text-slate-800">RefundedAndDamaged</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Record damaged variant info</p>
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Trade-Up Variant</p>
              {!resolvedProductVariantId ? (
                <p className="text-[12px] text-slate-500 mt-1">No linked target variant ID for this order.</p>
              ) : isLoadingTargetVariant ? (
                <p className="text-[12px] text-slate-500 mt-1">Loading variant info...</p>
              ) : (
                <div className="mt-1.5 flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-sm font-semibold text-slate-800">
                    {targetVariant?.sku || "Trade-up variant"}
                  </span>
                  <span className="truncate text-[11px] text-slate-500 inline-flex items-center gap-1.5 mt-0.5">
                    {targetVariant?.size ? `Size ${targetVariant.size}` : ""}
                    {targetVariantColor && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: getColorHex(targetVariantColor) }}
                          />
                          {targetVariantColor}
                        </span>
                      </>
                    )}
                  </span>
                  <span className="truncate text-[10px] text-slate-400 font-mono mt-0.5">
                    {resolvedProductVariantId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isDamagedOutcome && (
            <>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-slate-700">Damage Note</Label>
                <Textarea
                  value={damageNote}
                  onChange={(event) => setDamageNote(event.target.value)}
                  placeholder="Enter damage or return note"
                  className="min-h-[86px] resize-none rounded-lg"
                />
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-[13px] font-semibold text-slate-700">Evidence Upload</Label>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">
                    {uploadedEvidenceCount}/{evidenceItems.length} uploaded
                  </span>
                </div>

                <label className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-[12px] font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50/50">
                  <UploadCloud className="h-4 w-4 text-rose-500 transition group-hover:scale-105" />
                  <span>Choose evidence images</span>
                  <span className="text-[10px] font-medium text-slate-400">(max {MAX_EVIDENCE_FILES})</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEvidenceFilesChange}
                    disabled={isSubmitting || evidenceItems.length >= MAX_EVIDENCE_FILES}
                    className="hidden"
                  />
                </label>

                <p className="text-[11px] text-slate-500">Only image files up to {MAX_EVIDENCE_FILE_SIZE_MB}MB per file.</p>

                {evidenceItems.length > 0 && (
                  <div className="space-y-2">
                    {evidenceItems.map((item) => {
                      const progress = item.status === "uploaded"
                        ? 100
                        : Math.max(0, Math.min(100, Math.round(item.progress || 0)));
                      const showProgress = item.status !== "pending" || progress > 0;

                      return (
                        <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-md overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                              <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-medium text-slate-700 truncate">{item.file.name}</p>
                              <p className="text-[10px] text-slate-400">{formatFileSize(item.file.size)}</p>
                              {showProgress && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden flex-1">
                                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                  </div>
                                  <span className="text-[10px] font-semibold text-blue-600 w-9 text-right">{progress}%</span>
                                </div>
                              )}
                              {item.status === "failed" && item.error && (
                                <p className="text-[10px] text-rose-500 mt-1">{item.error}</p>
                              )}
                            </div>
                          </div>

                          <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold",
                            item.status === "uploaded" && "bg-emerald-50 text-emerald-600",
                            item.status === "uploading" && "bg-blue-50 text-blue-600",
                            item.status === "failed" && "bg-rose-50 text-rose-600",
                            item.status === "pending" && "bg-slate-100 text-slate-500",
                          )}>
                            {item.status === "uploaded" && <CheckCircle2 className="w-3 h-3" />}
                            {item.status === "failed" && <AlertCircle className="w-3 h-3" />}
                            {getEvidenceStatusLabel(item.status)}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveEvidenceFile(item.id)}
                            disabled={isSubmitting}
                            className="w-7 h-7 rounded-md border-0 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center disabled:opacity-60"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={resetAndClose} disabled={isSubmitting} className="border-0">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !taskId}
            className={cn(
              "border-0 text-white shadow-none gap-2",
              isDamagedOutcome
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-blue-600 hover:bg-blue-700",
            )}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUploadingEvidence
              ? `Uploading evidence (${uploadedEvidenceCount}/${evidenceItems.length})...`
              : processReturned.isPending
                ? "Processing..."
                : (
              <span className="inline-flex items-center gap-2">
                <Package className="w-4 h-4" />
                {isDamagedOutcome ? "Record Damages" : "Confirm Restock"}
              </span>
                )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
