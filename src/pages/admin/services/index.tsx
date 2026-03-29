import { Sparkles, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { motion } from 'framer-motion';

import { ServiceCalendar, AssignTechnicianDialog } from './components';
import { useServiceManagement } from './hooks/useServiceManagement';

export default function ServiceManagement() {
  const {
    stats,
    filteredBookings,
    isLoading,
    handleViewBooking,
    handleCreateNew,
    selectedOrderId,
    isAssignOpen,
    setIsAssignOpen,
    handleConfirmBooking,
    handleCancelBooking,
    handleAssignTechnician,
  } = useServiceManagement();

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 overflow-hidden">
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

      <div className="flex-1 overflow-hidden bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-full flex flex-col"
        >
          <div className="flex-1 min-h-0">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                  <div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Synchronizing Schedule...</p>
                    <p className="text-xs text-gray-400 mt-1">Please wait while we load your service bookings.</p>
                  </div>
                </div>
              </div>
            ) : filteredBookings.length > 0 ? (
              <ServiceCalendar
                bookings={filteredBookings}
                onViewBooking={handleViewBooking}
                onConfirmBooking={handleConfirmBooking}
                onCancelBooking={handleCancelBooking}
                onAssignTechnician={handleAssignTechnician}
              />
            ) : (
              <Card className="border-dashed h-full flex items-center justify-center bg-gray-50/10">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mb-6 relative">
                    <CalendarIcon className="h-10 w-10 text-gray-200" />
                    <div className="absolute top-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-4 border-white animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                    No Schedule Found
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                    It looks like there are no bookings scheduled yet. Start by creating a new service booking to populate your calendar.
                  </p>
                  <Button
                    onClick={handleCreateNew}
                    className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-200 gap-3 transition-all active:scale-95"
                  >
                    <Plus className="h-5 w-5" />
                    Create First Booking
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>

      <AssignTechnicianDialog
        orderId={selectedOrderId}
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
      />
    </div>
  );
}
