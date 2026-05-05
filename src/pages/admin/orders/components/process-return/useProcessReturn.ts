import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { ProcessReturnedRequest } from "@/api/types/shipping";
import { useProcessReturnedShippingTask } from "@/hooks/queries/useShippingTask";
import { uploadEvidenceItems } from "@/utils/evidenceUpload";
import { OTHER_REASON_LABEL } from "@/constants/logistics";
import { MAX_EVIDENCE_FILES } from "./constants";

export type EvidenceStatus = "pending" | "uploading" | "uploaded" | "failed";

export interface EvidenceItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: EvidenceStatus;
  uploadedUrl?: string;
  error?: string;
}

const getEvidenceFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

interface UseProcessReturnProps {
  orderId: string;
  taskId: string;
  onClose: () => void;
  isRefundableMethod?: boolean;
}

export function useProcessReturn({ orderId, taskId, onClose, isRefundableMethod }: UseProcessReturnProps) {
  const processReturned = useProcessReturnedShippingTask();

  // --- State Management ---
  const [damageNote, setDamageNote] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [damagedQty, setDamagedQty] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState(false);
  const [isRefund, setIsRefund] = useState(true);

  const evidenceItemsRef = useRef<EvidenceItem[]>([]);

  // --- Sync Refs & Cleanup ---
  useEffect(() => {
    evidenceItemsRef.current = evidenceItems;
  }, [evidenceItems]);

  useEffect(() => {
    return () => {
      evidenceItemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  // Reset logic if damages cleared
  const hasDamages = Object.keys(damagedQty).length > 0;
  useEffect(() => {
    if (!hasDamages) {
      setDamageNote("");
      setEvidenceItems((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        return [];
      });
    }
  }, [hasDamages]);

  // --- Handlers ---
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

  const addEvidenceFiles = useCallback((files: File[]) => {
    const nextItems = files.map((file) => ({
      id: getEvidenceFileKey(file),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: "pending" as EvidenceStatus,
    }));

    setEvidenceItems((prev) => {
      const merged = [...prev, ...nextItems].slice(0, MAX_EVIDENCE_FILES);
      return merged;
    });
  }, []);

  const removeEvidenceFile = useCallback((targetFile: File) => {
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
      toast.error("No active shipping task found.");
      return;
    }

    if (hasDamages && !damageNote.trim() && selectedReason === OTHER_REASON_LABEL) {
      toast.error("Please provide damage notes.");
      return;
    }

    if (isRefundableMethod && isRefund && evidenceItems.length === 0) {
      toast.error("Evidence is required for refund processing.");
      return;
    }

    let uploadedUrls: string[] = [];
    if ((hasDamages || (isRefundableMethod && isRefund)) && evidenceItems.length > 0) {
      setIsUploadingEvidence(true);
      try {
        uploadedUrls = await uploadEvidenceItems(
          evidenceItems.map(i => ({ id: i.id, file: i.file, uploadedUrl: i.uploadedUrl })),
          {
            concurrency: 3,
            onStart: (id) => updateEvidenceItem(id, { status: "uploading", progress: 0 }),
            onProgress: (id, progress) => updateEvidenceItem(id, { progress }),
            onSuccess: (id, url) => updateEvidenceItem(id, { status: "uploaded", progress: 100, uploadedUrl: url }),
            onError: (id, msg) => updateEvidenceItem(id, { status: "failed", error: msg }),
          }
        );
      } catch {
        toast.error("Evidence upload failed.");
        return;
      } finally {
        setIsUploadingEvidence(false);
      }
    }

    const finalNote = selectedReason === OTHER_REASON_LABEL ? damageNote : selectedReason;
    const requestData: Partial<ProcessReturnedRequest> = {
      damageNote: hasDamages ? finalNote : undefined,
      evidenceUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      damagedItems: hasDamages ? Object.entries(damagedQty).map(([id, qty]) => ({ orderItemId: id, damagedQuantity: qty })) : [],
      isRefund: isRefund
    };

    try {
      await processReturned.mutateAsync({ taskId, orderId, data: requestData as ProcessReturnedRequest });
      toast.success("Return processed successfully.");
      resetAndClose();
    } catch {
      toast.error("Return processing failed.");
    }
  }, [taskId, hasDamages, damageNote, selectedReason, evidenceItems, damagedQty, isRefund, processReturned, orderId, resetAndClose, updateEvidenceItem, isRefundableMethod]);

  // --- Derived ---
  const totalDamaged = useMemo(() => Object.values(damagedQty).reduce((s, q) => s + q, 0), [damagedQty]);
  const isSubmitting = processReturned.isPending || isUploadingEvidence;
  const uploadedCount = useMemo(() => evidenceItems.filter(i => !!i.uploadedUrl).length, [evidenceItems]);

  return {
    state: {
      damageNote,
      selectedReason,
      evidenceItems,
      isUploadingEvidence,
      damagedQty,
      hasDamages,
      totalDamaged,
      expanded,
      isSubmitting,
      uploadedCount,
      isRefund
    },
    actions: {
      setDamageNote,
      setSelectedReason,
      setExpanded,
      setIsRefund,
      handleQtyChange,
      resetAndClose,
      addEvidenceFiles,
      removeEvidenceFile,
      handleConfirm
    }
  };
}
