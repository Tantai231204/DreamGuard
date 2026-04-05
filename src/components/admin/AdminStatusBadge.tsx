import { cn } from "@/lib/utils";
import { Check, Clock4, X, Package, Minus, RotateCcw, Truck, MapPin, History, ShieldAlert, FileEdit, PackageX, EyeOff, ShieldCheck, PackageCheck } from "lucide-react";
import React from "react";

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'sky' | 'indigo' | 'amber' | 'rose' | 'emerald';

interface AdminStatusBadgeProps {
  status: string;
  type?: StatusType;
  mode?: 'status' | 'method' | 'payment';
  className?: string;
  dot?: boolean;
}

const STATUS_MAP: Record<string, StatusType> = {
  // Color mappings for specific business states
  '0': 'warning',
  '1': 'sky',
  '2': 'amber',
  '3': 'info',
  '4': 'indigo',
  '5': 'success',
  '6': 'rose',
  '7': 'danger',
  '8': 'indigo',
  '9': 'success',
  '10': 'rose',
  'refundedandrestocked': 'success',
  'refundedanddamaged': 'rose',

  'pending': 'warning',
  'processing': 'amber',
  'confirmed': 'sky',
  'delivering': 'info',
  'shipping': 'info',
  'arrived': 'sky',
  'completed': 'success',
  'cancelled': 'rose',
  'returning': 'indigo',
  'returned': 'danger',
  'success': 'success',
  'delivered': 'indigo',
  'active': 'success',
  'published': 'success',
  'draft': 'sky',
  'inactive': 'neutral',
  'outofstock': 'danger',
  'deleted': 'danger',

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
}> = {
  success: {
    container: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-600",
    iconColor: "text-white",
    textColor: "text-emerald-700",
    icon: Check,
  },
  emerald: {
    container: "bg-emerald-50 border-emerald-200 shadow-sm",
    iconBg: "bg-emerald-600",
    iconColor: "text-white",
    textColor: "text-emerald-800",
    icon: Check,
  },
  warning: {
    container: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
    textColor: "text-amber-700",
    icon: Clock4,
  },
  amber: {
    container: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-500",
    iconColor: "text-white",
    textColor: "text-orange-800",
    icon: Package,
  },
  danger: {
    container: "bg-rose-50 border-rose-100",
    iconBg: "bg-rose-600",
    iconColor: "text-white",
    textColor: "text-rose-700",
    icon: X,
  },
  rose: {
    container: "bg-rose-50 border-rose-200",
    iconBg: "bg-rose-600",
    iconColor: "text-white",
    textColor: "text-rose-800",
    icon: X,
  },
  info: {
    container: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-600",
    iconColor: "text-white",
    textColor: "text-blue-700",
    icon: Truck,
  },
  sky: {
    container: "bg-sky-50 border-sky-200 shadow-sm",
    iconBg: "bg-sky-500",
    iconColor: "text-white",
    textColor: "text-sky-700",
    icon: Package,
  },
  indigo: {
    container: "bg-indigo-50 border-indigo-200 shadow-sm",
    iconBg: "bg-indigo-600",
    iconColor: "text-white",
    textColor: "text-indigo-800",
    icon: ShieldAlert,
  },
  neutral: {
    container: "bg-slate-50 border-slate-100",
    iconBg: "bg-slate-400",
    iconColor: "text-white",
    textColor: "text-slate-600",
    icon: Minus,
  },
};

const ICON_MAP: Record<string, React.ElementType> = {
  'paid': Check,
  'codpaid': Check,
  'completed': ShieldCheck,
  '5': ShieldCheck,
  'refundedandrestocked': History,
  '9': History,
  'cancelled': X,
  'error': X,
  '6': X,
  'refundedanddamaged': ShieldAlert,
  '10': ShieldAlert,
  'returned': RotateCcw,
  '7': RotateCcw,
  'returning': RotateCcw,
  '8': RotateCcw,
  'delivering': Truck,
  '3': Truck,
  'shipping': Truck,
  'arrived': MapPin,
  'pending': Clock4,
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
  'outofstock': PackageX,
  'inactive': EyeOff,
  'archived': Package,
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
  'refundedandrestocked': 'Refunded (Restocked)',
  'refundedanddamaged': 'Refunded (Damaged)',
  'pending_payment': 'Pending Payment',
  'paid': 'Paid',
  'failed': 'Payment Failed',
};

export const AdminStatusBadge = React.forwardRef<HTMLDivElement, AdminStatusBadgeProps>(({
  status,
  type,
  mode,
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
  } else if (mode === 'payment' && status === '0') {
    displayLabel = 'Pending Payment';
    finalType = 'warning';
    Icon = Clock4;
  } else if (mode === 'payment' && status === '1') {
    displayLabel = 'Paid';
    finalType = 'success';
    Icon = Check;
  }

  const config = TYPE_CONFIG[finalType as StatusType] || TYPE_CONFIG.neutral;

  const containerClass = payConfig?.container || config.container;
  const textClass = payConfig?.textColor || config.textColor;
  const iconBgClass = payConfig?.iconBg || config.iconBg;
  const iconColorClass = config.iconColor;

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2.5 pl-1 pr-3.5 py-1 rounded-full border shadow-sm",
        "text-[11px] font-black uppercase tracking-tight transition-all duration-300",
        "cursor-default hover:brightness-95",
        containerClass,
        textClass,
        className
      )}
    >
      {dot && (
        <div className={cn(
          "flex items-center justify-center h-6 w-6 rounded-full shrink-0 shadow-sm overflow-hidden",
          iconBgClass
        )}>
          {payConfig ? (
            <img src={payConfig.icon} alt={status} className="h-full w-full object-contain" />
          ) : (
            Icon && <Icon className={cn("h-3.5 w-3.5", iconColorClass)} strokeWidth={3.5} />
          )}
        </div>
      )}
      <span className="leading-none">{displayLabel || 'Unknown'}</span>
    </div>
  );
});

AdminStatusBadge.displayName = 'AdminStatusBadge';
