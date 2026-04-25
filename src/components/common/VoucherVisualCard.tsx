import { Calendar, Coins, Flame, Ticket } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

type VoucherVisualState = 'active' | 'used' | 'expired' | 'draft';

interface VoucherVisualCardProps {
  code: string;
  name: string;
  voucherType: string;
  discountValue: number;
  maxDiscountAmount?: number;
  requiredCoin?: number;
  endDate?: string;
  state?: VoucherVisualState;
  statusLabel?: string;
  className?: string;
}

const STATE_THEME: Record<
  VoucherVisualState,
  {
    card: string;
    iconWrap: string;
    icon: string;
    brand: string;
    subBrand: string;
    percent: string;
    percentUnit: string;
    title: string;
    type: string;
    codeWrap: string;
    code: string;
    metaBox: string;
    metaText: string;
    expiryHint: string;
    expiryValue: string;
    statusChip: string;
    aura?: string;
  }
> = {
  active: {
    card: 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white',
    iconWrap: 'bg-white/12 border border-white/20',
    icon: 'text-primary-100',
    brand: 'text-white',
    subBrand: 'text-primary-100/80',
    percent: 'text-white',
    percentUnit: 'text-primary-100/90',
    title: 'text-white/90',
    type: 'text-primary-100/90',
    codeWrap: 'bg-white/8 border border-white/20',
    code: 'text-white',
    metaBox: 'bg-white/10',
    metaText: 'text-primary-100',
    expiryHint: 'text-white/55',
    expiryValue: 'text-primary-100',
    statusChip: 'bg-emerald-400/20 border-emerald-200/30 text-emerald-200',
    aura: 'bg-primary-200/30',
  },
  used: {
    card: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 text-white',
    iconWrap: 'bg-white/10 border border-white/15',
    icon: 'text-slate-200',
    brand: 'text-white',
    subBrand: 'text-slate-200/70',
    percent: 'text-white',
    percentUnit: 'text-slate-200/70',
    title: 'text-white/90',
    type: 'text-slate-200/80',
    codeWrap: 'bg-white/8 border border-white/15',
    code: 'text-white',
    metaBox: 'bg-white/8',
    metaText: 'text-slate-200',
    expiryHint: 'text-white/50',
    expiryValue: 'text-slate-200',
    statusChip: 'bg-slate-300/20 border-slate-200/30 text-slate-100',
    aura: 'bg-white/10',
  },
  expired: {
    card: 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white',
    iconWrap: 'bg-white/12 border border-white/20',
    icon: 'text-rose-100',
    brand: 'text-white',
    subBrand: 'text-rose-100/80',
    percent: 'text-white',
    percentUnit: 'text-rose-100/80',
    title: 'text-white/90',
    type: 'text-rose-100/85',
    codeWrap: 'bg-white/10 border border-white/20',
    code: 'text-white',
    metaBox: 'bg-white/10',
    metaText: 'text-rose-100',
    expiryHint: 'text-white/55',
    expiryValue: 'text-rose-100',
    statusChip: 'bg-rose-200/25 border-rose-100/40 text-rose-50',
    aura: 'bg-white/12',
  },
  draft: {
    card: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white',
    iconWrap: 'bg-white/12 border border-white/20',
    icon: 'text-gray-100',
    brand: 'text-white',
    subBrand: 'text-gray-100/75',
    percent: 'text-white',
    percentUnit: 'text-gray-100/75',
    title: 'text-white/85',
    type: 'text-gray-100/80',
    codeWrap: 'bg-white/10 border border-white/20',
    code: 'text-white',
    metaBox: 'bg-white/10',
    metaText: 'text-gray-100',
    expiryHint: 'text-white/55',
    expiryValue: 'text-gray-100',
    statusChip: 'bg-white/20 border-white/30 text-white',
    aura: 'bg-white/12',
  },
};

