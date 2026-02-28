import { memo, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Star,
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  UserPlus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { statusConfig, serviceTypeConfig, paymentStatusConfig } from '../constants';
import type { ServiceBooking } from '../types';

interface ServiceBookingCardProps {
  booking: ServiceBooking;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
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
  const statusCfg = statusConfig[booking.status];
  const serviceTypeCfg = serviceTypeConfig[booking.serviceType];
  const paymentCfg = paymentStatusConfig[booking.paymentStatus];
  const ServiceIcon = serviceTypeCfg.icon;
  const StatusIcon = statusCfg.icon;

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(booking.totalPrice);
  }, [booking.totalPrice]);

  const formattedDate = useMemo(() => {
    return new Date(booking.scheduledDate).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  }, [booking.scheduledDate]);

  const fullAddress = useMemo(() => {
    const { street, district, city } = booking.address;
    return `${street}, ${district}, ${city}`;
  }, [booking.address]);

  const handleView = useCallback(() => onView?.(booking.id), [onView, booking.id]);
  const handleEdit = useCallback(() => onEdit?.(booking.id), [onEdit, booking.id]);
  const handleConfirm = useCallback(() => onConfirm?.(booking.id), [onConfirm, booking.id]);
  const handleCancel = useCallback(() => onCancel?.(booking.id), [onCancel, booking.id]);
  const handleAssign = useCallback(() => onAssignTechnician?.(booking.id), [onAssignTechnician, booking.id]);

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className={`px-4 py-3 ${statusCfg.bg} border-b flex items-center justify-between`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg bg-white/80 ${serviceTypeCfg.color} flex-shrink-0`}>
            <ServiceIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{booking.id}</span>
              <Badge variant="outline" className={`${statusCfg.bg} ${statusCfg.text} text-xs`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusCfg.label}
              </Badge>
            </div>
            <p className={`text-xs ${serviceTypeCfg.color} truncate`}>
              {serviceTypeCfg.label}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleView}>
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </DropdownMenuItem>
            {!booking.technician && booking.status !== 'cancelled' && (
              <DropdownMenuItem onClick={handleAssign}>
                <UserPlus className="h-4 w-4 mr-2" />
                Phân công kỹ thuật viên
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {booking.status === 'pending' && (
              <DropdownMenuItem onClick={handleConfirm} className="text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Xác nhận đơn
              </DropdownMenuItem>
            )}
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <DropdownMenuItem onClick={handleCancel} className="text-red-600">
                <XCircle className="h-4 w-4 mr-2" />
                Hủy đơn
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
              <span>{formattedDate}</span>
              <span className="text-gray-300">|</span>
              <Clock className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <span>{booking.scheduledTime}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-500 text-xs">
              <MapPin className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{fullAddress}</span>
            </div>
          </div>

          {/* Items */}
          <div className="bg-gray-50 rounded-lg p-2.5 text-xs">
            {booking.items.slice(0, 2).map((item) => (
              <div key={item.id} className="flex justify-between py-0.5">
                <span className="text-gray-600">{item.name} ×{item.quantity}</span>
                <span className="text-gray-900 font-medium tabular-nums">
                  {new Intl.NumberFormat('vi-VN').format(item.unitPrice * item.quantity)}đ
                </span>
              </div>
            ))}
            {booking.items.length > 2 && (
              <p className="text-gray-400 pt-1">+{booking.items.length - 2} khác</p>
            )}
          </div>

          {/* Technician */}
          {booking.technician ? (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg text-xs">
              <Avatar className="h-6 w-6">
                <AvatarImage src={booking.technician.avatar} />
                <AvatarFallback className="bg-green-600 text-white text-xs">
                  {booking.technician.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-700 flex-1 truncate">{booking.technician.name}</span>
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-gray-600">{booking.technician.rating}</span>
            </div>
          ) : booking.status !== 'cancelled' && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Chưa phân công</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Badge variant="outline" className={`${paymentCfg.bg} ${paymentCfg.text} text-xs`}>
              {paymentCfg.label}
            </Badge>
            <p className="text-base font-bold text-blue-600 tabular-nums">
              {formattedPrice}
            </p>
          </div>
        </CardContent>
      </Card>
  );
});
