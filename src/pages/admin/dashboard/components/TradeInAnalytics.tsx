import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import tradeInOrderService from '@/api/services/tradeInOrderService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { formatPrice, cn } from '@/lib/utils';
import {
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import type { DateRange } from 'react-day-picker';
import { startOfMonth, format } from 'date-fns';

export const TradeInAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date()
  });

  const fromDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  const { data: stats, isLoading, isFetching } = useQuery({
    queryKey: ['tradeInDashboard', fromDate, toDate],
    queryFn: () => tradeInOrderService.getTradeInDashboard({
      fromDate,
      toDate
    }),
    enabled: !!fromDate && !!toDate,
    staleTime: 5 * 60 * 1000 // Cache 5 phút để tối ưu performance
  });

  if (isLoading) return <TradeInAnalyticsSkeleton />;

  if (!stats) return null;

  // Sử dụng palette màu cao cấp, đồng bộ
  const orderData = [
    { name: 'Completed', value: stats.totalCompletedTradeInOrders, color: '#0ea5e9' }, // sky-500
    { name: 'Cancelled', value: stats.totalCancelledTradeInOrders, color: '#f43f5e' }, // rose-500
    { name: 'Refunded', value: stats.totalRefundedTradeInOrders, color: '#f59e0b' },   // amber-500
  ];

  const amountData = [
    { name: 'Purchase', value: stats.totalPurchaseAmount, color: '#6366f1' }, // indigo-500
    { name: 'Deposit', value: stats.totalDepositAmount, color: '#14b8a6' },   // teal-500
    { name: 'COD', value: stats.totalCODAmount, color: '#f59e0b' },           // amber-500
    { name: 'VNPay', value: stats.totalVnPayAmount, color: '#4988c4' },       // brand
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
            <TrendingUp className="w-4 h-4" />
            Performance Insights
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trade-In Analytics</h2>
          <p className="text-sm text-slate-400 font-medium">Real-time data synchronization with backend ledger.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1.5 min-w-[300px]">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Analysis Period</label>
            <DatePicker
              mode="range"
              value={dateRange}
              onChange={setDateRange}
              className="rounded-[1rem]"
            />
          </div>
          {isFetching && (
            <div className="pt-5">
              <RefreshCw className="w-4 h-4 text-primary animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Gross Transactions" value={stats.totalTradeInOrders} icon={RefreshCw} color="blue" sub="Recorded requests" />
        <StatCard label="Total Revenue" value={formatPrice(stats.totalAmount)} icon={Banknote} color="emerald" sub="Gross settlement" trend={12.4} />
        <StatCard label="Acquisition Cost" value={formatPrice(stats.totalPurchaseAmount)} icon={CheckCircle2} color="indigo" sub="Paid to customers" />
        <StatCard label="Refund Liability" value={formatPrice(stats.totalRefundAmount)} icon={AlertCircle} color="amber" sub="Processing returns" negative />
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Order Mix - Pie Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors duration-500" />
          <div className="relative z-10 mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Lifecycle Mix</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Order Completion Ratios</p>
          </div>

          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={105}
                  paddingAngle={4}
                  cornerRadius={10}
                  dataKey="value"
                  stroke="none"
                >
                  {orderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{stats.totalTradeInOrders}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 shadow-sm">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {orderData.map(item => (
              <div key={item.name} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{item.name}</span>
                <span className="text-sm font-black text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Distribution - Bar Chart */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-emerald-50 rounded-full opacity-50 blur-3xl group-hover:bg-primary/20 transition-all duration-700" />

          <div className="relative z-10 flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Settlement Distribution</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Revenue across payment streams</p>
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400">
              TOTAL: {formatPrice(stats.totalAmount)}
            </div>
          </div>

          <div className="h-[300px] w-full z-20 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amountData} layout="vertical" margin={{ top: 0, left: 10, right: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(v) => {
                    if (v >= 1000000000) return `${(v / 1000000000).toFixed(1)}T`;
                    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}Tr`;
                    return v;
                  }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#475569' }}
                  width={70}
                />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28} activeBar={<Cell fillOpacity={0.7} />}>
                  {amountData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    [key: string]: unknown;
  }>;
}

const CustomPieTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = payload[0] as any;
    const color = data.payload?.color || data.color || '#4988c4';
    return (
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{payload[0].name}</p>
        </div>
        <p className="text-lg font-black text-slate-900 leading-none">{payload[0].value} Orders</p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = payload[0] as any;
    const color = data.payload?.color || data.color || '#4988c4';
    return (
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-100 shadow-xl">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{payload[0].name} Revenue</p>
        </div>
        <p className="text-xl font-black leading-none" style={{ color }}>{formatPrice(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const TradeInAnalyticsSkeleton = () => (
  <div className="space-y-8 pb-10">
    <div className="flex justify-between items-end pb-2">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="h-12 w-80 rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-[2rem]" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Skeleton className="lg:col-span-2 h-[450px] rounded-[2.5rem]" />
      <Skeleton className="lg:col-span-3 h-[450px] rounded-[2.5rem]" />
    </div>
  </div>
);
