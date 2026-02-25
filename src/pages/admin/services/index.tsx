import { useState, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  Plus, 
  Download, 
  RefreshCw,
  LayoutGrid,
  List
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import AdminPageHeader from '@/components/layout/AdminPageHeader';

import { ServiceStatsCards, ServiceFilters, ServiceBookingCard } from './components';
import { mockServiceBookings, calculateServiceStats } from './data';
import type { ServiceStatus, ServiceType } from './types';

type ViewMode = 'grid' | 'list';

export default function ServiceManagement() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Calculate stats
  const stats = useMemo(() => calculateServiceStats(mockServiceBookings), []);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return mockServiceBookings.filter((booking) => {
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesSearch = 
          booking.id.toLowerCase().includes(search) ||
          booking.customerName.toLowerCase().includes(search) ||
          booking.customerPhone.includes(search) ||
          booking.customerEmail.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && booking.status !== statusFilter) {
        return false;
      }

      // Service type filter
      if (serviceTypeFilter !== 'all' && booking.serviceType !== serviceTypeFilter) {
        return false;
      }

      // Date filter
      if (dateFilter && booking.scheduledDate !== dateFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, serviceTypeFilter, dateFilter]);

  // Handlers
  const handleViewBooking = useCallback((id: string) => {
    toast.info(`Xem chi tiết đơn ${id}`);
    // TODO: Navigate to detail page
  }, []);

  const handleEditBooking = useCallback((id: string) => {
    toast.info(`Chỉnh sửa đơn ${id}`);
  }, []);

  const handleConfirmBooking = useCallback((id: string) => {
    toast.success(`Đã xác nhận đơn ${id}`);
  }, []);

  const handleCancelBooking = useCallback((id: string) => {
    toast.error(`Đã hủy đơn ${id}`);
  }, []);

  const handleAssignTechnician = useCallback((id: string) => {
    toast.info(`Phân công kỹ thuật viên cho đơn ${id}`);
  }, []);

  const handleExport = useCallback(() => {
    toast.success('Đang xuất báo cáo...');
  }, []);

  const handleRefresh = useCallback(() => {
    toast.success('Đã làm mới dữ liệu');
  }, []);

  const handleCreateNew = useCallback(() => {
    toast.info('Tạo đơn dịch vụ mới');
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <AdminPageHeader
        title="Quản lý dịch vụ vệ sinh"
        description="Theo dõi và quản lý các đơn đặt dịch vụ vệ sinh"
        icon={Sparkles}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2 rounded-xl border-2 font-medium shadow-sm hover:shadow-md border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2 rounded-xl border-2 font-medium shadow-sm hover:shadow-md border-green-200 text-green-700 hover:border-green-500 hover:bg-green-500 hover:text-white transition-all"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Xuất báo cáo</span>
            </Button>
            <Button
              size="sm"
              onClick={handleCreateNew}
              className="gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-[var(--color-primary-hover)] hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Tạo đơn mới</span>
            </Button>
          </div>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Stats */}
        <ServiceStatsCards stats={stats} />

        {/* Filters */}
        <ServiceFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          serviceTypeFilter={serviceTypeFilter}
          onServiceTypeFilterChange={setServiceTypeFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
        />

        {/* View Toggle & Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Tìm thấy <strong className="text-gray-900">{filteredBookings.length}</strong> đơn đặt dịch vụ
          </p>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-9">
              <TabsTrigger value="grid" className="h-7 px-3 gap-1.5">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Lưới</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="h-7 px-3 gap-1.5">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Danh sách</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                : 'grid grid-cols-1 gap-3'
            }
          >
            {filteredBookings.map((booking) => (
              <ServiceBookingCard
                key={booking.id}
                booking={booking}
                onView={handleViewBooking}
                onEdit={handleEditBooking}
                onConfirm={handleConfirmBooking}
                onCancel={handleCancelBooking}
                onAssignTechnician={handleAssignTechnician}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Không tìm thấy đơn đặt dịch vụ
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Thử thay đổi bộ lọc hoặc tạo đơn mới
              </p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo đơn mới
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
