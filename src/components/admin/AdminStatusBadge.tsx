import { cn } from "@/lib/utils";
import { Check, Clock4, X, Package, Minus } from "lucide-react";
import React from "react";

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface AdminStatusBadgeProps {
  status: string;
  type?: StatusType;
  mode?: 'status' | 'method' | 'payment'; // Explicitly set mode to avoid ambiguity
  className?: string;
  dot?: boolean;
}

const STATUS_MAP: Record<string, StatusType> = {
  // Green for successful payments and completions (Xanh lá: Payment success & Final states)
  'paid': 'success',
  'codpaid': 'success',
  'active': 'success',
  'delivered': 'success',
  'completed': 'success',
  'resolved': 'success',
  '6': 'success', // OrderStatus.Completed
  '5': 'success', // OrderStatus.Delivered

  // Blue for successful confirmations (Xanh dương: Intermediate success)
  'confirmed': 'info',
  '2': 'info', // OrderStatus.Confirmed

  // Red for failures and rejections (Danger)
  'cancelled': 'danger',
  'forcedcancelled': 'danger',
  'failed': 'danger',
  'rejected': 'danger',
  'outofstock': 'danger',
  '7': 'danger', // OrderStatus.Cancelled

  // Orange/Amber for general statuses (Cam: tên bảng kèm status)
  'pending': 'warning',
  '1': 'warning', // OrderStatus.Pending
  'draft': 'warning',
  'trial': 'warning',
  'processing': 'warning',
  '3': 'warning', // OrderStatus.Processing
  'shipping': 'warning',
  '4': 'warning', // OrderStatus.Shipping
  'refund': 'warning',
  'refunded': 'warning',

  // Potential status strings that look like methods
  'cod': 'warning',
  'vnpay': 'warning',

  // Neutral
  'hidden': 'neutral',
  'archived': 'neutral',
  'undefined': 'neutral',
  'null': 'neutral',
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
  warning: {
    container: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
    textColor: "text-amber-700",
    icon: Clock4,
  },
  danger: {
    container: "bg-rose-50 border-rose-100",
    iconBg: "bg-rose-600",
    iconColor: "text-white",
    textColor: "text-rose-700",
    icon: X,
  },
  info: {
    container: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-600",
    iconColor: "text-white",
    textColor: "text-blue-700",
    icon: Package,
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
  'completed': Check,
  'active': Check,
  'confirmed': Check,
  'published': Check,
  'delivered': Check,
  '2': Check,
  '5': Check,
  '6': Check,
  'cancelled': X,
  'failed': X,
  'rejected': X,
  'void': X,
  'inactive': X,
  'expired': X,
  'banned': X,
  '7': X,
  'refunded': RotateCcw,
  'refund': RotateCcw,
  'processing': Package,
  'shipped': Package,
  'shipping': Package,
  '3': Package,
  '4': Package,
  'pending': Clock4,
  'unpaid': Clock4,
  'codunpaid': Clock4,
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
  '0': { type: 'warning', label: 'Pending Payment', icon: Clock4 },
  '1': { type: 'success', label: 'Paid', icon: Check },
  '2': { type: 'danger', label: 'Payment Failed', icon: X },
  '3': { type: 'neutral', label: 'COD (Collect on Delivery)', icon: Clock4 },
  '4': { type: 'success', label: 'COD Paid', icon: Check },
  'cod': { type: 'neutral', label: 'COD Unpaid', icon: Clock4 },
};

import { RotateCcw } from "lucide-react";

export function AdminStatusBadge({
  status,
  type,
  mode,
  className,
  dot = true,
}: AdminStatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '') || 'neutral';

  // Payment config is only used if mode is 'method' or not specified but matches perfectly
  // and is NOT a known status keyword.
  let payConfig = null;
  const isStrictMethod = normalizedStatus === 'vnpay' || normalizedStatus === 'cod';

  if (mode !== 'status' && mode !== 'payment') {
    payConfig = PAYMENT_CONFIG[normalizedStatus];
    if (!payConfig && (mode === 'method' || isStrictMethod)) {
      if (normalizedStatus.startsWith('vnpay')) payConfig = PAYMENT_CONFIG['vnpay'];
      else if (normalizedStatus.startsWith('cod')) payConfig = PAYMENT_CONFIG['cod'];
    }
  }

  let finalType = type || STATUS_MAP[normalizedStatus] || 'neutral';
  let Icon = ICON_MAP[normalizedStatus] || TYPE_CONFIG[finalType as StatusType]?.icon;
  let displayLabel = status;

  if (mode === 'payment' && PAYMENT_STATUS_MAP[normalizedStatus]) {
    const cfg = PAYMENT_STATUS_MAP[normalizedStatus];
    displayLabel = cfg.label;
    finalType = cfg.type;
    Icon = cfg.icon;
  }

  const config = TYPE_CONFIG[finalType as StatusType];

  const containerClass = payConfig?.container || config.container;
  const textClass = payConfig?.textColor || config.textColor;
  const iconBgClass = payConfig?.iconBg || config.iconBg;
  const iconColorClass = config.iconColor;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 pl-1 pr-3.5 py-1 rounded-full border shadow-sm",
        "text-[11px] font-black uppercase tracking-tight transition-all duration-300",
        "cursor-default hover:brightness-95 hover:shadow-md",
        containerClass,
        textClass,
        className
      )}
    >
      {dot && (
        <div className={cn(
          "flex items-center justify-center h-6 w-6 rounded-full shrink-0 shadow-sm overflow-hidden transition-transform group-hover:scale-110",
          iconBgClass
        )}>
          {payConfig ? (
            <img src={payConfig.icon} alt={status} className="h-full w-full object-contain" />
          ) : (
            <Icon className={cn("h-3.5 w-3.5", iconColorClass)} strokeWidth={3.5} />
          )}
        </div>
      )}
      <span className="leading-none">{displayLabel || 'Unknown'}</span>
    </div>
  );
}
