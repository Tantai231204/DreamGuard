import type { 
  AdminSearchOrderServiceItem, 
  ServiceBooking, 
  ServiceStatus, 
  PaymentStatus,
  ServiceAddress
} from '../types';

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
    'cancelled', 'rejected', 'refunded', 'forcedcancelled'
  ];
  return (validStatus.includes(mappedStatus as ServiceStatus) ? mappedStatus : 'pending') as ServiceStatus;
};

export const mapPaymentStatus = (apiPaymentStatus: string | undefined): PaymentStatus => {
  if (!apiPaymentStatus) return 'unpaid';
  const norm = apiPaymentStatus.toLowerCase();
  // If payment status is literally "COD" (meaning unpaid COD) or "CODPaid"
  if (norm === 'cod') return 'COD Unpaid';
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
    address: parseAddress(item.address),
    items: item.items || item.orderDetails || item.serviceOrderItems || [],
    staff: item.staff, // Consistent with API naming
    technician: item.staff, // Kept for backward compatibility in UI components
    serviceTask: item.serviceTask || item.task || item.orderTask || item.serviceOrderTask,
    totalPrice: item.totalPrice || 0,
    notes: item.customerNote || "",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
  };
};

export const mapApiDetailToOrder = (data: AdminSearchOrderServiceItem | { data: AdminSearchOrderServiceItem }): ServiceBooking => {
  const item = 'data' in data ? data.data : data;
  return mapApiItemToServiceOrder(item);
};

