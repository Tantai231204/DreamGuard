import { cn } from "@/lib/utils";
import { Check, Clock4, X, Package, Minus, RotateCcw, Truck, MapPin, History, ShieldAlert, FileEdit, PackageX, EyeOff, ShieldCheck, PackageCheck, CheckCircle2, MinusCircle, CreditCard, Sparkles, RefreshCcw, ArrowLeftRight } from "lucide-react";
import React from "react";

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'sky' | 'primary' | 'amber' | 'rose' | 'emerald';

interface AdminStatusBadgeProps {
  status: string;
  type?: StatusType;
  mode?: 'status' | 'method' | 'payment';
  variant?: 'default' | 'dot' | 'minimal';
  className?: string;
  dot?: boolean;
}

const STATUS_MAP: Record<string, StatusType> = {
  // Color mappings for specific business states
  '0': 'warning',
  '1': 'sky',
  '2': 'amber',
  '3': 'info',
  '4': 'primary',
  '5': 'success',
  '6': 'rose',
  '7': 'danger',
  '8': 'primary',
  '9': 'success',
  '10': 'rose',
  '11': 'info',
  '12': 'info',
  'cod': 'warning',
  'codpaid': 'success',
  'codunpaid': 'neutral',
  'forcedcancelled': 'rose',
  'forcenancelled': 'rose',
  'refunded_and_restocked': 'success',
  'refundedandrestocked': 'success',
  'refunded_and_damaged': 'rose',
  'refundedanddamaged': 'rose',

  'pending': 'warning',
  'waiting_for_staff': 'warning',
  'waitingforstaff': 'warning',
  'negotiating': 'primary',
  'processing': 'amber',
  'confirmed': 'sky',
  'delivering': 'info',
  'shipping': 'info',
  'arrived': 'sky',
  'completed': 'success',
  'cancelled': 'rose',
  'returning': 'primary',
  'exchangerequested': 'info',
  'shipping_replacement': 'info',
  'shippingreplacement': 'info',
  'returned': 'danger',
  'success': 'success',
  'delivered': 'primary',
  'active': 'success',
  'published': 'success',
  'draft': 'amber', // Screenshot has orange for Draft
  'inactive': 'neutral',
  'outofstock': 'danger',
  'deleted': 'danger',
  'hidden': 'info', // Screenshot has blue for Hidden (Sky/Info)
  'refund': 'rose',
  'service': 'primary',
  'order': 'info',
  'purchase': 'emerald',
  'deposit': 'emerald',
  'tradein': 'emerald',

  // Neutral for fallback
  'archived': 'neutral',
  'none': 'neutral',
  'null': 'neutral',
  'undefined': 'neutral',
  'neutral': 'neutral',
};

const TYPE_CONFIG: Record<StatusType, {
  container: string;
  iconBg: string;
  iconColor: string;
  icon: React.ElementType;
  textColor: string;
  dotColor: string;
}> = {
  success: {
    container: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-600",
    iconColor: "text-white",
    textColor: "text-emerald-700",
    dotColor: "bg-emerald-500",
    icon: Check,
  },
  emerald: {
    container: "bg-emerald-50 border-emerald-200 shadow-sm",
    iconBg: "bg-emerald-600",
    iconColor: "text-white",
    textColor: "text-emerald-800",
    dotColor: "bg-emerald-600",
    icon: Check,
  },
  warning: {
    container: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
    textColor: "text-amber-700",
    dotColor: "bg-amber-500",
    icon: Clock4,
  },
  amber: {
    container: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-500",
    iconColor: "text-white",
    textColor: "text-orange-800",
    dotColor: "bg-orange-500",
    icon: Package,
  },
  danger: {
    container: "bg-rose-50 border-rose-100",
    iconBg: "bg-rose-600",
    iconColor: "text-white",
    textColor: "text-rose-700",
    dotColor: "bg-rose-500",
    icon: X,
  },
  rose: {
    container: "bg-rose-50 border-rose-200",
    iconBg: "bg-rose-600",
    iconColor: "text-white",
    textColor: "text-rose-800",
    dotColor: "bg-rose-600",
    icon: X,
  },
  info: {
    container: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-600",
    iconColor: "text-white",
    textColor: "text-blue-700",
    dotColor: "bg-blue-500",
    icon: Truck,
  },
  sky: {
    container: "bg-sky-50 border-sky-200 shadow-sm",
    iconBg: "bg-sky-500",
    iconColor: "text-white",
    textColor: "text-sky-700",
    dotColor: "bg-sky-500",
    icon: Package,
  },
  primary: {
    container: "bg-primary-50 border-primary-200 shadow-sm",
    iconBg: "bg-primary-600",
    iconColor: "text-white",
    textColor: "text-primary-800",
    dotColor: "bg-primary-600",
    icon: ShieldAlert,
  },
  neutral: {
    container: "bg-slate-50 border-slate-100",
    iconBg: "bg-slate-400",
    iconColor: "text-white",
    textColor: "text-slate-600",
    dotColor: "bg-slate-400",
    icon: Minus,
  },
};

