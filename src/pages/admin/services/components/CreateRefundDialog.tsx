import { useState, useEffect } from 'react';
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
import { RotateCcw, Calculator, Percent, AlertCircle } from 'lucide-react';
import { useServiceActions } from '../hooks/useServiceActions';
import { formatPrice } from '@/lib/utils';

interface CreateRefundDialogProps {
  isOpen: boolean;
  onClose: () => void;
  soId: string;
  orderCode: string;
  totalAmount: number;
}

export const CreateRefundDialog = ({
  isOpen,
  onClose,
  soId,
  orderCode,
  totalAmount,
}: CreateRefundDialogProps) => {
  const [percentage, setPercentage] = useState<number>(100);
  const [amount, setAmount] = useState<number>(totalAmount);
  const [reason, setReason] = useState<string>("Service Refund");
  const { createRefund, isCreatingRefund } = useServiceActions();

  useEffect(() => {
    const calculated = (totalAmount * percentage) / 100;
    setAmount(calculated);
  }, [percentage, totalAmount]);

  const handlePercentageChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPercentage(Math.min(100, Math.max(0, num)));
    } else if (val === '') {
      setPercentage(0);
    }
  };

  const handleAmountChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setAmount(num);
      setPercentage(Math.round((num / totalAmount) * 100));
    } else if (val === '') {
      setAmount(0);
      setPercentage(0);
    }
  };

  const handleConfirm = () => {
    createRefund({
      soId,
      reason,
      amount
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 pb-0">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 border border-rose-100 shadow-sm shadow-rose-500/10">
            <RotateCcw className="h-7 w-7 text-rose-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Initialize Refund
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium italic pt-2">
            Compute and authorize a refund for order <span className="text-slate-900 font-bold not-italic">{orderCode}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Refund Percentage
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={percentage}
                  onChange={(e) => handlePercentageChange(e.target.value)}
                  className="pl-9 h-12 rounded-xl border-slate-200 focus:border-rose-500 transition-all font-bold"
                  placeholder="0-100"
                />
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Computed Amount
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="pl-9 h-12 rounded-xl border-slate-200 focus:border-rose-500 transition-all font-bold"
                />
                <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Refund Reason
            </Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-12 rounded-xl border-slate-200 focus:border-rose-500 transition-all font-medium"
              placeholder="Enter reason for audit..."
            />
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Original Settlement</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="h-px bg-slate-200/50 w-full" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Net Refund Amount</span>
              <span className="text-xl font-black text-rose-600 tabular-nums tracking-tighter">{formatPrice(amount)}</span>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 border border-amber-100/50">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-[11px] font-medium text-amber-700 leading-tight italic">
              Initialization will create a 'Refunding' transaction. You will need to finalize it with bank evidence thereafter.
            </p>
          </div>
        </div>

        <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100 gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100"
          >
            Abort
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isCreatingRefund || amount <= 0}
            className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-500/20 active:scale-95 transition-all h-12"
          >
            {isCreatingRefund ? "Initializing..." : "Authorize Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
