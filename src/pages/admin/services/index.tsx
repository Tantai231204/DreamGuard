import { motion } from 'framer-motion';
import { Sparkles, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { Skeleton } from '@/components/ui/skeleton';

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
              <div className="h-full flex flex-col p-6 space-y-6 bg-slate-50/30">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                   <Skeleton className="h-10 w-64 rounded-xl" />
                   <div className="flex gap-3">
                      <Skeleton className="h-10 w-32 rounded-xl" />
                      <Skeleton className="h-10 w-32 rounded-xl" />
                   </div>
                </div>
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-1 grid grid-cols-7 gap-px overflow-hidden">
                   {Array.from({ length: 35 }).map((_, i) => (
                     <div key={i} className="bg-slate-50/10 p-4 space-y-3">
                        <Skeleton className="h-4 w-6 rounded" />
                        <div className="space-y-2">
                           <Skeleton className="h-12 w-full rounded-xl opacity-40" />
                        </div>
                     </div>
                   ))}
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
