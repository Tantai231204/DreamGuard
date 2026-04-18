import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { UserRole } from "@/lib/constants";
import AdminPageHeader from "@/components/layout/AdminPageHeader";
import { useAuthStore } from "@/store/authStore";
import { mockOrders } from "../data";
import { quickActions, statsConfig } from "./data";
import { QuickActions, RecentOrders, StatsGrid, ServiceOrderAnalytics, TradeInAnalytics, OrderAnalytics, BestSellingProducts } from "./components";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const role = useAuthStore((state) => state.role);
  const [isLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'service' | 'tradein' | 'order'>('order');

  const tabOrder = ['order', 'service', 'tradein'] as const;
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
              </div>
            </div>
          }
        />
      </div>

      <div className="px-8 pb-12 space-y-8">
        <StatsGrid stats={statsConfig} isLoading={isLoading} />
        <QuickActions actions={filteredQuickActions} isLoading={isLoading} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-12 space-y-6">
            <div className="flex items-center gap-8 border-b border-slate-100 mb-10">
              {tabOrder.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all focus:outline-none",
                    activeTab === tab ? "text-[#4988c4]" : "text-slate-400 hover:text-slate-500"
                  )}
                >
                  <span className="relative z-10">{tab} Analytics</span>
                  {activeTab === tab && (
                    <motion.div
                      layoutId="active-dashboard-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4988c4] z-20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="relative overflow-hidden">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {activeTab === 'order' ? (
                  <OrderAnalytics />
                ) : activeTab === 'service' ? (
                  <ServiceOrderAnalytics />
                ) : (
                  <TradeInAnalytics />
                )}
              </motion.div>
            </div>
          </div>

          <div className="xl:col-span-6">
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

          <div className="xl:col-span-6">
             <BestSellingProducts />
          </div>
        </div>
      </div>
    </div>
  );
}
