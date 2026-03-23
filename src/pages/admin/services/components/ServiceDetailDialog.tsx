import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useStaffs } from '@/hooks/queries/useStaff';
import type { StaffResponse } from '@/api/types/staff.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminStatusBadge } from '@/components/admin';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  AlertCircle,
  CreditCard,
  FileText,
  Loader2,
  Bookmark,
  Briefcase,
  Camera,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { statusConfig } from '../constants';

interface ServiceDetailDialogProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface ServiceItemDetail {
  id?: string;
  name?: string;
  packageName?: string;
  servicePackageName?: string;
  productTypeName?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  price?: number;
}

export const ServiceDetailDialog = memo(function ServiceDetailDialog({
  orderId,
  isOpen,
  onClose,
}: ServiceDetailDialogProps) {
  const { data: detailData, isLoading: isOrderLoading } = useQuery({
    queryKey: ['serviceOrder', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await api.get(`/ServiceOrders/${orderId}`);
      return res.data;
    },
    enabled: !!orderId && isOpen,
  });

  const { data: taskData, isLoading: isTaskLoading } = useQuery({
    queryKey: ['serviceTask', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await api.get('/ServiceTasks/AdminSearchServiceTask', {
        params: { soId: orderId, pageSize: 1 }
      });
      return res.data;
    },
    enabled: !!orderId && isOpen,
  });

  const { data: staffData } = useStaffs({ pageSize: 100 });

  const order = detailData;
  const task = taskData?.items?.[0];
  const isLoading = isOrderLoading || isTaskLoading;

  const technician = useMemo(() => {
    if (!task?.staffId || !staffData?.items) return null;
    const staff = staffData.items.find((s: StaffResponse) => s.staffId === task.staffId);
    if (!staff) return null;
    return {
      name: staff.fullName,
      phone: staff.phoneNumber,
      avatar: staff.avatarUrl,
    };
  }, [task, staffData]);

  if (!orderId) return null;

  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  const rawStatus = order?.status?.toLowerCase();
  const statusKey = (validStatuses.includes(rawStatus) ? rawStatus : 'pending') as import('../types').ServiceStatus;
  const statusCfg = statusConfig[statusKey] || statusConfig['pending'];
  const StatusIcon = statusCfg.icon;

  const scheduledDate = order?.appointmentDate ? order.appointmentDate.split('T')[0] : '';
  const scheduledTime = order?.appointmentDate ? order.appointmentDate.split('T')[1]?.substring(0, 5) : '';

  // Robust items fallback extraction
  const orderItems = order?.items || order?.orderDetails || order?.serviceOrderItems || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-xl gap-0 border border-slate-200 shadow-lg">
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : !order ? (
          <div className="text-center py-19 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500 animate-bounce" />
            <p className="font-semibold text-lg">Failed to load order details</p>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-slate-50/50">
            {/* Direct standard Clean Minimalistic White Header */}
            <DialogHeader className="p-6 bg-white border-b border-slate-100 relative">
              <div className="flex items-center justify-between mt-2 mr-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-blue-600" />
                    <DialogTitle className="text-lg font-bold tracking-tight text-slate-900">
                      Order Overview
                    </DialogTitle>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-1 gap-1 flex items-center">
                    Code: <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md">{order?.orderCode || orderId}</span>
                  </p>
                </div>
                {order && statusCfg && (
                  <Badge variant="outline" className={`${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} border border-slate-100 py-1 px-3 rounded-full shadow-sm text-xs font-bold gap-1.5 flex items-center`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {statusCfg.label}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            {/* Scrollable Main Content Container */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side Group */}
                <div className="space-y-6">
                  {/* Customer Information Component Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100/80 shadow-sm space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" /> Customer Information
                      </h4>
                    </div>
                    <Separator className="bg-slate-100" />
                    <div className="space-y-3 text-sm pt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Name:</span>
                        <span className="font-bold text-slate-800">{order.receiverName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Phone:</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md text-xs">
                          <Phone className="h-3 w-3 text-blue-600" /> {order.phoneNumber || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Details Component Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100/80 shadow-sm space-y-3">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" /> Booking Schedule
                    </h4>
                    <Separator className="bg-slate-100" />
                    <div className="grid grid-cols-2 gap-3 text-sm pt-1">
                      <div className="bg-slate-50 p-3 rounded-lg flex flex-col items-center justify-center text-center gap-1 border border-slate-100">
                        <Calendar className="h-4 w-4 text-blue-600 mb-0.5" />
                        <span className="text-[11px] text-slate-400 font-medium font-sans">Scheduled Date</span>
                        <span className="font-bold text-slate-800">{formatDate(scheduledDate)}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg flex flex-col items-center justify-center text-center gap-1 border border-slate-100">
                        <Clock className="h-4 w-4 text-blue-600 mb-0.5" />
                        <span className="text-[11px] text-slate-400 font-medium font-sans">Scheduled Time</span>
                        <span className="font-bold text-slate-800">{scheduledTime || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50/80 p-3 rounded-lg flex items-start gap-2 text-slate-600 text-xs border border-slate-100/50 mt-1">
                      <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 block mb-0.5">Service Address:</span>
                        {order.address || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side Group */}
                <div className="space-y-6">
                  {/* Assignment Task Component Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100/80 shadow-sm space-y-3">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-amber-500" /> Task Assignments
                    </h4>
                    <Separator className="bg-slate-100" />

                    {technician ? (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <Avatar className="h-10 w-10 border border-white shadow-sm">
                            <AvatarImage src={technician.avatar} />
                            <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
                              {technician.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 text-sm truncate flex items-center gap-1">
                              {technician.name}
                              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-sans">
                              <Phone className="h-3 w-3" /> {technician.phone || 'N/A'}
                            </p>
                          </div>
                        </div>
                        {task && (
                          <div className="bg-slate-50/80 p-2.5 rounded-lg text-xs space-y-2 border border-slate-100/50">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-medium">Current State:</span>
                              <Badge className="bg-blue-600 text-white border-0 shadow-sm text-[10px] font-bold h-4 rounded-full">
                                {task.status || 'Active'}
                              </Badge>
                            </div>
                            {task.staffNote && (
                              <div className="flex flex-col gap-0.5 mt-1 pt-1 border-t border-slate-200/50">
                                <span className="text-slate-400 font-medium">Note:</span>
                                <span className="italic text-slate-600">{task.staffNote}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-amber-600 bg-amber-50/50 rounded-xl border border-dashed border-amber-200">
                        <AlertCircle className="h-6 w-6 mb-1 text-amber-500" />
                        <span className="text-xs font-bold font-sans">Technician Not Assigned Yet</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Component Detail Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100/80 shadow-sm space-y-3">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-sky-500" /> Billing Overview
                    </h4>
                    <Separator className="bg-slate-100" />
                    <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 mt-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400 font-medium font-sans">Payment Info</span>
                        <div className="flex gap-1.5 flex-wrap mt-0.5">
                          <AdminStatusBadge status={order.paymentStatus?.toLowerCase()} mode="payment" />
                          {order.paymentMethod && order.paymentMethod?.toLowerCase() !== order.paymentStatus?.toLowerCase() && (
                            <AdminStatusBadge status={order.paymentMethod?.toLowerCase()} />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-medium block font-sans">Total Payable</span>
                        <p className="text-xl font-black text-slate-800 tabular-nums">
                          {formatPrice(order.totalPrice || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Redesigned Check-In / Check-Out Section */}
              {task && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="bg-white p-5 rounded-xl border border-slate-100/80 shadow-sm space-y-3">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Camera className="h-4 w-4 text-sky-500" /> Check-In Validation
                    </h4>
                    <Separator className="bg-slate-100" />
                    {task.checkIn || task.checkinImage || task.checkinUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-100/80 mt-1">
                        <img
                          src={task.checkIn || task.checkinImage || task.checkinUrl}
                          className="object-cover w-full h-full"
                          alt="Check-in Validation Visual"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f8fafc/94a3b8?text=Validation+Photo";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-slate-50/50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 mt-1">
                        <Camera className="h-5 w-5 mb-1 text-slate-300" />
                        <span className="text-xs font-bold font-sans">No Validation Image Reported</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-100/80 shadow-sm space-y-3">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Check-Out Validation
                    </h4>
                    <Separator className="bg-slate-100" />
                    {task.checkOut || task.checkoutImage || task.checkoutUrl ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-100/80 mt-1">
                        <img
                          src={task.checkOut || task.checkoutImage || task.checkoutUrl}
                          className="object-cover w-full h-full"
                          alt="Check-out Validation Visual"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f8fafc/94a3b8?text=Validation+Photo";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-slate-50/50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 mt-1">
                        <CheckCircle2 className="h-5 w-5 mb-1 text-slate-300" />
                        <span className="text-xs font-bold font-sans">No Validation Image Reported</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Redesigned Bottom Section: Order Items Table */}
              <div className="bg-white p-5 rounded-xl border border-slate-100/80 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-500" /> Service Packages Detailed
                </h4>
                <Separator className="bg-slate-100" />

                <div className="overflow-hidden rounded-xl border border-slate-100 mt-1">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left">Package Details</th>
                        <th className="px-4 py-3 text-center">Quantity</th>
                        <th className="px-4 py-3 text-right">Unit Pricing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {orderItems.length > 0 ? (
                        orderItems.map((item: ServiceItemDetail, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-800">
                              {item.name || item.packageName || 'Service Item description'}
                            </td>
                            <td className="px-4 py-3.5 text-center text-slate-600 font-medium">
                              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 text-[11px] font-bold px-2 rounded-md">
                                {item.quantity || 1}
                              </Badge>
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold text-slate-800 tabular-nums">
                              {formatPrice(item.unitPrice || item.price || 0)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-slate-400 font-sans italic font-medium bg-slate-50/50">
                            No packages items breakdown provided
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {order.customerNote && (
                  <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200/50 text-xs text-slate-600 flex items-start gap-1.5 mt-1 font-sans">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 block mb-0.5">Note:</span>
                      {order.customerNote}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});
