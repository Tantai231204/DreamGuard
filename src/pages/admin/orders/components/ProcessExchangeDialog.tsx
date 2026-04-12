import { useState, useCallback, useMemo, memo, useRef, useEffect, type ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RotateCcw, Plus, Minus, FileText, ChevronDown, Package, UserCog, ShieldCheck, ImagePlus, UploadCloud, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { OrderItem } from "@/api/types/order";
import type { ProcessExchangeRequest } from "@/api/types/shipping";
import { useProcessExchangeShippingTask } from "@/hooks/queries/useShippingTask";
import { useVariant } from "@/hooks/queries/useVariant";
import { useStaffs } from "@/hooks/queries/useStaff";
import { getColorHex } from "@/utils/color-utils";
import { uploadToCloudinary } from "@/lib/uploadCloudinary";

const MAX_VISIBLE = 3;
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

const formatStaffRole = (value?: string) => {
  if (!value) return "Delivery Staff";

  return value
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
};

const formatFileSize = (size: number) => {
  const mb = size / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${Math.round(size / 1024)} KB`;
};

const getEvidenceFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

interface ProcessExchangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  taskId: string;
  items: OrderItem[];
}

export function ProcessExchangeDialog({ isOpen, onClose, orderId, taskId, items }: ProcessExchangeDialogProps) {
  const [exchangeNote, setExchangeNote] = useState("");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [damagedQty, setDamagedQty] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState(false);
  const evidenceInputRef = useRef<HTMLInputElement | null>(null);
  const evidenceItemsRef = useRef<EvidenceItem[]>([]);

  const processExchange = useProcessExchangeShippingTask();
  const { data: staffData, isLoading: isLoadingStaff } = useStaffs({
    pageSize: 100,
    Role: "DeliveryStaff",
  });

  const staffs = useMemo(() => {
    const raw = staffData?.items || [];
    return raw.filter((s) => {
      const role = (s.role || "").toLowerCase();
      const pos = (s.position || "").toLowerCase();
      return role === "deliverystaff" || pos === "deliverystaff";
    });
  }, [staffData]);

  const hasDamages = Object.keys(damagedQty).length > 0;
  const totalDamaged = useMemo(() => Object.values(damagedQty).reduce((s, q) => s + q, 0), [damagedQty]);
  const totalUnits = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const needsCollapse = items.length > MAX_VISIBLE;
  const visibleItems = needsCollapse && !expanded ? items.slice(0, MAX_VISIBLE) : items;
  const hiddenCount = items.length - MAX_VISIBLE;
  const isSubmitting = processExchange.isPending || isUploadingEvidence;
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

  const handleQtyChange = useCallback((id: string, qty: number, max: number) => {
    if (qty < 0 || qty > max) return;
    setDamagedQty((prev) => {
      const next = { ...prev };
      if (qty === 0) delete next[id]; else next[id] = qty;
      return next;
    });
  }, []);

  const resetAndClose = useCallback(() => {
    setExchangeNote("");
    setEvidenceItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    setIsUploadingEvidence(false);
    setSelectedStaffId("");
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

    if (!selectedStaffId) {
      toast.error("Please choose replacement shipping staff.");
      return;
    }

    if (!hasDamages) {
      toast.error("Please select at least one damaged item.");
      return;
    }

    const uploadedEvidenceUrls: string[] = [];

    if (evidenceItems.length > 0) {
      setIsUploadingEvidence(true);

      try {
        for (const item of evidenceItems) {
          if (item.uploadedUrl) {
            uploadedEvidenceUrls.push(item.uploadedUrl);
            continue;
          }

          updateEvidenceItem(item.id, {
            status: "uploading",
            progress: 0,
            error: undefined,
          });

          try {
            const uploaded = await uploadToCloudinary(item.file, {
              compress: true,
              maxWidth: 1800,
              maxHeight: 1800,
              quality: 0.82,
              onProgress: (progress) => {
                updateEvidenceItem(item.id, {
                  status: "uploading",
                  progress,
                });
              },
            });

            uploadedEvidenceUrls.push(uploaded.secure_url);
            updateEvidenceItem(item.id, {
              status: "uploaded",
              progress: 100,
              uploadedUrl: uploaded.secure_url,
              error: undefined,
            });
          } catch {
            updateEvidenceItem(item.id, {
              status: "failed",
              error: "Upload failed",
            });
            toast.error(`Failed to upload ${item.file.name}. Please retry.`);
            return;
          }
        }
      } finally {
        setIsUploadingEvidence(false);
      }
    }

    const data: ProcessExchangeRequest = {
      newStaffId: selectedStaffId,
      exchangeNote: exchangeNote.trim() || undefined,
      evidenceUrls: uploadedEvidenceUrls,
      damagedItems: Object.entries(damagedQty).map(([id, qty]) => ({
        orderItemId: id,
        damagedQuantity: qty,
      })),
    };

    try {
      await processExchange.mutateAsync({ taskId, orderId, data });
      toast.success("Exchange request submitted successfully.");
      resetAndClose();
    } catch {
      toast.error("Failed to process exchange request.");
    }
  }, [taskId, selectedStaffId, hasDamages, exchangeNote, evidenceItems, damagedQty, processExchange, orderId, resetAndClose, updateEvidenceItem]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-xl gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4.5 h-4.5 text-blue-700" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">Recovery Workflow</p>
              <DialogTitle className="text-base font-bold text-slate-900">Process Exchange</DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500">
                Create replacement shipment for returned damaged items
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 bg-white max-h-[62vh] overflow-y-auto custom-scrollbar">
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-blue-700 leading-relaxed">
                Record only verified damaged quantities. The system will create replacement shipping and keep the audit trail for this order.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
              <UserCog className="w-3.5 h-3.5 text-slate-400" />
              Replacement Staff
              <span className="text-[11px] font-normal text-rose-500">(Required)</span>
            </Label>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId} disabled={isLoadingStaff || isSubmitting}>
              <SelectTrigger className="h-9 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-300 focus:ring-blue-200/60 text-sm">
                <SelectValue placeholder={isLoadingStaff ? "Loading staff..." : "Select replacement delivery staff"} />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-slate-200">
                {staffs.map((staff) => (
                  <SelectItem key={staff.staffId} value={staff.staffId} className="py-2.5">
                    <div className="flex min-w-0 flex-col leading-tight">
                      <span className="font-semibold text-sm text-slate-800 truncate">{staff.fullName}</span>
                      <span className="text-[11px] text-slate-500 truncate">
                        {staff.phoneNumber || "No phone"} • {formatStaffRole(staff.role || staff.position)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="space-y-2">
            {visibleItems.map((item) => (
              <ExchangeItemRow
                key={item.id}
                item={item}
                damaged={damagedQty[item.id] || 0}
                onQtyChange={handleQtyChange}
              />
            ))}
            {needsCollapse && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50/70 rounded-lg transition-colors"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
                {expanded ? "Show less" : `Show ${hiddenCount} more item${hiddenCount > 1 ? "s" : ""}`}
              </button>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Exchange Note
                <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
              </label>
              <Textarea
                placeholder="Describe exchange reason and any handling notes..."
                value={exchangeNote}
                onChange={(e) => setExchangeNote(e.target.value)}
                className="resize-none min-h-[80px] rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-300 focus:ring-blue-200/60 placeholder:text-slate-400 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
                <ImagePlus className="w-3.5 h-3.5 text-slate-400" />
                Evidence Upload
                <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 space-y-3">
                <input
                  ref={evidenceInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEvidenceFilesChange}
                  disabled={isSubmitting}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-500">
                    Upload up to {MAX_EVIDENCE_FILES} images. Max {MAX_EVIDENCE_FILE_SIZE_MB}MB per file.
                  </p>
                  <button
                    type="button"
                    onClick={() => evidenceInputRef.current?.click()}
                    disabled={isSubmitting || evidenceItems.length >= MAX_EVIDENCE_FILES}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-blue-200 bg-white text-[11px] font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Choose Files
                  </button>
                </div>

                {evidenceItems.length > 0 && (
                  <div className="space-y-2">
                    {evidenceItems.map((item) => {
                      const progress = item.progress;
                      const showProgress = item.status !== "pending" || progress > 0;

                      return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-md overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[12px] font-medium text-slate-700 truncate">{item.file.name}</p>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0",
                                  item.status === "uploaded" && "bg-emerald-50 text-emerald-600",
                                  item.status === "uploading" && "bg-blue-50 text-blue-600",
                                  item.status === "failed" && "bg-rose-50 text-rose-600",
                                  item.status === "pending" && "bg-slate-100 text-slate-500"
                                )}
                              >
                                {item.status === "uploaded" && <CheckCircle2 className="w-3 h-3" />}
                                {item.status === "failed" && <AlertCircle className="w-3 h-3" />}
                                {item.status === "uploaded" ? "Uploaded" : item.status === "uploading" ? "Uploading" : item.status === "failed" ? "Failed" : "Ready"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">{formatFileSize(item.file.size)}</p>
                            {showProgress && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden flex-1">
                                  <div
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-semibold text-blue-600 w-9 text-right">{progress}%</span>
                              </div>
                            )}
                            {item.status === "failed" && item.error && (
                              <p className="text-[10px] text-rose-500 mt-1">{item.error}</p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidenceFile(item.file)}
                          disabled={isSubmitting}
                          className="w-7 h-7 rounded-md border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )})}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={resetAndClose} disabled={isSubmitting} className="text-slate-500 hover:text-slate-700 rounded-lg h-9 px-4 text-sm">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedStaffId || !hasDamages || !taskId}
            className="h-9 px-5 rounded-lg font-semibold text-sm text-white shadow-sm gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isUploadingEvidence
              ? `Uploading evidence (${uploadedEvidenceCount}/${evidenceItems.length})...`
              : processExchange.isPending
                ? "Processing..."
                : "Submit Exchange"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ExchangeItemRowProps {
  item: OrderItem;
  damaged: number;
  onQtyChange: (id: string, qty: number, max: number) => void;
}

const ExchangeItemRow = memo(function ExchangeItemRow({ item, damaged, onQtyChange }: ExchangeItemRowProps) {
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
          className={cn("w-7 h-7 rounded-md flex items-center justify-center transition-colors border", isDamaged ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50" : "border-transparent text-slate-300 cursor-not-allowed")}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className={cn("w-7 text-center text-sm font-bold tabular-nums", isDamaged ? "text-rose-600" : "text-slate-400")}>{damaged}</span>
        <button
          type="button"
          disabled={damaged >= item.quantity}
          onClick={() => onQtyChange(item.id, damaged + 1, item.quantity)}
          className={cn("w-7 h-7 rounded-md flex items-center justify-center transition-colors border", damaged < item.quantity ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50" : "border-transparent text-slate-300 cursor-not-allowed")}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
});
