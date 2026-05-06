import { memo, type ChangeEvent } from 'react';
import {
  MessageSquarePlus,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Loader2,
  ExternalLink,
  UserRound,
  AlertCircle,
  Archive,
  RefreshCcw,
  ShieldX,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice, cn } from '@/lib/utils';
import { getTradeInStatusMeta } from '@/utils/tradeInWorkflow';

interface WaitingForStaffSectionProps {
  canAccessTradeInChat: boolean;
  isAccepting: boolean;
  canAbortDeal: boolean;
  onAcceptTask: () => void;
  onOpenCancelDialog: () => void;
}

interface NegotiatingSectionProps {
  previewAmountToPay: number;
  formattedNegotiatedPrice: string;
  onNegotiatedPriceChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isConfirming: boolean;
  canAccessTradeInChat: boolean;
  canAbortDeal: boolean;
  onOpenTradeInChat: () => void;
  onOpenCancelDialog: () => void;
  onConfirmDeal: () => void;
  assignedStaffHint: string;
  minTradeInPrice: number;
  maxTradeInPrice: number;
  unitPrice: number;
  salePrice: number;
  negotiationError: string | null;
  isNegotiationValid: boolean;
}

interface ActiveProgressSectionProps {
  status: string;
  canHandleUnhappyCase: boolean;
  onOpenCancelDialog: () => void;
}

interface FinalizedSectionProps {
  status: string;
  canHandleUnhappyCase: boolean;
  hasRefundPayment: boolean;
  onOpenCancelDialog: () => void;
}

export const WaitingForStaffSection = memo(function WaitingForStaffSection({
  canAccessTradeInChat,
  isAccepting,
  canAbortDeal,
  onAcceptTask,
  onOpenCancelDialog,
}: WaitingForStaffSectionProps) {
  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100/50">
          <MessageSquarePlus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Unclaimed Inquiry</h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight opacity-70 mt-0.5">Awaiting staff intervention</p>
        </div>
      </div>

      {canAccessTradeInChat ? (
        <Button
          className="w-full h-10 rounded-lg bg-primary border-0 ring-0 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-white/10 hover:bg-primary/90 transition-all gap-2"
          onClick={onAcceptTask}
          disabled={isAccepting}
        >
          {isAccepting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquarePlus className="w-3.5 h-3.5" />}
          Accept and Open Chat
        </Button>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
          Admin/Manager do not open trade-in chat from this page.
        </div>
      )}

      {canAbortDeal && (
        <Button
          variant="ghost"
          className="h-9 rounded-lg bg-rose-50/50 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all gap-1.5"
          onClick={onOpenCancelDialog}
        >
          <XCircle className="w-3 h-3" />
          Handle Unhappy Case
        </Button>
      )}
    </div>
  );
});

