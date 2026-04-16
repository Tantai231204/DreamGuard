export interface ServiceOrderItem {
  id?: string;
  servicePackageMappingId?: string;
  packageName?: string;
  serviceName?: string;
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface ServiceOrderStaff {
  staffId?: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  position?: string;
}

export interface ServiceOrderTask {
  serviceTaskId?: string;
  staffId?: string;
  status?: string;
  checkIn?: string | null;
  checkOut?: string | null;
}

export interface ServiceOrderResponse {
  soId?: string;
  id?: string;
  orderCode?: string;
  customerId?: string;
  status?: string;
  totalPrice?: number;
  subTotalPrice?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  appointmentDate?: string;
  receiverName?: string;
  phoneNumber?: string;
  address?: string;
  customerNote?: string;
  note?: string;
  staff?: ServiceOrderStaff | null;
  technician?: ServiceOrderStaff | null;
  serviceTask?: ServiceOrderTask | null;
  task?: ServiceOrderTask | null;
  orderTask?: ServiceOrderTask | null;
  serviceOrderTask?: ServiceOrderTask | null;
  items?: ServiceOrderItem[];
  orderDetails?: ServiceOrderItem[];
  serviceOrderItems?: ServiceOrderItem[];
}

export interface ServiceOrderListResponse {
  items: ServiceOrderResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface ReOrderFailedServiceOrderResponse {
  paymentUrl?: string;
  serviceOrderId?: string;
  soId?: string;
  id?: string;
  [key: string]: unknown;
}

export interface ServiceDashboardResponse {
  totalServiceOrders: number;
  totalCancelledOrders: number;
  totalCompletedOrders: number;
  totalRejectedOrders: number;
  totalRefundOrders: number;
  totalAmount: number;
  totalRefundAmount: number;
  fromDate: string;
  toDate: string;
  totalVnPayAmount: number;
  totalCODAmount: number;
}
