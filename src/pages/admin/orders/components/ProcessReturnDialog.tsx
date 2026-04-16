import { useState, useCallback, useMemo, useRef, useEffect, memo, type ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RotateCcw, Plus, Minus, ChevronDown, Package, UploadCloud, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { OrderItem } from "@/api/types/order";
import type { ProcessReturnedRequest } from "@/api/types/shipping";
import { useProcessReturnedShippingTask } from "@/hooks/queries/useShippingTask";
import { useVariant } from "@/hooks/queries/useVariant";
import { getColorHex } from "@/utils/color-utils";
import { uploadEvidenceItems } from "@/utils/evidenceUpload";

const MAX_VISIBLE = 3;
const MAX_EVIDENCE_FILES = 5;
const MAX_EVIDENCE_FILE_SIZE_MB = 10;

import { 
  RETURN_REASONS, 
  OTHER_REASON_LABEL 
} from "@/constants/logistics";

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

const getEvidenceFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const formatFileSize = (size: number) => {
  const mb = size / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${Math.round(size / 1024)} KB`;
};

interface ProcessReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  taskId: string;
  items: OrderItem[];
}

export function ProcessReturnDialog({ isOpen, onClose, orderId, taskId, items }: ProcessReturnDialogProps) {
  const [damageNote, setDamageNote] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [damagedQty, setDamagedQty] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState(false);
  const evidenceItemsRef = useRef<EvidenceItem[]>([]);
  const processReturned = useProcessReturnedShippingTask();

  const hasDamages = Object.keys(damagedQty).length > 0;
  const totalDamaged = useMemo(() => Object.values(damagedQty).reduce((s, q) => s + q, 0), [damagedQty]);
  const totalUnits = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const needsCollapse = items.length > MAX_VISIBLE;
  const visibleItems = needsCollapse && !expanded ? items.slice(0, MAX_VISIBLE) : items;
  const hiddenCount = items.length - MAX_VISIBLE;
  const isSubmitting = processReturned.isPending || isUploadingEvidence;
  const uploadedEvidenceCount = useMemo(() => (
    evidenceItems.filter((item) => !!item.uploadedUrl).length
  ), [evidenceItems]);

  useEffect(() => {
    evidenceItemsRef.current = evidenceItems;
  }, [evidenceItems]);

  useEffect(() => {
    return () => {
      evidenceItemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (hasDamages) return;

    setDamageNote("");
    setEvidenceItems((prev) => {
      if (!prev.length) return prev;
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }, [hasDamages]);

  const handleQtyChange = useCallback((id: string, qty: number, max: number) => {
    if (qty < 0 || qty > max) return;
    setDamagedQty(prev => {
      const next = { ...prev };
      if (qty === 0) delete next[id]; else next[id] = qty;
      return next;
    });
  }, []);

  const resetAndClose = useCallback(() => {
    setDamageNote("");
    setSelectedReason("");
    setEvidenceItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    setIsUploadingEvidence(false);
    setDamagedQty({});
    setExpanded(false);
    onClose();
  }, [onClose]);

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

    const existingKeys = new Set(evidenceItems.map((item) => item.id));

    const nextItems = validSizeFiles
      .filter((file) => !existingKeys.has(getEvidenceFileKey(file)))
      .map((file) => ({
        id: getEvidenceFileKey(file),
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: "pending" as EvidenceStatus,
      }));

    setEvidenceItems((prev) => {
      const merged = [...prev, ...nextItems];
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
  }, [evidenceItems]);

  const handleRemoveEvidenceFile = useCallback((targetFile: File) => {
    const targetKey = getEvidenceFileKey(targetFile);

    setEvidenceItems((prev) => {
      const target = prev.find((item) => item.id === targetKey);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== targetKey);
    });
  }, []);

  const updateEvidenceItem = useCallback((id: string, patch: Partial<EvidenceItem>) => {
    setEvidenceItems((prev) => prev.map((item) => (
      item.id === id ? { ...item, ...patch } : item
    )));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!taskId) {
      toast.error("No active shipping task found for this order.");
      return;
    }

    if (hasDamages && !damageNote.trim()) {
      toast.error("Damage notes are required when damages are recorded.");
      return;
    }

    let uploadedEvidenceUrls: string[] = [];

    if (hasDamages && evidenceItems.length > 0) {
      setIsUploadingEvidence(true);

      try {
        uploadedEvidenceUrls = await uploadEvidenceItems(
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
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload evidence. Please retry.";
        toast.error(message);
        return;
      } finally {
        setIsUploadingEvidence(false);
      }
    }

    const finalNote = selectedReason === OTHER_REASON_LABEL ? damageNote : selectedReason;

    const data: Partial<ProcessReturnedRequest> = hasDamages
      ? {
          damageNote: finalNote,
          evidenceUrls: uploadedEvidenceUrls.length > 0 ? uploadedEvidenceUrls : undefined,
          damagedItems: Object.entries(damagedQty).map(([id, qty]) => ({
            orderItemId: id,
            damagedQuantity: qty,
          })),
        }
      : {};

    try {
      await processReturned.mutateAsync({ taskId, orderId, data });
      toast.success("Return processed successfully.");
      resetAndClose();
    } catch {
      toast.error("Failed to process return.");
    }
  }, [hasDamages, damageNote, selectedReason, damagedQty, processReturned, taskId, orderId, resetAndClose, evidenceItems, updateEvidenceItem]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-xl gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">Process Return</DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500">
                Inspect returned items and record damages
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 bg-white max-h-[62vh] overflow-y-auto custom-scrollbar">
          {/* Summary */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Package className="w-4 h-4" />
              <span>
                <span className="font-semibold text-slate-700">{items.length}</span> item{items.length > 1 ? "s" : ""} ·{" "}
                <span className="font-semibold text-slate-700">{totalUnits}</span> units
              </span>
            </div>
            {hasDamages && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                {totalDamaged} damaged
              </span>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2">
            {visibleItems.map((item) => (
              <ReturnItemRow
                key={item.id}
                item={item}
                damaged={damagedQty[item.id] || 0}
                onQtyChange={handleQtyChange}
              />
            ))}
            {needsCollapse && (
              <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-lg transition-colors"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
                {expanded ? "Show less" : `Show ${hiddenCount} more item${hiddenCount > 1 ? "s" : ""}`}
              </button>
            )}
          </div>

          {/* Notes & Evidence */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {hasDamages ? (
              <>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-slate-700">
                      Outcome Reason
                      <span className="text-[11px] font-normal text-rose-500">(Required)</span>
                    </Label>
                    <Select value={selectedReason} onValueChange={setSelectedReason}>
                      <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white">
                        <SelectValue placeholder="Select a reason..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        {RETURN_REASONS.map((r) => (
                          <SelectItem key={r} value={r} className="py-2 text-sm">{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(selectedReason === OTHER_REASON_LABEL || !selectedReason) && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Label className="text-[13px] font-semibold text-slate-700">
                        Detail Notes
                      </Label>
                      <Textarea
                        placeholder="Describe the damages/reason in detail..."
                        value={damageNote}
                        onChange={(e) => setDamageNote(e.target.value)}
                        className="min-h-[86px] resize-none rounded-lg"
                      />
                    </div>
                  )}
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
                        const showProgress = item.status !== "pending" || item.progress > 0;

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
                                      <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${item.progress}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] font-semibold text-blue-600 w-9 text-right">{item.progress}%</span>
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
                              {item.status === "uploaded"
                                ? "Uploaded"
                                : item.status === "uploading"
                                  ? "Uploading"
                                  : item.status === "failed"
                                    ? "Failed"
                                    : "Ready"}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveEvidenceFile(item.file)}
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
            ) : (
              <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-[11px] font-medium text-blue-700">
                No damaged items selected. You can submit immediately as restocked.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={resetAndClose} disabled={isSubmitting} className="border-0 text-slate-500 hover:text-slate-700 rounded-lg h-9 px-4 text-sm">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || (hasDamages && !damageNote.trim())}
            className={cn(
              "border-0 h-9 px-5 rounded-lg font-semibold text-sm text-white shadow-sm gap-2",
              hasDamages ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isUploadingEvidence
              ? `Uploading evidence (${uploadedEvidenceCount}/${evidenceItems.length})...`
              : processReturned.isPending
                ? "Processing..."
                : hasDamages
                  ? "Record Damages"
                  : "Confirm Restock"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Memoized Item Row ───────────────────────────────────────────────

interface ReturnItemRowProps {
  item: OrderItem;
  damaged: number;
  onQtyChange: (id: string, qty: number, max: number) => void;
}

const ReturnItemRow = memo(function ReturnItemRow({ item, damaged, onQtyChange }: ReturnItemRowProps) {
  const isDamaged = damaged > 0;
  const { data: variant } = useVariant(item.comboId ? "" : (item.productVariantId || ""));
  const attributes = (variant?.attributes || {}) as Record<string, unknown>;

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all", isDamaged ? "border-rose-200 bg-rose-50/30" : "border-slate-100 hover:border-slate-200")}>
      <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0">
        <img src={item.image || "/images/placeholder-product.svg"} alt={item.itemName} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{item.itemName}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {variant?.sku && (
            <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{variant.sku}</span>
          )}
          {variant?.size && (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{variant.size}</span>
          )}
          {!!attributes.color && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full ring-1 ring-black/10" style={{ backgroundColor: getColorHex(String(attributes.color)) }} />
              {String(attributes.color)}
            </span>
          )}
          <span className="text-[10px] font-medium text-slate-400">×{item.quantity}</span>
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          disabled={!isDamaged}
          onClick={() => onQtyChange(item.id, damaged - 1, item.quantity)}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
            isDamaged
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-transparent text-slate-300 cursor-not-allowed",
          )}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className={cn("w-7 text-center text-sm font-bold tabular-nums", isDamaged ? "text-rose-600" : "text-slate-400")}>{damaged}</span>
        <button
          type="button"
          disabled={damaged >= item.quantity}
          onClick={() => onQtyChange(item.id, damaged + 1, item.quantity)}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
            damaged < item.quantity
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-transparent text-slate-300 cursor-not-allowed",
          )}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
});
