import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from "recharts";
import { Package, XCircle, CheckCircle, RotateCcw, TrendingUp, Wallet, RefreshCw } from "lucide-react";
import orderService from "@/api/services/orderService";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

import { DatePicker } from "@/components/ui/date-picker";
import type { DateRange } from "react-day-picker";

export const OrderAnalytics = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date()
  });

  const fromDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["order-dashboard", fromDate, toDate],
    queryFn: () => orderService.getDashboardData(fromDate, toDate),
  });

  // RADIAL DATA: Performance funnel (Total -> Completed)
  const performanceData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Total Orders", value: data.totalOrders, fill: "#e2e8f0" },
      { name: "Completed", value: data.totalCompletedOrders, fill: "#10b981" },
      { name: "Refunded", value: data.totalRefundedOrders, fill: "#f59e0b" },
      { name: "Cancelled", value: data.totalCancelledOrders, fill: "#ef4444" },
    ];
  }, [data]);

  // DONUT DATA: Revenue streams
  const revenueStreams = useMemo(() => {
    if (!data) return [];
    return [
      { name: "VnPay", value: data.totalVnPayAmount, color: "#4f46e5" },
      { name: "COD", value: data.totalCODAmount, color: "#10b981" }
    ];
  }, [data]);

  if (isLoading) return <OrderAnalyticsSkeleton />;

  if (!data) return null;

  const successRate = data.totalOrders > 0 
    ? Math.round((data.totalCompletedOrders / data.totalOrders) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* ── Header & Filter ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">
             <TrendingUp className="w-4 h-4" /> Fullfillment Insights
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Order Analytics</h2>
          <p className="text-sm text-slate-400 font-medium">Detailed breakdown of product order performance.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1.5 min-w-[300px]">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Analysis Period</label>
            <DatePicker mode="range" value={dateRange} onChange={setDateRange} className="rounded-[1rem]" />
          </div>
          {isFetching && (
            <div className="pt-5 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* ── High-Impact KPI Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Gross Revenue", value: formatPrice(data.totalAmount), icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+12.5% from last month" },
          { label: "Fulfillment", value: data.totalCompletedOrders, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", trend: `${successRate}% Success Rate` },
          { label: "Refund Volume", value: formatPrice(data.totalRefundAmount), icon: RotateCcw, color: "text-amber-600", bg: "bg-amber-50", trend: `${data.totalRefundedOrders} orders processed` },
          { label: "Risk Points", value: data.totalCancelledOrders, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", trend: "Loss prevention active" }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 h-24 w-24 ${kpi.bg} rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform`} />
            <div className="relative z-10">
              <kpi.icon className={`${kpi.color} mb-4`} size={20} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1.5 uppercase tracking-tighter">
                <span className={kpi.color}>●</span> {kpi.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left: Operational Performance (Radial) ── */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Fulfillment Performance</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Order lifecycle health</p>
            </div>
            <div className="h-10 w-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
               <Package className="h-5 w-5 text-[#4988c4]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 h-[300px] relative min-w-0">
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black text-slate-900">{successRate}%</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
               </div>
               <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="30%" 
                  outerRadius="100%" 
                  data={performanceData} 
                  startAngle={180} 
                  endAngle={-180}
                  barSize={12}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={30}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-5 space-y-4">
               {performanceData.slice(1).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                     <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">{item.name}</span>
                     </div>
                     <span className="text-sm font-black text-slate-900">{item.value}</span>
                  </div>
               ))}
               <div className="pt-2">
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    Performance is calculated based on completed orders vs total received orders within the selected window.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* ── Right: Revenue Distribution (Stylized Donut) ── */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
           <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Revenue Stream</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Payment integration split</p>
            </div>
            <Wallet className="h-5 w-5 text-indigo-500" />
          </div>

          <div className="h-[240px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueStreams}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {revenueStreams.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: string | number | readonly (string | number)[] | undefined) => {
                     const resolvedValue = Array.isArray(value) ? value[0] : value;
                     return formatPrice(resolvedValue as string | number | undefined);
                   }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-4">
            {revenueStreams.map((entry, i) => (
              <div key={i} className="flex items-center justify-between group cursor-default">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: `${entry.color}10` }}>
                       <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{entry.name}</p>
                       <p className="text-[9px] font-bold text-slate-400 tracking-tighter">Preferred by {i === 0 ? '60%' : '40%'} of users</p>
                    </div>
                 </div>
                 <span className="text-sm font-black text-slate-900">{formatPrice(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderAnalyticsSkeleton = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-end pb-2">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="h-12 w-80 rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <Skeleton className="lg:col-span-7 h-[450px] rounded-[2.5rem]" />
      <Skeleton className="lg:col-span-5 h-[450px] rounded-[2.5rem]" />
    </div>
  </div>
);