export const NegotiatingSection = memo(function NegotiatingSection({
  previewAmountToPay,
  formattedNegotiatedPrice,
  onNegotiatedPriceChange,
  isConfirming,
  canAccessTradeInChat,
  canAbortDeal,
  onOpenTradeInChat,
  onOpenCancelDialog,
  onConfirmDeal,
  assignedStaffHint,
  minTradeInPrice,
  maxTradeInPrice,
  unitPrice,
  salePrice,
  negotiationError,
  isNegotiationValid,
}: NegotiatingSectionProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3 flex items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Live Settlement Preview</span>
          <span className="text-sm sm:text-base font-black text-primary tracking-tight break-all">{formatPrice(previewAmountToPay)}</span>
        </div>
        <TrendingDown className="w-4 h-4 text-primary opacity-30" />
      </div>

      <div className="space-y-2 pt-2">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">
          Final Valuation Decision
        </label>
        <div className="relative group">
          <Input
            type="text"
            value={formattedNegotiatedPrice}
            onChange={onNegotiatedPriceChange}
            inputMode="numeric"
            className={cn(
              "h-12 pl-16 pr-4 rounded-xl border-2 bg-white font-black text-sm text-primary focus:ring-0 focus:border-primary/30 transition-all shadow-inner shadow-slate-50 placeholder:text-slate-300",
              negotiationError ? "border-rose-200" : "border-slate-100"
            )}
            placeholder="e.g. 5000000"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-black text-[10px] tracking-wide">VND</span>
        </div>

        <div className="flex flex-col gap-1.5 px-1 mt-2">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
            <span className="text-slate-400">Min. Threshold</span>
            <span className="text-slate-600">{formatPrice(minTradeInPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
            <span className="text-slate-400">Max. Limit (Unit - Deposit)</span>
            <span className="text-slate-600">{formatPrice(maxTradeInPrice)}</span>
          </div>
          
          {negotiationError && (
            <div className="mt-2 p-2 rounded bg-rose-50 border border-rose-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
              <XCircle className="w-3 h-3 text-rose-500 mt-0.5 shrink-0" />
              <p className="text-[9px] font-bold text-rose-600 leading-normal uppercase">
                {negotiationError}
              </p>
            </div>
          )}

          {unitPrice > salePrice && (
            <div className="p-2 rounded bg-amber-50 border border-amber-100 flex items-start gap-2">
              <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[9px] font-bold text-amber-600 leading-normal uppercase">
                Unit Price ({formatPrice(unitPrice)}) &gt; Sale Price ({formatPrice(salePrice)}). 
                Settlement will be forced to 0.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Button
          className="w-full h-10 rounded-lg bg-emerald-600 border-0 ring-0 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-white/10 hover:bg-emerald-700 transition-all gap-2 disabled:opacity-50 disabled:grayscale"
          onClick={onConfirmDeal}
          disabled={isConfirming || !isNegotiationValid}
        >
          {isConfirming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Confirm Deal
        </Button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {canAccessTradeInChat ? (
            <Button
              variant="ghost"
              className="h-9 rounded-lg bg-blue-50/50 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-blue-50 transition-all gap-1.5"
              onClick={onOpenTradeInChat}
            >
              <ExternalLink className="w-3 h-3" />
              Chat
            </Button>
          ) : (
            <div className="h-9 rounded-lg bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 flex items-center justify-center px-2 gap-1.5">
              <UserRound className="w-3 h-3" />
              {assignedStaffHint}
            </div>
          )}

          {canAbortDeal ? (
            <Button
              variant="ghost"
              className="h-9 rounded-lg bg-rose-50/50 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all gap-1.5"
              onClick={onOpenCancelDialog}
            >
              <XCircle className="w-3 h-3" />
              Abort
            </Button>
          ) : (
            <div className="h-9 rounded-lg bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 flex items-center justify-center px-2">
              Managed by Admin/Manager
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const ActiveProgressSection = memo(function ActiveProgressSection({
  status,
  canHandleUnhappyCase,
  onOpenCancelDialog,
}: ActiveProgressSectionProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Shipping Monitoring</h4>
          <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tight opacity-70">Delivery flow is handled on mobile</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
        Status updates like delivering/arrived are updated by Delivery Staff app. Actions like completing or returning are also handled on mobile.
      </div>

      {canHandleUnhappyCase && status !== 'RETURNING' && (
        <Button
          variant="ghost"
          className="w-full h-8 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50/30 transition-all"
          onClick={onOpenCancelDialog}
        >
          Handle Unhappy Case
        </Button>
      )}
    </div>
  );
});

export const FinalizedSection = memo(function FinalizedSection({ 
  status, 
  canHandleUnhappyCase, 
  hasRefundPayment,
  onOpenCancelDialog 
}: FinalizedSectionProps) {
  const meta = getTradeInStatusMeta(status);
  const isCancelled = status === 'CANCELLED' || status === 'FORCED_CANCELLED' || status === 'ADMIN_CANCELLED';
  const isDamaged = status === 'REFUNDED_AND_DAMAGED';
  const isRestocked = status === 'REFUNDED_AND_RESTOCKED';
  const isCompleted = status === 'COMPLETED';

  return (
    <div className="flex flex-col bg-slate-50/30">
      <div className="p-4 flex items-center gap-3">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center border',
          isCancelled ? 'bg-rose-50 border-rose-100 text-rose-500' :
          isDamaged ? 'bg-amber-50 border-amber-100 text-amber-500' :
          isRestocked ? 'bg-blue-50 border-blue-100 text-blue-500' :
          'bg-emerald-50 border-emerald-100 text-emerald-500',
        )}>
          {isCancelled ? <XCircle className="w-4 h-4" /> :
           isDamaged ? <ShieldX className="w-4 h-4" /> :
           isRestocked ? <RefreshCcw className="w-4 h-4" /> :
           isCompleted ? <CheckCircle2 className="w-4 h-4" /> :
           <Archive className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">
            {isCancelled ? 'Termination Archive' : 'Fulfillment Archive'}
          </h4>
          <p className={cn(
            'text-[9px] font-black uppercase tracking-tight mt-1 truncate',
            isCancelled ? 'text-rose-400' :
            isDamaged ? 'text-amber-500' :
            isRestocked ? 'text-blue-500' :
            'text-emerald-500',
          )}>
            {meta.label}
          </p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-[9px] font-bold text-slate-400 leading-relaxed italic">
          {meta.description}
        </p>
      </div>

      {canHandleUnhappyCase && !hasRefundPayment && isCompleted && (
        <div className="px-4 pb-4">
          <Button
            variant="ghost"
            className="w-full h-8 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50/30 transition-all border border-slate-200/50"
            onClick={onOpenCancelDialog}
          >
            Authorize Post-Final Refund
          </Button>
        </div>
      )}
    </div>
  );
});
