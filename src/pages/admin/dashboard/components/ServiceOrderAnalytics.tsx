import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import serviceOrderService from '@/api/services/serviceOrderService';
import {
  Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
  FunnelChart, Funnel, LabelList
} from 'recharts';
import { formatPrice, cn } from '@/lib/utils';
import {
  Sparkles, RefreshCw, AlertCircle, Banknote, ArrowUpRight, ArrowDownRight, ClipboardList, type LucideIcon
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import type { DateRange } from 'react-day-picker';
import { startOfMonth, format } from 'date-fns';

export const ServiceOrderAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date()
  });

  const fromDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  const { data: stats, isLoading, isFetching } = useQuery({
    queryKey: ['serviceOrderDashboard', fromDate, toDate],
    queryFn: () => serviceOrderService.getServiceDashboard({ fromDate, toDate }),
    enabled: !!fromDate && !!toDate,
    staleTime: 5 * 60 * 1000
  });

  const { orderData, funnelData } = useMemo(() => {
    if (!stats) return { orderData: [], funnelData: [] };

    // 1. Pie Chart: Category / Status Distribution
    const pie = [
      { name: 'Completed', value: stats.totalCompletedOrders, color: '#10b981' }, 
      { name: 'Cancelled', value: stats.totalCancelledOrders, color: '#f43f5e' }, 
      { name: 'Refunded', value: stats.totalRefundOrders, color: '#f59e0b' },     
    ].filter(p => p.value > 0);

    // 2. Funnel Chart: Conversion
    const funnel = [
      { name: 'Lead', value: stats.totalServiceOrders, fill: '#4988c4' },
      { name: 'Active', value: stats.totalServiceOrders - stats.totalCancelledOrders, fill: '#14b8a6' },
      { name: 'Done', value: stats.totalCompletedOrders, fill: '#10b981' }
    ].filter(f => f.value > 0);

    return { orderData: pie, funnelData: funnel };
  }, [stats]);

  if (isLoading) return <ServiceAnalyticsSkeleton />;
  if (!stats) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4988c4] font-black uppercase tracking-[0.2em] text-[10px]">
            <Sparkles className="w-4 h-4" /> Service Operations
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Service Analytics</h2>
          <p className="text-sm text-slate-400 font-medium">Real-time metrics for cleaning & maintenance services.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1.5 min-w-[300px]">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Analysis Period</label>
            <DatePicker mode="range" value={dateRange} onChange={setDateRange} className="rounded-[1rem]" />
          </div>
          {isFetching && (
            <div className="pt-5 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-[#4988c4] animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Orders" value={stats.totalServiceOrders} icon={ClipboardList} color="blue" sub="Bookings" />
        <StatCard label="Revenue" value={formatPrice(stats.totalAmount).replace(' ₫', '')} icon={Banknote} color="emerald" sub="Gross income" trend={8.2} />
        <StatCard label="Completed" value={stats.totalCompletedOrders} icon={Sparkles} color="indigo" sub="Finished tasks" />
        <StatCard label="Refund Claims" value={formatPrice(stats.totalRefundAmount).replace(' ₫', '')} icon={AlertCircle} color="amber" sub="Total refunded" negative />
      </div>

      {/* Main Analytical Grid (Pie & Funnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pie Chart -> Category Distribution (Status) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Distribution</h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4">Lifecycle Ratios</p>
          <div className="h-[220px] w-full relative">
            {orderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={4} cornerRadius={10} dataKey="value" stroke="none">
                    {orderData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (<div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-sm">No data</div>)}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 leading-none">{stats.totalCompletedOrders}</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Done</span>
            </div>
          </div>
        </div>

        {/* Funnel -> Conversion */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Conversion</h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4">Service Completion Funnel</p>
          <div className="h-[220px] w-full">
            {funnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip content={<CustomFunnelTooltip />} />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="#475569" stroke="none" dataKey="name" fontSize={11} fontWeight={800} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            ) : (<div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-sm">No data</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'indigo' | 'amber';
  sub: string;
  trend?: number;
  negative?: boolean;
}

const StatCard = ({ label, value, icon: Icon, color, sub, trend, negative }: StatCardProps) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className="bg-white p-5 rounded-[1.25rem] border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("h-10 w-10 rounded-[0.85rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn("flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm", negative ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")}>
            {negative ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />} {trend}%
          </div>
        )}
      </div>
      <div>
        <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-0.5">{value}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-[9px] text-slate-300 font-medium mt-1">{sub}</p>
      </div>
    </div>
  );
};

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
  fill?: string;
  revenue?: number;
  payload?: { color?: string; fill?: string; name?: string; revenue?: number; value?: number;[key: string]: unknown };
  [key: string]: unknown;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomPieTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = data.payload?.color || data.color || data.fill || '#4988c4';
    return (
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{data.name}</p>
        </div>
        <p className="text-lg font-black text-slate-900 leading-none">{data.value} Orders</p>
      </div>
    );
  }
  return null;
};

const CustomFunnelTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const color = data.payload?.fill || data.fill || '#4988c4';
    return (
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{data.name}</p>
        </div>
        <p className="text-lg font-black text-slate-900 leading-none">{data.value} conversions</p>
      </div>
    );
  }
  return null;
};

const ServiceAnalyticsSkeleton = () => (
  <div className="space-y-8 pb-10">
    <div className="flex justify-between items-end pb-2">
      <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-64" /></div>
      <Skeleton className="h-12 w-80 rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-[2rem]" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Skeleton className="lg:col-span-3 h-[400px] rounded-[2.5rem]" />
      <Skeleton className="lg:col-span-2 h-[400px] rounded-[2.5rem]" />
    </div>
  </div>
);
