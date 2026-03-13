import { cn } from "@/lib/utils";
import { Check, Clock4, X, Package, Minus } from "lucide-react";
import React from "react";

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface AdminStatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
  dot?: boolean;
}

const STATUS_MAP: Record<string, StatusType> = {
  // Success
  'published': 'success',
  'active': 'success',
  'delivered': 'success',
  'completed': 'success',
  'paid': 'success',
  'confirmed': 'success',
  'resolved': 'success',
  '6': 'success', // OrderStatus.Completed
  '2': 'success', // OrderStatus.Confirmed
  '5': 'success', // OrderStatus.Delivered

  // Warning
  'draft': 'warning',
  'pending': 'warning',
  'trial': 'warning',
  '1': 'warning', // OrderStatus.Pending

  // Danger
  'outofstock': 'danger',
  'inactive': 'danger',
  'cancelled': 'danger',
  'failed': 'danger',
  'expired': 'danger',
  'deleted': 'danger',
  'banned': 'danger',
  '7': 'danger', // OrderStatus.Cancelled

  // Info
  'shipped': 'info',
  'partial': 'info',
  'processing': 'info',
  'shipping': 'info',
  '3': 'info', // OrderStatus.Processing
  '4': 'info', // OrderStatus.Shipping

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

const PAYMENT_CONFIG: Record<string, { container: string, textColor: string, iconBg: string, icon: string }> = {
  vnpay: {
    container: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100/50 shadow-inner shadow-blue-500/5",
    textColor: "text-[#005baa]",
    iconBg: "bg-white p-1 ring-2 ring-blue-500/10 shadow-sm",
    icon: "/images/vnpay.svg"
  },
  cod: {
    container: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100/50 shadow-inner shadow-orange-500/5",
    textColor: "text-[#854d0e]",
    iconBg: "bg-white p-1.5 ring-2 ring-amber-500/10 shadow-sm",
    icon: "/images/cod.svg"
  },
};

export function AdminStatusBadge({
  status,
  type,
  className,
  dot = true,
}: AdminStatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '') || 'neutral';
  const payConfig = PAYMENT_CONFIG[normalizedStatus];
  const finalType = type || STATUS_MAP[normalizedStatus] || 'neutral';
  const config = TYPE_CONFIG[finalType];
  const Icon = config.icon;

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
      <span className="leading-none">{status || 'Unknown'}</span>
    </div>
  );
}
