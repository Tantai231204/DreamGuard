import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAdminCreateRefund } from '@/hooks/queries/usePayment';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { RotateCcw, Loader2, Wallet, AlertCircle } from 'lucide-react';

const refundSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters long'),
});

type RefundFormValues = z.infer<typeof refundSchema>;

interface TradeInRefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradeInOrderId: string;
  orderCode: string;
  depositAmount: number;
}

export function TradeInRefundDialog({
  open,
  onOpenChange,
  tradeInOrderId,
  orderCode,
  depositAmount,
}: TradeInRefundDialogProps) {
  const { mutate: createRefund, isPending } = useAdminCreateRefund();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RefundFormValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      reason: '',
    },
  });

  const onSubmit = (values: RefundFormValues) => {
    createRefund(
      {
        tradeInOrderId,
        amount: depositAmount,
        reason: values.reason,
      },
      {
        onSuccess: () => {
          toast.success('Refund request created successfully');
          onOpenChange(false);
          reset();
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || 'Failed to create refund request');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden border-none rounded-lg shadow-none max-w-md bg-white">
        <DialogHeader className="px-6 pt-6 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-base font-bold text-slate-900">
                Authorize Refund
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                #{orderCode}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6 flex-1 max-h-[80vh] overflow-y-auto no-scrollbar">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 flex items-start gap-4 bg-emerald-50/50 rounded-lg"
          >
            <Wallet className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Refund Settlement</p>
              <p className="text-xs text-emerald-600/80 font-medium leading-relaxed">
                Full deposit return of <span className="font-bold text-emerald-700">{formatPrice(depositAmount)}</span> will be processed.
              </p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reason <span className="text-rose-500">*</span></Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <Textarea
                    placeholder="Provide a detailed reason for this refund..."
                    className="min-h-[100px] rounded-lg border-none bg-slate-50 focus:bg-white focus:border-emerald-200 transition-all text-sm font-medium p-4 resize-none"
                    {...field}
                  />
                )}
              />
              {errors.reason && (
                <p className="text-[10px] font-medium text-rose-500 mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-1">
                   <AlertCircle className="w-3.5 h-3.5" /> {errors.reason.message}
                </p>
              )}
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-6 border-t border-slate-50 flex flex-row items-center justify-end gap-2 shrink-0 bg-white">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 h-10 px-4 hover:bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-widest px-6 h-10 rounded-lg transition-all active:scale-95 disabled:opacity-50 border-none shadow-none"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : "Confirm Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