export default function VoucherVisualCard({
  code,
  name,
  voucherType,
  discountValue,
  maxDiscountAmount,
  requiredCoin,
  endDate,
  state = 'active',
  statusLabel,
  className,
}: VoucherVisualCardProps) {
  const theme = STATE_THEME[state];
  const HeaderIcon = state === 'active' ? Flame : Ticket;
  const now = new Date();
  const expiryDate = endDate ? new Date(endDate) : null;
  const isValidExpiry = !!expiryDate && !Number.isNaN(expiryDate.getTime());
  const isExpiredDate = !!expiryDate && expiryDate < now;
  const isExpiringToday =
    !!expiryDate &&
    expiryDate.toDateString() === now.toDateString();

  const discountPercent = Math.max(0, discountValue || 0) * 100;
  const discountDisplay = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(discountPercent);

  const expiryColorClass =
    state === 'active' && isExpiredDate
      ? 'text-rose-200'
      : state === 'active' && isExpiringToday
        ? 'text-sky-200'
        : theme.expiryValue;

  return (
    <div
      className={cn(
        'relative w-full aspect-[1.72/1] rounded-[24px] overflow-hidden flex flex-col justify-between p-5 transition-all duration-300 shadow-xl',
        theme.card,
        className
      )}
      style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {theme.aura && (
        <div
          className={cn(
            'absolute top-0 right-0 w-32 h-32 rounded-full blur-[44px] -translate-y-1/2 translate-x-1/2 opacity-70',
            theme.aura
          )}
        />
      )}

      <div className="pointer-events-none absolute inset-y-0 left-[43%] w-[1px] border-l border-dashed border-white/30" />

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              'w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-xl',
              theme.iconWrap
            )}
          >
            <HeaderIcon className={cn('h-4.5 w-4.5', theme.icon)} />
          </div>
          <div className="flex flex-col">
            <span className={cn('text-[10px] font-black uppercase tracking-[0.18em] leading-tight', theme.brand)}>
              DreamGuard
            </span>
            <span className={cn('text-[8px] font-bold uppercase tracking-[0.16em] mt-0.5', theme.subBrand)}>
              {voucherType === 'Both' ? 'Exclusive' : voucherType} Voucher
            </span>
          </div>
        </div>

        <div
          className={cn(
            'px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.14em] border backdrop-blur-md',
            isExpiredDate && state === 'active' ? STATE_THEME.expired.statusChip : theme.statusChip
          )}
        >
          {isExpiredDate && state === 'active' ? 'EXPIRED' : (statusLabel || state.toUpperCase())}
        </div>
      </div>

      <div className="relative z-10 text-center -mt-1.5">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className={cn('text-[3.1rem] leading-none font-black tracking-tighter tabular-nums', theme.percent)}>
            {discountDisplay}
          </span>
          <span className={cn('text-xl font-bold italic leading-none', theme.percentUnit)}>%</span>
          <span className={cn('text-[9px] font-black uppercase tracking-[0.15em] leading-none', theme.percentUnit)}>OFF</span>
        </div>

        <h3 className={cn('text-[9px] font-black uppercase tracking-[0.24em] mt-1.5 line-clamp-1', theme.title)}>
          {name || 'NEW VOUCHER'}
        </h3>

        <p className={cn('text-[8px] font-bold uppercase tracking-[0.2em] mt-1', theme.type)}>
          {voucherType || 'BOTH'}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-4 mt-auto">
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'flex items-center justify-center px-3.5 py-2.5 rounded-2xl border transition-all',
              theme.codeWrap
            )}
          >
            <code className={cn('text-[11px] font-black font-mono tracking-[0.17em] uppercase', theme.code)}>
              {code || 'CODE24'}
            </code>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1.5">
            <div className={cn('px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider text-center', theme.metaBox, theme.metaText)}>
              Cap: {typeof maxDiscountAmount === 'number' ? formatPrice(maxDiscountAmount) : '--'}
            </div>
            <div className={cn('px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1', theme.metaBox, theme.metaText)}>
              <Coins className="h-2.5 w-2.5" />
              <span>{typeof requiredCoin === 'number' && requiredCoin > 0 ? requiredCoin.toLocaleString('vi-VN') : '--'}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className={cn('flex items-center justify-end gap-1 text-[7px] font-black tracking-widest leading-none mb-1.5', theme.expiryHint)}>
            <Calendar className="h-2 w-2" />
            <span>EXPIRY</span>
          </div>
          <div className={cn('text-[9px] font-black tracking-[0.08em] leading-none tabular-nums uppercase', expiryColorClass)}>
            {isValidExpiry && expiryDate ? (
              `${String(expiryDate.getUTCDate()).padStart(2, '0')}/${String(expiryDate.getUTCMonth() + 1).padStart(2, '0')}/${expiryDate.getUTCFullYear()}`
            ) : 'N/A'}
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-white/95 shadow-inner z-20" />
      <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-white/95 shadow-inner z-20" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.11]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)', backgroundSize: '12px 12px' }} />
    </div>
  );
}
