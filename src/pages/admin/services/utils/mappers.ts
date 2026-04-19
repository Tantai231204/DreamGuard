import type {
  AdminSearchOrderServiceItem,
  ServiceBooking,
  ServiceStatus,
  PaymentStatus,
  ServiceAddress,
  ServiceTask
} from '../types';
import type { AdminSearchServiceTaskItem } from '@/api/services/serviceOrderService';

/**
 * Senior-level Mapper for Service Orders
 * Transforms API response items into a frontend-friendly format
 */

export const parseAddress = (rawAddress: string | undefined): ServiceAddress => {
  if (!rawAddress) {
    return { street: '', ward: '', district: '', city: '' };
  }

  // Example: "276/31/5 Thống Nhất Phường 16 Quận Gò Vấp, 76001, 760, 79"
  // Format is usually [Street], [Ward], [District], [City]
  // Junior way: split(',')
  // Senior way: RegEx or smarter split for Vietnam addresses
  const fullAddress = rawAddress.split(',')[0] || '';

  return {
    street: fullAddress,
    ward: '',
    district: '',
    city: ''
  };
};

export const mapStatus = (apiStatus: string | undefined): ServiceStatus => {
  const status = (apiStatus || '').toLowerCase();

  // Custom mapping for legacy or inconsistent strings
  let mappedStatus = status;
  if (status === 'in_progress') mappedStatus = 'processing';
  if (status === 'refund') mappedStatus = 'refunded';

  const validStatus: ServiceStatus[] = [
    'pending', 'confirmed', 'processing', 'completed',
    'cancelled', 'rejected', 'refunded', 'forcedcancelled', 'rescheduled'
  ];
  return (validStatus.includes(mappedStatus as ServiceStatus) ? mappedStatus : 'pending') as ServiceStatus;
};

export const mapPaymentStatus = (apiPaymentStatus: string | undefined): PaymentStatus => {
  if (!apiPaymentStatus) return 'unpaid';
  const norm = apiPaymentStatus.toLowerCase();
  // If payment status is literally "COD" (meaning unpaid COD) or "CODPaid"
  if (norm === 'cod') return 'pending_payment';
  if (norm === 'codpaid') return 'COD Paid';

  return apiPaymentStatus;
};

export const mapApiItemToServiceOrder = (item: AdminSearchOrderServiceItem): ServiceBooking => {
  // Parsing date and time
  const [date, timePart] = (item.appointmentDate || '').split('T');
  const time = timePart ? timePart.substring(0, 5) : '';

  return {
    id: item.soId,
    orderCode: item.orderCode,
    customerName: item.receiverName || "N/A",
    customerPhone: item.phoneNumber || "N/A",
    customerEmail: "", // TODO: API should provide this
    serviceType: 'deep_clean', // Defaulting for now, API doesn't seem to return specific type yet
    status: mapStatus(item.status),
    paymentStatus: mapPaymentStatus(item.paymentStatus),
    paymentMethod: item.paymentMethod,
    subTotalPrice: item.subTotalPrice,
    scheduledDate: date,
    scheduledTime: time,
    appointmentDate: item.appointmentDate,
    address: parseAddress(item.address),
    items: (item.serviceOrderItems || item.items || item.orderDetails || []).map(it => ({
      ...it,
      id: it.serviceOrderItemId || it.id,
      name: it.name || (it.servicePackageName && it.productTypeName ? `${it.servicePackageName} - ${it.productTypeName}` : it.servicePackageName || it.productTypeName || "Service Item"),
      totalPrice: it.totalPrice || (it.quantity && it.unitPrice ? it.quantity * it.unitPrice : 0)
    })),
    staff: item.staff || null,
    technician: item.staff || null,
    serviceTask: item.serviceTask || item.task || item.orderTask || item.serviceOrderTask,
    imageUrl: item.imageUrl || [],
    totalPrice: item.totalPrice || 0,
    notes: item.customerNote || "",
    rating: item.rating,
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
  };
};

export const mapApiDetailToOrder = (data: AdminSearchOrderServiceItem | { data: AdminSearchOrderServiceItem }): ServiceBooking => {
  const item = 'data' in data ? data.data : data;
  return mapApiItemToServiceOrder(item);
};

/**
 * Normalizes raw task data from multiple possible backend field variations
 */
export const mapApiTaskToServiceTask = (rawTask: AdminSearchServiceTaskItem | null | undefined): ServiceTask | null => {
  if (!rawTask) return null;

  // Use type casting safely here to account for dynamic fields
  const t = rawTask as Record<string, unknown>;

  return {
    ...rawTask,
    serviceTaskId: (t.serviceTaskId || t.taskId || t.id) as string,
    status: (t.status || t.taskStatus) as string,
    checkIn: (t.checkIn || t.checkin || t.checkInTime) as string | null,
    checkOut: (t.checkOut || t.checkout || t.checkOutTime) as string | null,
    checkInImage: (t.checkInImage || t.checkinImage || t.checkInUrl || t.checkinUrl) as string | null,
    checkOutImage: (t.checkOutImage || t.checkoutImage || t.checkOutUrl || t.checkoutUrl) as string | null,
  } as ServiceTask;
};

