import { Sparkles, Plus, LayoutGrid, List, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { motion } from 'framer-motion';

import { ServiceFilters, ServiceBookingCard, AssignTechnicianDialog, ServiceDetailDialog } from './components';
import { useServiceManagement } from './hooks/useServiceManagement';

type ViewMode = 'grid' | 'list';

export default function ServiceManagement() {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    serviceTypeFilter,
    setServiceTypeFilter,
    dateFilter,
    setDateFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    viewMode,
    setViewMode,
    isAssignOpen,
    setIsAssignOpen,
    isDetailOpen,
    setIsDetailOpen,
    selectedOrderId,
    stats,
    filteredBookings,
    isLoading,
    handleViewBooking,
    handleEditBooking,
    handleConfirmBooking,
    handleCancelBooking,
    handleAssignTechnician,
    handleCreateNew,
  } = useServiceManagement();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <AdminPageHeader
        title="Cleaning Service Management"
        description="Track and manage cleaning service bookings"
        icon={Sparkles}
        stats={[
          { label: 'Total Bookings', value: stats.totalBookings },
          { label: 'Pending', value: stats.pendingBookings },
          { label: 'In Progress', value: stats.inProgressBookings },
          { label: 'Completed', value: stats.completedBookings }
        ]}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="m-6 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl flex flex-col h-[calc(100%-3rem)] p-4 space-y-4"
        >

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
              Found <strong className="text-gray-900">{filteredBookings.length}</strong> service bookings
            </p>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-9">
                <TabsTrigger value="grid" className="h-7 px-3 gap-1.5">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Grid</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="h-7 px-3 gap-1.5">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">List</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Bookings List */}
          <div className="flex-1 overflow-auto pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredBookings.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'
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
              <Card className="border-dashed flex-1 justify-center">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No bookings found
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Try changing some filters or create a new booking.
                  </p>
                  <button onClick={handleCreateNew} className="gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center">
                    <Plus className="h-4 w-4" />
                    Create New Booking
                  </button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Custom Pagination Footer */}
          {!isLoading && filteredBookings.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t-2 border-gray-100 bg-gray-50/50 -mx-4 -mb-4">
               <div className="text-sm font-medium text-gray-500">
                Page <span className="text-gray-900 font-bold">{currentPage}</span> of <span className="text-gray-900 font-bold">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-2 h-9 px-4 rounded-xl border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-2 h-9 px-4 rounded-xl border-gray-200"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <AssignTechnicianDialog
        orderId={selectedOrderId}
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
      />

      <ServiceDetailDialog
        orderId={selectedOrderId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
