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
