import {
  DollarSign,
  MessageSquare,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import type { DashboardStat, QuickAction } from "./types";

export const statsConfig: DashboardStat[] = [
  {
    label: "Total Revenue",
    value: "₫89,450,000",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    lightBg: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-l-green-500",
    gradientBg: "from-white to-green-50",
  },
  {
    label: "Total Orders",
    value: "567",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    color: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-l-blue-500",
    gradientBg: "from-white to-blue-50",
  },
  {
    label: "Total Users",
    value: "1,234",
    change: "+5.4%",
    trend: "up",
    icon: Users,
    color: "from-purple-500 to-purple-600",
    lightBg: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-l-purple-500",
    gradientBg: "from-white to-purple-50",
  },
  {
    label: "Products",
    value: "89",
    change: "+2.1%",
    trend: "up",
    icon: Package,
    color: "from-orange-500 to-orange-600",
    lightBg: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-l-orange-500",
    gradientBg: "from-white to-orange-50",
  },
];

export const quickActions: QuickAction[] = [
  {
    to: "/admin/orders",
    icon: Package,
    iconBg:
      "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-xl",
    hoverBorder: "hover:border-blue-500",
    title: "Order Management",
    description: "View and manage orders",
  },
  {
    to: "/admin/chat",
    icon: MessageSquare,
    iconBg:
      "bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:shadow-xl",
    hoverBorder: "hover:border-green-500",
    title: "Chat Support",
    description: "Customer support",
    badge: 3,
  },
  {
    to: "/admin/products",
    icon: Package,
    iconBg:
      "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg group-hover:shadow-xl",
    hoverBorder: "hover:border-orange-500",
    title: "Products",
    description: "Manage inventory",
  },
  {
    to: "",
    icon: TrendingUp,
    iconBg:
      "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg",
    hoverBorder: "",
    title: "Reports & Analytics",
    description: "Coming soon",
    disabled: true,
  },
];

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};
