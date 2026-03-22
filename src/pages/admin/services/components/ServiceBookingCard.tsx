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

interface ServiceItemDetail {
  id?: string;
  name?: string;
  packageName?: string;
  servicePackageName?: string;
  productTypeName?: string;
  quantity?: number;
  unitPrice?: number;
  price?: number;
}

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
    orderItems,
    fullAddress,
    handleView,
    handleEdit,
    handleConfirm,
    handleCancel,
    handleAssign,
    technician,
    task,
    isDetailFetching,
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
              <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                {booking.customerName.charAt(0)}
              </AvatarFallback>
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

          {/* Items breakdown list with fetching skeleton */}
          <div className="bg-gray-50/80 rounded-xl p-3 text-xs text-gray-600 border border-gray-100 min-h-[4.5rem] flex flex-col justify-center">
            {isDetailFetching && orderItems.length === 0 ? (
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            ) : orderItems.length > 0 ? (
              <div className="space-y-1">
                {orderItems.slice(0, 2).map((item: ServiceItemDetail, idx: number) => (
                  <div key={item.id || idx} className="flex justify-between items-center py-0.5">
                    <span className="text-gray-600 font-medium truncate pr-2">
                      {item.servicePackageName || item.name || 'Service Item'} ×{item.quantity || 1}
                    </span>
                    <span className="text-gray-900 font-bold tabular-nums shrink-0">
                      {formatPrice(item.unitPrice || item.price || 0)}
                    </span>
                  </div>
                ))}
                {orderItems.length > 2 && (
                  <p className="text-[10px] text-blue-600 font-bold mt-1">
                    + {orderItems.length - 2} more items...
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <div className="mt-0.5 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                <p className="line-clamp-2 italic leading-relaxed text-gray-400">
                  {booking.notes || 'No customer notes provided'}
                </p>
              </div>
            )}
          </div>

          {/* Technician */}
          {technician ? (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-xs">
              <Avatar className="h-6 w-6">
                <AvatarImage src={technician.avatar} />
                <AvatarFallback className="bg-green-600 text-white text-xs">
                  {technician.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-700 flex-1 truncate">{technician.name}</span>
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-gray-600">{technician.rating}</span>
              {task && (
                <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1 bg-sky-50 text-sky-700 border-sky-200">
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
                mode="status"
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
