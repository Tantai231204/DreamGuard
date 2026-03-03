import type { LucideIcon } from "lucide-react";

export interface DashboardStat {
  label: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  color: string;
  lightBg: string;
  textColor: string;
  borderColor: string;
  gradientBg: string;
}

export interface QuickAction {
  to: string;
  icon: LucideIcon;
  iconBg: string;
  hoverBorder: string;
  title: string;
  description: string;
  badge?: number;
  disabled?: boolean;
}

export interface HeaderStat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}
