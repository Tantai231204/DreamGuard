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
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-2xl border border-white/7 bg-[#0f0f11] shadow-2xl">

        {/* Accent bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400" />

        <div className="p-7 space-y-5">

          {/* Header */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-500" strokeWidth={2} />
            </div>
            <div>
              <DialogTitle className="text-[19px] font-semibold text-neutral-100 tracking-tight leading-tight">
                Cancel Order
              </DialogTitle>
              <DialogDescription className="text-[11px] font-mono text-white/25 mt-1 tracking-wide">
                ref: {orderCode || 'N/A'}
              </DialogDescription>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 bg-amber-500/5 border border-amber-500/18 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-[5px] shrink-0" />
            <p className="text-[12px] text-amber-300/85 leading-relaxed">
              This action is irreversible. All active logistics will be aborted and the customer will be notified immediately.
            </p>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <label className="text-[11px] font-medium text-white/35 uppercase tracking-widest">
                Audit reason
              </label>
              <span className="text-[10px] font-mono text-rose-500/50 tracking-wider">
                required
              </span>
            </div>
            <div className="relative">
              <textarea
                rows={4}
                placeholder="Describe why this order is being cancelled..."
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3.5 text-[13.5px] text-neutral-200 placeholder:text-white/20 resize-none outline-none focus:border-rose-500/35 focus:bg-white/6 transition-all duration-200 leading-relaxed font-sans"
                value={reason}
                disabled={isLoading}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim().length >= 10) setError('');
                }}
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-white/20 pointer-events-none">
                {reason.length}
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

        {/* Divider */}
        <div className="h-px bg-white/6 mx-7" />

        {/* Footer */}
        <div className="px-7 py-5 flex items-center gap-2.5">
          <button
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl bg-white/5 border border-white/8 text-[13px] font-medium text-white/45 hover:bg-white/8 hover:text-white/65 hover:border-white/12 transition-all duration-200 disabled:opacity-40"
          >
            Keep order
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl bg-rose-500 text-[13px] font-semibold text-white hover:shadow-lg hover:shadow-rose-500/35 hover:brightness-110 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Cancel order'
            )}
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}