import React from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  Clock3,
  Package,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

import { getTradeInStatusMeta, type TradeInBadgeStatus } from "./tradeInWorkflow";

export type TradeInThemeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "outline" | "amber";

export interface TradeInStatusTheme {
  label: string;
  variant: TradeInThemeVariant;
  icon: React.ReactNode;
  color: string;
  step: number;
  description: string;
}

const TRADE_IN_BADGE_THEME_MAP: Record<TradeInBadgeStatus, Pick<TradeInStatusTheme, "variant" | "color">> = {
  pending: {
    variant: "warning",
    color: "#f59e0b",
  },
  processing: {
    variant: "amber",
    color: "#f97316", // Orange 500 (Admin Amber)
  },
  completed: {
    variant: "success",
    color: "#10b981",
  },
  cancelled: {
    variant: "danger",
    color: "#e11d48",
  },
};

const getTradeInStatusIcon = (normalizedStatus: string): React.ReactNode => {
  switch (normalizedStatus) {
    case "NEGOTIATING":
      return <ArrowLeftRight className="h-4 w-4" />;
    case "CONFIRMED":
      return <CheckCircle2 className="h-4 w-4" />;
    case "PROCESSING":
      return <Package className="h-4 w-4" />;
    case "DELIVERED":
      return <PackageCheck className="h-4 w-4" />;
    case "COMPLETED":
      return <ShieldCheck className="h-4 w-4" />;
    case "CANCELLED":
    case "FORCED_CANCELLED":
    case "ADMIN_CANCELLED":
    case "ADMINCANCELLED":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock3 className="h-4 w-4" />;
  }
};

export const resolveTradeInStatusTheme = (status: string | number): TradeInStatusTheme => {
  const meta = getTradeInStatusMeta(String(status));
  const badgeTheme = TRADE_IN_BADGE_THEME_MAP[meta.badgeStatus];

  return {
    label: meta.label,
    variant: badgeTheme.variant,
    icon: getTradeInStatusIcon(meta.normalizedStatus),
    color: badgeTheme.color,
    step: meta.step,
    description: meta.description,
  };
};
