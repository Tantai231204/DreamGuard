import { memo, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  TrendingUp,
  CalendarDays 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ServiceStats } from '../types';

interface ServiceStatsCardsProps {
  stats: ServiceStats;
}

const STAT_CONFIG = [
  { key: 'totalBookings', title: 'Tổng đặt lịch', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'todayBookings', title: 'Hôm nay', icon: CalendarDays, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'pendingBookings', title: 'Chờ xác nhận', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'inProgressBookings', title: 'Đang thực hiện', icon: Loader2, color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'completedBookings', title: 'Hoàn thành', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'totalRevenue', title: 'Doanh thu', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
] as const;

export const ServiceStatsCards = memo(function ServiceStatsCards({ stats }: ServiceStatsCardsProps) {
  const formattedRevenue = useMemo(() => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(stats.totalRevenue);
  }, [stats.totalRevenue]);

  const getValue = (key: string) => {
    if (key === 'totalRevenue') return formattedRevenue;
    return stats[key as keyof ServiceStats];
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {STAT_CONFIG.map(({ key, title, icon: Icon, color, bg }) => (
        <Card key={key} className="border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`${bg} p-2.5 rounded-lg flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 truncate">{title}</p>
                <p className={`text-lg font-bold ${color} tabular-nums truncate`}>
                  {getValue(key)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
