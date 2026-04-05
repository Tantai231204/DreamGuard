import { Ticket, Calendar } from 'lucide-react';
import type { Voucher } from '../types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VoucherCardProps {
  voucher: Voucher;
}

export default function VoucherCard({ voucher }: VoucherCardProps) {
  const isPercent = voucher.discountType === 'percent';
  const expiryDate = new Date(voucher.endDate);
  const now = new Date();

  const isExpired = expiryDate < now;
  const isExpiringToday = expiryDate.toDateString() === now.toDateString();
  const isActive = voucher.isActive;

  return (
    <div
      className={cn(
        "relative w-full aspect-[1.6/1] rounded-[24px] overflow-hidden flex flex-col justify-between p-7 transition-all duration-500 shadow-premium",
        isActive
          ? "bg-gradient-to-br from-[#2563eb] via-[#1e40af] to-[#1e3a8a] text-white"
          : "bg-gray-50 text-gray-400 border border-gray-100"
      )}
      style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      {/* Background Aura */}
      {isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 opacity-60" />
      )}

      {/* Header Area */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-3.5">
          <div className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-lg",
            isActive ? "bg-white/10 border border-white/20" : "bg-gray-200"
          )}>
            <Ticket className={cn("h-5.5 w-5.5", isActive ? "text-sky-300" : "text-gray-400")} />
          </div>
          <div className="flex flex-col">
            <span className={cn("text-[11px] font-black uppercase tracking-[0.2em] leading-tight", isActive ? "text-white" : "text-gray-400")}>
              DreamGuard
            </span>
            <span className={cn("text-[9px] font-bold uppercase tracking-widest opacity-40 mt-0.5", isActive ? "text-sky-100" : "text-gray-400")}>
              Premium Tier
            </span>
          </div>
        </div>

        <div className={cn(
          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border backdrop-blur-md",
          isActive ? "bg-emerald-400/20 border-emerald-400/20 text-emerald-300" : "bg-gray-200 border-gray-300 text-gray-400"
        )}>
          {isActive ? 'ACTIVE' : 'DRAFT'}
        </div>
      </div>

      {/* Center Discount Display */}
      <div className="relative z-10 text-center -mt-1">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className={cn(
            "text-6xl font-black tracking-tighter tabular-nums drop-shadow-2xl",
            isActive ? "text-white" : "text-gray-300"
          )}>
            {voucher.discountValue || 0}
          </span>
          <span className={cn("text-2xl font-bold opacity-60 italic", isActive ? "text-sky-200" : "text-gray-300")}>
            {isPercent ? '%' : '$'}
          </span>
        </div>
        <h3 className={cn(
          "text-[10px] font-black uppercase tracking-[0.35em] mt-2 drop-shadow-sm",
          isActive ? "text-white/80" : "text-gray-400"
        )}>
          {voucher.name || 'NEW PROMOTION'}
        </h3>
      </div>

      {/* Footer Credentials */}
      <div className="relative z-10 flex items-center justify-between gap-5 mt-auto">
        <div className="flex-1">
          <div className={cn(
            "flex items-center justify-center px-4 py-3 rounded-2xl border transition-all shadow-inner",
            isActive ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"
          )}>
            <code className={cn("text-xs font-black font-mono tracking-[0.25em] uppercase", isActive ? "text-white" : "text-gray-500")}>
              {voucher.code || 'CODE24'}
            </code>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1.5 text-[8px] font-black opacity-30 mb-1.5 tracking-widest leading-none">
            <Calendar className="h-2.5 w-2.5" />
            <span>EXPIRY</span>
          </div>
          <div className={cn(
            "text-[10px] font-black tracking-widest leading-none tabular-nums",
            isExpired && isActive ? "text-rose-400" : (isExpiringToday && isActive ? "text-amber-300" : (isActive ? "text-sky-100" : "text-gray-400"))
          )}>
            {formatDate(voucher.endDate).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Aesthetic Cutouts */}
      <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-inner border border-transparent z-20" />
      <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-inner border border-transparent z-20" />
    </div>
  );
}