const ICON_MAP: Record<string, React.ElementType> = {
  'paid': Check,
  'codpaid': Check,
  'completed': ShieldCheck,
  '5': ShieldCheck,
  'refunded_and_restocked': History,
  'refundedandrestocked': History,
  '9': History,
  'cancelled': X,
  'error': X,
  '6': X,
  'refunded_and_damaged': ShieldAlert,
  'refundedanddamaged': ShieldAlert,
  '10': ShieldAlert,
  'negotiating': ArrowLeftRight,
  'exchangerequested': RotateCcw,
  '11': RotateCcw,
  'shipping_replacement': Truck,
  'shippingreplacement': Truck,
  '12': Truck,
  'returned': RotateCcw,
  '7': RotateCcw,
  'returning': RotateCcw,
  '8': RotateCcw,
  'delivering': Truck,
  '3': Truck,
  'shipping': Truck,
  'arrived': MapPin,
  'pending': Clock4,
  'waiting_for_staff': Clock4,
  'waitingforstaff': Clock4,
  '0': Clock4,
  'draft': FileEdit,
  'processing': Package,
  '2': Package,
  'confirmed': Package,
  '1': Package,
  'published': Check,
  'active': Check,
  'delivered': PackageCheck,
  '4': PackageCheck,
  'codunpaid': MinusCircle,
  'outofstock': PackageX,
  'inactive': EyeOff,
  'hidden': EyeOff,
  'archived': Package,
  'purchase': CreditCard,
  'deposit': CreditCard,
  'refund': RotateCcw,
  'service': Sparkles,
  'order': Package,
  'tradein': RefreshCcw,
};

const PAYMENT_CONFIG: Record<string, { container: string, textColor: string, iconBg: string, icon: string }> = {
  vnpay: {
    container: "bg-blue-50 border-blue-100 shadow-sm",
    textColor: "text-blue-700",
    iconBg: "bg-white p-1 ring-1 ring-blue-200",
    icon: "/images/vnpay.svg"
  },
  cod: {
    container: "bg-blue-50 border-blue-100 shadow-sm",
    textColor: "text-blue-700",
    iconBg: "bg-white p-1.5 ring-1 ring-blue-200",
    icon: "/images/cod.svg"
  },
};

const PAYMENT_STATUS_MAP: Record<string, { type: StatusType, label: string, icon: React.ElementType }> = {
  'pending_payment': { type: 'warning', label: 'Pending Payment', icon: Clock4 },
  'paid': { type: 'success', label: 'Paid', icon: Check },
  'failed': { type: 'danger', label: 'Payment Failed', icon: X },
};

const LABEL_MAP: Record<string, string> = {
  '0': 'Pending',
  '1': 'Confirmed',
  '2': 'Processing',
  '3': 'Delivering',
  '4': 'Delivered',
  '5': 'Completed',
  '6': 'Cancelled',
  '7': 'Returned',
  '8': 'Returning',
  '9': 'Refunded (Restocked)',
  '10': 'Refunded (Damaged)',
  '11': 'Exchange Requested',
  '12': 'Shipping Replacement',
  'cod': 'COD',
  'codpaid': 'COD Paid',
  'codunpaid': 'COD Unpaid',
  'forcedcancelled': 'Forced Cancelled',
  'forcenancelled': 'Forced Cancelled',
  'vnpay': 'VNPay',
  'negotiating': 'Negotiating',
  'refunded_and_restocked': 'Refunded (Restocked)',
  'refundedandrestocked': 'Refunded (Restocked)',
  'refunded_and_damaged': 'Refunded (Damaged)',
  'refundedanddamaged': 'Refunded (Damaged)',
  'exchangerequested': 'Exchange Requested',
  'shipping_replacement': 'Shipping Replacement',
  'shippingreplacement': 'Shipping Replacement',
  'pending_payment': 'Pending Payment',
  'waiting_for_staff': 'Waiting For Staff',
  'waitingforstaff': 'Waiting For Staff',
  'paid': 'Paid',
  'failed': 'Payment Failed',
  'published': 'Published',
  'draft': 'Draft',
  'outofstock': 'OutOfStock',
  'hidden': 'Hidden',
  'purchase': 'Purchase',
  'deposit': 'Deposit',
  'refund': 'Refund',
  'service': 'Service',
  'order': 'Product Order',
  'tradein': 'Trade-In Order',
};

