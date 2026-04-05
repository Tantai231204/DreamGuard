import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  orderCode?: string;
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  orderCode,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (reason.trim().length < 10) {
      setError('Please provide at least 10 characters for the audit log.');
      return;
    }
    setError('');
    onConfirm(reason);
  };

  const handleClose = (val: boolean) => {
    if (!isLoading) {
      onOpenChange(val);
      if (!val) {
        setReason('');
        setError('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-3xl">

        {/* Accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400" />

        <div className="p-7 space-y-5">

          {/* Header */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-500" strokeWidth={2} />
            </div>
            <div>
              <DialogTitle className="text-[19px] font-black text-slate-900 tracking-tight leading-tight uppercase tracking-tighter">
                Cancel Dispatch Order
              </DialogTitle>
              <DialogDescription className="text-[11px] font-mono text-slate-400 mt-1 tracking-wide font-bold">
                LOGISTIC REF: {orderCode || 'N/A'}
              </DialogDescription>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-[5px] shrink-0 animate-pulse" />
            <p className="text-[12px] text-amber-700 leading-relaxed font-medium">
              This action is <span className="font-black underline underline-offset-2">irreversible</span>. All active logistics will be aborted and the customer will be notified immediately.
            </p>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Audit Audit Reason
              </label>
              <span className="text-[10px] font-mono text-rose-500/50 tracking-wider">
                required
              </span>
            </div>
            <div className="relative">
              <textarea
                rows={4}
                placeholder="Describe why this dispatch is being terminated..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[13.5px] text-slate-900 placeholder:text-slate-300 resize-none outline-none focus:border-rose-300 focus:bg-white transition-all duration-200 leading-relaxed font-bold shadow-inner"
                value={reason}
                disabled={isLoading}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim().length >= 10) setError('');
                }}
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] font-black text-slate-300 pointer-events-none">
                {reason.length} CHARS
              </span>
            </div>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 px-0.5"
                >
                  <div className="w-0.5 h-3.5 rounded-full bg-rose-500 shrink-0" />
                  <p className="text-[11.5px] text-rose-500">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 bg-slate-50 border-t border-slate-100 flex items-center gap-2.5">
          <button
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl bg-white border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 shadow-sm"
          >
            Keep Order
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl bg-rose-600 text-[11px] font-black uppercase tracking-widest text-white hover:bg-rose-700 shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all flex items-center justify-center border-none"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Abort Logistics'
            )}
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}