import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';
import { useServiceActions } from '../hooks/useServiceActions';
import { uploadToCloudinary } from '@/lib/uploadCloudinary';
import { Progress } from "@/components/ui/progress";
interface RefundPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  orderCode: string;
  amount: number;
}

export const RefundPaymentDialog = ({
  isOpen,
  onClose,
  paymentId,
  orderCode,
  amount,
}: RefundPaymentDialogProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { updatePaymentStatus, isUpdatingPaymentStatus } = useServiceActions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleConfirm = async () => {
    if (!selectedFile) {
      updatePaymentStatus({
        id: paymentId,
        status: 'Refunded'
      }, { onSuccess: () => { onClose(); clearFile(); } });
      return;
    }

    try {
      setIsUploading(true);
      // 1. Optimize and Upload to Cloudinary
      const cloudRes = await uploadToCloudinary(selectedFile, {
        onProgress: (p) => setUploadProgress(p)
      });

      // 2. Finalize with backend using the validated status update API
      updatePaymentStatus({
        id: paymentId,
        status: 'Refunded',
        evidenceUrl: cloudRes.secure_url
      }, {
        onSuccess: () => {
          onClose();
          clearFile();
        },
        onError: () => {
          setIsUploading(false);
        }
      });
    } catch (error) {
      console.error("Upload failed", error);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
            Finalize Refund Transaction
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 pt-1">
            Complete the refund process for order <span className="text-slate-900 font-bold">{orderCode}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Refund Amount</span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
            </span>
          </div>

          <div className="space-y-3">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Transaction Evidence
            </Label>

            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-emerald-200 transition-all group bg-slate-50/10">
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="w-8 h-8 mb-2 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  <p className="text-sm text-slate-600 font-bold">Click to upload receipt</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-wider">PNG, JPG, WEBP (MAX. 5MB)</p>
                </div>
                <Input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group bg-slate-100">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {!isUploading && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={clearFile}
                      className="font-bold text-[11px] h-9 px-4"
                    >
                      <X className="h-4 w-4 mr-2" /> Replace Proof
                    </Button>
                  )}
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                    <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-2" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Optimizing & Uploading</span>
                  </div>
                )}
              </div>
            )}

            {isUploading && (
              <div className="space-y-1.5 px-1">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tight">
                  <span className="text-slate-400">Cloudinary Sync</span>
                  <span className="text-emerald-600">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1 bg-slate-100 [&>div]:bg-emerald-500" />
              </div>
            )}
          </div>

          <div className="bg-amber-50/50 rounded-xl p-3 flex gap-3 border border-amber-100/50">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
              Upload evidence is required for audit consistency. Ensure the receipt shows amount and recipient details.
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-10 font-bold text-xs text-slate-500 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isUploading || isUpdatingPaymentStatus}
            className="flex-1 h-10 font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all border-none relative overflow-hidden"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
              </span>
            ) : isUpdatingPaymentStatus ? (
              "Finishing..."
            ) : (
              "Finish Refund"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