export const AdminStatusBadge = React.forwardRef<HTMLDivElement, AdminStatusBadgeProps>(({
  status,
  type,
  mode,
  variant = 'default',
  className,
  dot = true,
}, ref) => {
  const searchStr = String(status || 'neutral').toLowerCase().trim();
  const normalizedStatus = searchStr.replace(/\s+/g, '');

  let finalType: StatusType = type || 'neutral';

  const fromMap = STATUS_MAP[normalizedStatus] || STATUS_MAP[searchStr];
  if (fromMap) {
    finalType = fromMap;
  } else {
    // Basic force keywords
    if (searchStr.includes('success') || searchStr.includes('active')) finalType = 'success';
    else if (searchStr.includes('cancel') || searchStr.includes('fail') || searchStr.includes('error')) finalType = 'rose';
    else if (searchStr.includes('pending')) finalType = 'warning';
  }

  // Icons and Labels
  let Icon = ICON_MAP[normalizedStatus] || ICON_MAP[searchStr] || TYPE_CONFIG[finalType as StatusType]?.icon || Check;
  let displayLabel = LABEL_MAP[normalizedStatus] || LABEL_MAP[searchStr] || status;

  // Payment overrides
  let payConfig = null;
  const isStrictMethod = normalizedStatus === 'vnpay' || normalizedStatus === 'cod';

  if (mode !== 'status' && mode !== 'payment') {
    payConfig = PAYMENT_CONFIG[normalizedStatus];
    if (!payConfig && (mode === 'method' || isStrictMethod)) {
      if (normalizedStatus.startsWith('vnpay')) payConfig = PAYMENT_CONFIG['vnpay'];
      else if (normalizedStatus.startsWith('cod')) payConfig = PAYMENT_CONFIG['cod'];
    }
  }

  if (mode === 'payment' && PAYMENT_STATUS_MAP[normalizedStatus]) {
    const cfg = PAYMENT_STATUS_MAP[normalizedStatus];
    displayLabel = cfg.label;
    finalType = cfg.type;
    Icon = cfg.icon;
  } else if (mode === 'payment' && (status === '0' || normalizedStatus === 'pending')) {
    displayLabel = 'Pending Payment';
    finalType = 'warning';
    Icon = Clock4;
  } else if (mode === 'payment' && (status === '1' || normalizedStatus === 'paid')) {
    displayLabel = 'Paid';
    finalType = 'success';
    Icon = Check;
  } else if (mode === 'payment' && (status === '3' || normalizedStatus === 'cod')) {
    displayLabel = 'COD Pending';
    finalType = 'warning';
    Icon = Truck;
  } else if (mode === 'payment' && (status === '4' || normalizedStatus === 'codpaid')) {
    displayLabel = 'COD Paid';
    finalType = 'emerald';
    Icon = CheckCircle2;
  } else if (mode === 'payment' && normalizedStatus === 'codunpaid') {
    displayLabel = 'COD Unpaid';
    finalType = 'amber';
    Icon = MinusCircle;
  } else if (normalizedStatus.includes('forced') || normalizedStatus.includes('forcen')) {
    displayLabel = 'Forced Cancelled';
    finalType = 'rose';
    Icon = X;
  }

  const config = TYPE_CONFIG[finalType as StatusType] || TYPE_CONFIG.neutral;

  // ── Variant: Dot ───────────────────────────────────────────
  if (variant === 'dot') {
    return (
      <div ref={ref} className={cn("flex items-center gap-2 px-0.5", className)}>
        <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotColor)} />
        <span className={cn("text-[13px] font-bold leading-none tracking-tight", config.textColor.replace('text-', 'text-'))}>
          {displayLabel}
        </span>
      </div>
    );
  }

  // ── Variant: Default ───────────────────────────────────────
  const containerClass = payConfig?.container || config.container;
  const textClass = payConfig?.textColor || config.textColor;
  const iconBgClass = payConfig?.iconBg || config.iconBg;
  const iconColorClass = config.iconColor;

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 pl-1 pr-3 py-0.5 rounded-full border shadow-sm",
        "text-[10px] font-black uppercase tracking-tight transition-all duration-300",
        "cursor-default hover:brightness-95 select-none",
        containerClass,
        textClass,
        className
      )}
    >
      {dot && (
        <div className={cn(
          "flex items-center justify-center h-6 w-6 rounded-full shrink-0 shadow-sm overflow-hidden border border-white/20",
          iconBgClass
        )}>
          {payConfig ? (
            <img src={payConfig.icon} alt={status} className="h-full w-full object-contain" />
          ) : (
            Icon && <Icon className={cn("h-3.5 w-3.5", iconColorClass)} strokeWidth={3.5} />
          )}
        </div>
      )}
      <span className="leading-none py-1">{displayLabel || 'N/A'}</span>
    </div>
  );
});

AdminStatusBadge.displayName = 'AdminStatusBadge';
