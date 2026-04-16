import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { UserRole } from "@/lib/constants";
import AdminPageHeader from "@/components/layout/AdminPageHeader";
import { useAuthStore } from "@/store/authStore";
import { mockOrders } from "../data";
import { quickActions, statsConfig } from "./data";
import { QuickActions, RecentOrders, StatsGrid, ServiceOrderAnalytics, TradeInAnalytics } from "./components";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const role = useAuthStore((state) => state.role);
  const [isLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'service' | 'tradein'>('service');

  const recentOrders = mockOrders.slice(0, 5);

  const filteredQuickActions = quickActions.filter(action => {
    if (action.to === "/admin/chat" && role !== UserRole.SELLER) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-8 pt-8 pb-2">
        <AdminPageHeader
          title="Dashboard"
          description={
            role === "admin"
              ? "Overview of business operations and analytics."
              : "Your daily performance summary."
          }
          actions={
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</span>
            </div>
          }
        />
      </div>

      {/* Content */}
      <div className="px-8 pb-12 space-y-8">
        {/* KPI Cards */}
        <StatsGrid stats={statsConfig} isLoading={isLoading} />

        {/* Quick Navigation */}
        <QuickActions actions={filteredQuickActions} isLoading={isLoading} />

        {/* Analytics & Activity Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main: Analytics Tabs */}
          <div className="xl:col-span-7 space-y-6">
            <div className="flex items-center gap-6 border-b-2 border-slate-50 mb-8">
              <button
                onClick={() => setActiveTab('service')}
                className={cn(
                  "relative pb-3 text-[11px] font-black uppercase tracking-[0.15em] transition-colors focus:outline-none",
                  activeTab === 'service' ? "text-[#4988c4]" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Service Analytics
                {activeTab === 'service' && (
                  <motion.div layoutId="active-dashboard-tab" className="absolute -bottom-[2px] left-0 right-0 h-0.5 bg-[#4988c4]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('tradein')}
                className={cn(
                  "relative pb-3 text-[11px] font-black uppercase tracking-[0.15em] transition-colors focus:outline-none",
                  activeTab === 'tradein' ? "text-emerald-500" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Trade-In Analytics
                {activeTab === 'tradein' && (
                  <motion.div layoutId="active-dashboard-tab" className="absolute -bottom-[2px] left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'service' ? <ServiceOrderAnalytics /> : <TradeInAnalytics />}
            </motion.div>
          </div>

          {/* Sidebar: Recent Orders */}
          <div className="xl:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Recent Orders</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Latest transactions</p>
                </div>
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-1 text-[10px] font-black text-[#4988c4] hover:underline uppercase tracking-widest"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <RecentOrders orders={recentOrders} isLoading={isLoading} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
