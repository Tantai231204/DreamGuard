import { memo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Star,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  UserPlus,
  Pin
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminRowActions, AdminStatusBadge } from '@/components/admin';
import type { ServiceBooking } from '../types';
import { formatPrice, formatDate } from '@/lib/utils';
import { useServiceBookingCard } from '../hooks/useServiceBookingCard';

interface ServiceBookingCardProps {
  booking: ServiceBooking;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string, status: string) => void;
  onAssignTechnician?: (id: string) => void;
}

export const ServiceBookingCard = memo(function ServiceBookingCard({
  booking,
  onView,
  onEdit,
  onConfirm,
  onCancel,
  onAssignTechnician,
}: ServiceBookingCardProps) {
  const {
    statusCfg,
    serviceTypeCfg,
    ServiceIcon,
    StatusIcon,
    fullAddress,
    handleView,
    handleEdit,
    handleConfirm,
    handleCancel,
    handleAssign,
    technician,
    task,
  } = useServiceBookingCard({
    booking,
    onView,
    onEdit,
    onConfirm,
    onCancel,
    onAssignTechnician,
  });

  return (
    <div className="relative pt-3">
      {/* Decorative Realistic Top-Right Pin */}
      <div className="absolute top-0 right-6 z-20 flex items-center justify-center">
        <div className="h-7 w-7 rounded-full bg-white border border-amber-200 shadow-sm flex items-center justify-center p-0.5 relative before:absolute before:inset-1 text-amber-500">
          <Pin className="h-3.5 w-3.5 fill-amber-500 rotate-45" />
        </div>
      </div>

      <Card className="border-2 border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 group overflow-hidden bg-white">

        {/* Header */}
        <div className={`px-4 py-3.5 ${statusCfg.bg} border-b flex items-center justify-between`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg bg-white/80 ${serviceTypeCfg.color} flex-shrink-0`}>
              <ServiceIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{booking.orderCode || booking.id}</span>
                <Badge variant="outline" className={`${statusCfg.bg} ${statusCfg.text} text-xs`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusCfg.label}
                </Badge>
                {booking.rating && (
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-100/50 text-[10px] font-black gap-1 h-5 px-2 rounded-md">
                    <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                    {typeof booking.rating === 'object' ? booking.rating.score : booking.rating}
                  </Badge>
                )}
              </div>
              <p className={`text-xs ${serviceTypeCfg.color} truncate`}>
                {booking.notes || 'Service Order'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <AdminRowActions
              align="end"
              width="w-48"
              sections={[
                [
                  {
                    label: 'View Details',
                    icon: <Eye className="h-4 w-4" />,
                    onClick: handleView,
                  },
                  {
                    label: 'Edit',
                    icon: <Edit className="h-4 w-4" />,
                    onClick: handleEdit,
                  },
                  ...(booking.status === 'confirmed' && !technician ? [{
                    label: 'Assign Technician',
                    icon: <UserPlus className="h-4 w-4" />,
                    onClick: handleAssign,
                  }] : []),
                ],
                [
                  ...((booking.status === 'pending' &&
                    (booking.paymentMethod === 'COD' ||
                      (String(booking.paymentMethod).toUpperCase() === 'VNPAY' && booking.paymentStatus === 'paid'))) ? [{
                        label: 'Confirm Order',
                        icon: <CheckCircle className="h-4 w-4" />,
                        variant: 'success' as const,
                        onClick: handleConfirm,
                      }] : []),
                  ...((!['cancelled', 'completed', 'refunded', 'forcedcancelled'].includes(booking.status)) ? [{
                    label: 'Cancel Order',
                    icon: <XCircle className="h-4 w-4" />,
                    variant: 'danger' as const,
                    onClick: () => handleCancel(),
                  }] : []),
                ],
              ]}
            />
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Customer Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="bg-slate-100" />
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 text-sm truncate">{booking.customerName}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {booking.customerPhone}
              </p>
            </div>
          </div>

          {/* Schedule & Address */}
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span>{formatDate(booking.scheduledDate)}</span>
              <span className="text-gray-300">|</span>
              <Clock className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <span>{booking.scheduledTime}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-500 text-xs">
              <MapPin className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{fullAddress}</span>
            </div>
          </div>

          {/* Customer Note Placeholder or spacer */}
          {!booking.notes && <div className="h-2" />}
          {booking.notes && (
            <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-500 italic border border-slate-100 line-clamp-2">
              <span className="font-bold text-slate-400 not-italic mr-1">Note:</span>
              {booking.notes}
            </div>
          )}
          {/* Technician & Task */}
          {technician ? (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-xs border border-green-100/50">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={technician.avatar || ""} />
                <AvatarFallback className="bg-slate-200" />
              </Avatar>
              <span className="text-gray-900 font-bold truncate flex-1">{technician.name}</span>
              <div className="flex items-center gap-0.5 mr-2">
                <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] text-gray-700 font-bold">{technician.rating}</span>
              </div>
              {task && (
                <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1.5 uppercase tracking-tighter bg-white text-green-700 border-green-200 font-black">
                  {task.status}
                </Badge>
              )}
            </div>
          ) : booking.status !== 'cancelled' && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Not Assigned</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <AdminStatusBadge
                status={booking.paymentStatus}
                mode="payment"
              />
              {booking.paymentMethod && (
                <AdminStatusBadge
                  status={booking.paymentMethod}
                  mode="method"
                />
              )}
            </div>
            <p className="text-base font-bold text-blue-600 tabular-nums">
              {formatPrice(booking.totalPrice)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
