import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason) {
      setError('Please select a reason for cancellation.');
      return;
    }
    setError('');
    const fullLog = description.trim() 
      ? `[${reason}] ${description.trim()}` 
      : reason;
    onConfirm(fullLog);
  };

  const handleClose = (val: boolean) => {
    if (!isLoading) {
      onOpenChange(val);
      if (!val) {
        setReason('');
        setDescription('');
        setError('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-rose-100 shadow-3xl rounded-[28px] gap-0">
        
        {/* Header Section */}
        <div className="p-8 pb-7 bg-[#F8FAFC] border-b border-rose-50 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 opacity-5 rotate-12">
            <AlertCircle className="w-32 h-32 text-rose-500" />
          </div>
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <AlertCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                Abort Logistics Dispatch
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-600 text-[9px] font-black uppercase tracking-widest">Permanent Action</span>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">REF: {orderCode || 'DG-XXXXX'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-7 bg-white">
          {/* Irreversibility Warning */}
          <div className="flex items-start gap-4 p-5 bg-amber-50/60 border border-amber-100/50 rounded-[22px] relative group overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400/50" />
             <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white text-[10px] font-black">!</span>
             </div>
             <p className="text-[12.5px] text-amber-900/80 leading-relaxed font-semibold">
               Confirming this will <span className="font-black text-amber-600 underline decoration-2 underline-offset-4">permanently terminate</span> the dispatch process. This cannot be undone.
             </p>
          </div>

          <div className="space-y-6">
            {/* Reason Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                Termination Protocol Reason
              </label>
              <Select 
                onValueChange={(val) => {
                  setReason(val);
                  setError('');
                }}
                disabled={isLoading}
                value={reason}
              >
                <SelectTrigger className="h-14 px-6 rounded-[20px] border-2 border-slate-100 bg-slate-50/50 hover:border-rose-400/30 transition-all focus:ring-rose-500/10 text-sm font-bold text-slate-700 shadow-sm">
                  <SelectValue placeholder="Identify Reason..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-3xl p-1.5 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Standard Protocols</span>
                  </div>
                  <SelectItem value="Customer requested cancellation" className="rounded-xl py-3 cursor-pointer">Customer requested cancellation</SelectItem>
                  <SelectItem value="Delivery failed (Unreachable)" className="rounded-xl py-3 cursor-pointer">Delivery failed (Unreachable)</SelectItem>
                  <SelectItem value="Stock issues / Unavailable" className="rounded-xl py-3 cursor-pointer">Stock issues / Unavailable</SelectItem>
                  <SelectItem value="Incorrect shipping address" className="rounded-xl py-3 cursor-pointer">Incorrect shipping address</SelectItem>
                  <SelectItem value="Other (See description)" className="rounded-xl py-3 cursor-pointer">Other (See description)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Detailed Notes */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                Audit Registry Notes <span className="text-slate-200 ml-1">(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Detailed explanation for logistics archive..."
                className="w-full bg-slate-50/30 border-2 border-slate-100 rounded-[22px] px-6 py-4 text-[13.5px] text-slate-700 placeholder:text-slate-300 resize-none outline-none focus:border-rose-300 focus:bg-white transition-all duration-300 font-bold shadow-inner"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <p className="text-[11px] text-rose-600 font-black uppercase tracking-tight">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-8 py-7 bg-[#F8FAFC] border-t border-rose-50 flex items-center gap-4">
          <button
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="flex-1 h-12 rounded-[18px] bg-white border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all duration-300 shadow-sm"
          >
            Stay Active
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-12 rounded-[18px] bg-rose-600 text-[11px] font-black uppercase tracking-[0.15em] text-white hover:bg-rose-700 shadow-lg shadow-rose-500/30 active:scale-[0.97] transition-all flex items-center justify-center gap-2 border-none"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Confirm Abort
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}