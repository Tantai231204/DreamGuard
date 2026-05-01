import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  X
} from "lucide-react";
import { useServiceActions } from '@/pages/admin/services/hooks/useServiceActions';
import { toast } from 'sonner';
import { uploadEvidenceItems } from '@/utils/evidenceUpload';
import type { PaymentResponse } from '@/api/types/payment';
import type { EvidenceItem, EvidenceStatus } from './payment-types';
import { formatPrice } from '@/pages/profile/utils';

interface UpdatePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentResponse | null;
  orderCode?: string;
  isRefund?: boolean;
}

const PAYMENT_STATUSES = [
  { value: 'Pending', label: 'Pending Management' },
  { value: 'Paid', label: 'Authorized / Paid' },
  { value: 'Failed', label: 'Transaction Failed' },
  { value: 'CODPaid', label: 'COD - Finalized' },
  { value: 'CODUnpaid', label: 'COD - Outstanding' },
];

const REFUND_STATUSES = [
  { value: 'Refunding', label: 'Refunding Process' },
  { value: 'Refunded', label: 'Refunded Successfully' },
  { value: 'Failed', label: 'Refund Failed' },
];

export const UpdatePaymentDialog = React.memo(({
  open,
  onOpenChange,
  payment,
  orderCode,
  isRefund = false
}: UpdatePaymentDialogProps) => {
  const [status, setStatus] = useState<string>('');
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [prevId, setPrevId] = useState<string | null>(null);

  const { updatePaymentStatus, isUpdatingPaymentStatus } = useServiceActions();

  // Optimized sync logic - only triggers when specific identity or visibility changes
  if (open && payment?.id !== prevId) {
    setPrevId(payment?.id || null);
    setStatus(isRefund ? 'Refunded' : (payment?.status || ''));

    if (payment?.evidenceUrl) {
      setEvidenceItems([{
        id: 'existing',
        previewUrl: payment.evidenceUrl,
        status: 'uploaded' as EvidenceStatus,
        progress: 100
      } as EvidenceItem]);
    } else {
      setEvidenceItems([]);
    }
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newItem: EvidenceItem = {
        id: Math.random().toString(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending' as EvidenceStatus,
        progress: 0
      };
      setEvidenceItems([newItem]);
    }
  }, []);

  const clearFile = useCallback(() => {
    setEvidenceItems(prev => {
      prev.forEach(item => {
        if (item.previewUrl && !item.previewUrl.startsWith('http')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      return [];
    });
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!payment?.id) return;

    // Validation: COD payment requires evidence URL if marked as Paid/CODPaid
    const isCOD = payment.paymentMethod?.toLowerCase() === 'cod' || payment.paymentMethod?.toLowerCase() === 'cash';
    const isMarkingAsPaid = status === 'Paid' || status === 'CODPaid';
    const hasNoEvidence = evidenceItems.length === 0;

    if (isCOD && isMarkingAsPaid && hasNoEvidence) {
      toast.error("Evidence image is required for COD payment finalization.");
      return;
    }

    setIsUploading(true);
    let uploadedUrl = payment.evidenceUrl || '';

    try {
      // Only trigger upload if a NEW file is present (exists in items and has actual File object)
      const newItem = evidenceItems.find(i => i.file);

      if (newItem && newItem.file) {
        const urls = await uploadEvidenceItems(
          [{ id: newItem.id, file: newItem.file }],
          {
            onProgress: (id, progress) => {
              setEvidenceItems(prev => prev.map(item =>
                item.id === id ? { ...item, progress, status: 'uploading' as EvidenceStatus } : item
              ));
            },
            onSuccess: (id) => {
              setEvidenceItems(prev => prev.map(item =>
                item.id === id ? { ...item, status: 'uploaded' as EvidenceStatus, progress: 100 } : item
              ));
            }
          }
        );
        if (urls.length > 0) {
          uploadedUrl = urls[0];
        }
      }

      updatePaymentStatus({ id: payment.id, status, evidenceUrl: uploadedUrl }, {
        onSuccess: () => {
          onOpenChange(false);
          setIsUploading(false);
        },
        onError: () => setIsUploading(false)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Synchronization failed.";
      toast.error(message);
      setIsUploading(false);
    }
  }, [payment, status, evidenceItems, onOpenChange, updatePaymentStatus]);

  const currentStatuses = useMemo(() => isRefund ? REFUND_STATUSES : PAYMENT_STATUSES, [isRefund]);
  const previewItem = evidenceItems[0];
  const isBusy = isUploading || isUpdatingPaymentStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-xl">
        <DialogHeader className="px-6 pt-6 text-left">
          <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
            {isRefund ? "Reconcile Refund" : "Update Payment Entry"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 pt-1">
            Manage settlement for order <span className="text-slate-900 font-bold">{orderCode}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div className="bg-slate-100/50 rounded-xl p-4 border border-slate-100 flex items-center justify-between shadow-inner">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Transaction Amount</span>
            <span className="text-lg font-black text-slate-900 tabular-nums">
              {formatPrice(payment?.amount || 0)}
            </span>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1"> Target Status </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white text-sm font-bold focus:ring-0 focus:border-primary/50 transition-all shadow-sm">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 p-1 shadow-xl">
                {currentStatuses.map(s => (
                  <SelectItem key={s.value} value={s.value} className="rounded-lg py-2.5 text-xs font-medium cursor-pointer">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between pointer-events-none">
              Audit Evidence
              {previewItem?.status === 'uploading' && (
                <span className="text-emerald-600 font-black text-[9px]">Uploading {previewItem.progress}%</span>
              )}
            </Label>

            {!previewItem ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-emerald-200 transition-all group bg-slate-50/10">
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="w-6 h-6 mb-2 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  <p className="text-[13px] text-slate-600 font-bold leading-none">Click to upload proof</p>
                  <p className="text-[9px] text-slate-400 uppercase font-black mt-2 tracking-wider">Visual Audit Reference</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group bg-slate-100 shadow-inner">
                <img src={previewItem.previewUrl} alt="Preview" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {!isBusy && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={clearFile}
                      className="font-bold text-[10px] h-8 px-4 rounded-lg uppercase tracking-tight"
                    >
                      <X className="h-4 w-4 mr-2" /> Replace Proof
                    </Button>
                  )}
                </div>
                {isBusy && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                    <Loader2 className="h-6 h-6 text-emerald-500 animate-spin mb-2" />
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Reconciling Logs</span>
                  </div>
                )}
              </div>
            )}

            {isUploading && previewItem && previewItem.file && (
              <div className="space-y-1.5 px-1 animate-in fade-in slide-in-from-top-1">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tight">
                  <span className="text-slate-400">Cloudinary Sync</span>
                  <span className="text-emerald-600">{previewItem.progress}%</span>
                </div>
                <Progress value={previewItem.progress} className="h-1 bg-slate-100 [&>div]:bg-emerald-500" />
              </div>
            )}
          </div>

          <div className="bg-amber-50/50 rounded-xl p-3 flex gap-3 border border-amber-100/50">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] font-medium text-amber-700 leading-relaxed uppercase tracking-tight">
              Audit trails are permanent. Ensure information accuracy before finalization.
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
            className="flex-1 h-10 font-bold text-[11px] text-slate-500 hover:bg-slate-200 transition-colors uppercase tracking-widest"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isBusy || !status}
            className="flex-1 h-10 font-bold text-[11px] uppercase tracking-widest text-white transition-all border-none relative overflow-hidden active:scale-95 shadow-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
          >
            {isBusy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Finalizing
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Commit Entry
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

UpdatePaymentDialog.displayName = 'UpdatePaymentDialog';
