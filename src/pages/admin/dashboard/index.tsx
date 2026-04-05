import { useState, useEffect } from "react";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

import AdminPageHeader from "@/components/layout/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { mockOrders } from "../data";
import { quickActions, statsConfig } from "./data";
import { QuickActions, RecentOrders, StatsGrid } from "./components";
import { formatPrice } from "@/lib/utils";

export default function Dashboard() {
  const role = useAuthStore((state) => state.role);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate live stats from mock data
  const orderStats = {
    totalOrders: mockOrders.length,
    revenue: mockOrders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: mockOrders.filter((o) => o.status === "pending").length,
    customers: new Set(mockOrders.map((o) => o.email)).size,
  };

  const recentOrders = mockOrders.slice(0, 5);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-50/50 via-white to-blue-50/50">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <AdminPageHeader
          title="Dashboard"
          description={
            role === "admin"
              ? "Manage your store and orders"
              : "Welcome back! Here's what's happening with your store today."
          }
          actions={
            <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm border-green-200">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                System Online
              </div>
            </Badge>
          }
          stats={[
            {
              label: "Total Orders",
              value: orderStats.totalOrders,
              icon: ShoppingCart,
            },
            {
              label: "Revenue",
              value: formatPrice(orderStats.revenue),
              icon: DollarSign,
            },
            {
              label: "Pending",
              value: orderStats.pendingOrders,
              icon: Package,
            },
            { label: "Customers", value: orderStats.customers, icon: Users },
          ]}
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-6">
        <StatsGrid stats={statsConfig} isLoading={isLoading} />
        <QuickActions actions={quickActions} isLoading={isLoading} />
        <RecentOrders orders={recentOrders} isLoading={isLoading} />
      </div>
    </div>
  );
}
