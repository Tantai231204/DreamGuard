import type { ServiceBooking, ServiceStats } from './types';

export const calculateServiceStats = (bookings: ServiceBooking[]): ServiceStats => {
  const todayStr = new Date().toISOString().split('T')[0];

  return bookings.reduce<ServiceStats>(
    (acc, booking) => {
      acc.totalBookings += 1;
      
      const status = booking.status?.toLowerCase();
      const isUnassigned = !booking.staff && !booking.technician;
      
      if (status === 'pending' || (status === 'confirmed' && isUnassigned)) {
        acc.pendingBookings += 1;
      } else if (status === 'processing' || (status === 'confirmed' && !isUnassigned)) {
        acc.inProgressBookings += 1;
      } else if (status === 'completed') {
        acc.completedBookings += 1;
      }
      
      acc.totalRevenue += booking.totalPrice || 0;

      if (booking.scheduledDate && booking.scheduledDate.startsWith(todayStr)) {
        acc.todayBookings += 1;
      }

      return acc;
    },
    {
      totalBookings: 0,
      pendingBookings: 0,
      inProgressBookings: 0,
      completedBookings: 0,
      totalRevenue: 0,
      todayBookings: 0,
    }
  );
};
