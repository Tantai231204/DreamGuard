import { memo, type ChangeEvent } from 'react';
import {
  MessageSquarePlus,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Loader2,
  ExternalLink,
  UserRound,
  RotateCcw,
  Package,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice, cn } from '@/lib/utils';

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
}

interface ActiveProgressSectionProps {
  status: string;
  isTransitioning: boolean;
  canFinalizeTradeIn: boolean;
  canHandleUnhappyCase: boolean;
  canProcessReturningUnhappy: boolean;
  onFinalizeTradeIn: () => void;
  onProcessReturn: () => void;
  onProcessExchange: () => void;
  onOpenCancelDialog: () => void;
}

interface FinalizedSectionProps {
  status: string;
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
            className="h-12 pl-16 pr-4 rounded-xl border-2 border-slate-100 bg-white font-black text-sm text-primary focus:ring-0 focus:border-primary/30 transition-all shadow-inner shadow-slate-50 placeholder:text-slate-300"
            placeholder="e.g. 5000000"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-black text-[10px] tracking-wide">VND</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Button
          className="w-full h-10 rounded-lg bg-emerald-600 border-0 ring-0 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-white/10 hover:bg-emerald-700 transition-all gap-2"
          onClick={onConfirmDeal}
          disabled={isConfirming}
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
  isTransitioning,
  canFinalizeTradeIn,
  canHandleUnhappyCase,
  canProcessReturningUnhappy,
  onFinalizeTradeIn,
  onProcessReturn,
  onProcessExchange,
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
        Status updates like delivering/arrived are updated by Delivery Staff app.
      </div>

      {canFinalizeTradeIn && status === 'DELIVERED' && (
        <Button
          className="w-full h-10 rounded-lg bg-emerald-700 border-0 ring-0 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-white/10 hover:bg-emerald-800 transition-all gap-2"
          onClick={onFinalizeTradeIn}
          disabled={isTransitioning}
        >
          {isTransitioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Mark Completed
        </Button>
      )}

      {status === 'RETURNING' && canProcessReturningUnhappy && (
        <div className="grid grid-cols-1 gap-2">
          <Button
            className="w-full h-10 rounded-lg bg-primary border-0 ring-0 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-white/10 hover:bg-primary/90 transition-all gap-2"
            onClick={onProcessExchange}
            disabled={isTransitioning}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Process Exchange
          </Button>

          <Button
            className="w-full h-10 rounded-lg bg-rose-600 border-0 ring-0 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-white/10 hover:bg-rose-700 transition-all gap-2"
            onClick={onProcessReturn}
            disabled={isTransitioning}
          >
            <Package className="w-3.5 h-3.5" />
            Process Return
          </Button>
        </div>
      )}

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

export const FinalizedSection = memo(function FinalizedSection({ status }: FinalizedSectionProps) {
  return (
    <div className="p-4 flex items-center gap-3 bg-slate-50/30">
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center border',
        status === 'CANCELLED' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500',
      )}>
        {status === 'CANCELLED' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      </div>
      <div>
        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Archived</h4>
        <p className={cn(
          'text-[9px] font-black uppercase tracking-tight mt-1',
          status === 'CANCELLED' ? 'text-rose-400' : 'text-emerald-500',
        )}>
          Status: {status}
        </p>
      </div>
    </div>
  );
});
