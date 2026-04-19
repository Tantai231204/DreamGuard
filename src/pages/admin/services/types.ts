// Types for cleaning service management

export interface RatingInfo {
  ratingId: string;
  staffId: string;
  serviceOrderId: string;
  score: number;
  comment: string;
  createdAt: string;
  updatedAt?: string | null;
}

export type ServiceStatus =
  | 'pending'      // Chờ xác nhận
  | 'confirmed'    // Đã xác nhận
  | 'processing'   // Đang thực hiện (thay thế in_progress)
  | 'completed'    // Hoàn thành
  | 'cancelled'    // Khách hoặc Admin từ chối/hủy
  | 'rejected'     // Bị từ chối
  | 'refunded'
  | 'forcedcancelled'
  | 'rescheduled'; // Đã đổi lịch

export type ServiceType =
  | 'deep_clean'      // Vệ sinh sâu
  | 'basic_clean'     // Vệ sinh cơ bản
  | 'mattress_clean'  // Vệ sinh nệm
  | 'stroller_clean'  // Vệ sinh xe đẩy
  | 'carseat_clean'   // Vệ sinh ghế xe hơi
  | 'toy_sanitize';   // Khử khuẩn đồ chơi

export type PaymentStatus = string;

export interface ServiceBooking {
  id: string;
  orderCode?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: ServiceType;
  status: ServiceStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  subTotalPrice?: number;
  scheduledDate: string;
  scheduledTime: string;
  appointmentDate?: string;
  address: ServiceAddress;
  items: ServiceItem[];
  technician?: Staff | null; // Keep for backward compatibility or UI specific role, but API call it staff
  staff?: Staff | null;
  serviceTask?: ServiceTask | null;
  serviceTasks?: ServiceTask[] | null;
  imageUrl?: string[];
  totalPrice: number;
  notes?: string;
  rating?: number | RatingInfo | null;
  createdAt: string;
  updatedAt: string;
  soId?: string;
}

export interface ServiceAddress {
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface ServiceItem {
  id?: string;
  serviceOrderItemId?: string;
  servicePackageMappingId?: string;
  servicePackageName?: string;
  productTypeName?: string;
  name?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  image?: string;
}

export interface ServiceEvidence {
  seId: string;
  serviceTaskId: string;
  taskId?: string;    // Fallback
  imageUrl: string;
  imageURL?: string; // Fallback
  url?: string;      // Fallback
  photoUrl?: string; // Fallback from subagent
  evidenceType: string;
  description: string;
  createdAt: string;
  publicId: string;
}

export interface Staff {
  staffId: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  position?: string;
  role?: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  status?: string;
  averageRating?: number;
  totalRating?: number;
}

export interface ServiceTask {
  serviceTaskId: string;
  taskId?: string; // Fallback
  staffId: string;
  soId: string;
  status: string;
  checkIn?: string | null;
  checkInImage?: string | null;
  checkinImage?: string | null; // Alternative name from Dialog
  checkinUrl?: string | null;   // Alternative name from Dialog
  checkInUrl?: string | null;   // Inconsistent casing from API
  checkOut?: string | null;
  checkOutImage?: string | null;
  checkoutImage?: string | null; // Alternative name from Dialog
  checkoutUrl?: string | null;   // Alternative name from Dialog
  checkOutUrl?: string | null;  // Inconsistent casing from API
  staffNote?: string;
  createdAt?: string;
  staff?: Staff | null;
  evidences?: ServiceEvidence[]; // For ServiceOrder details refined later
}

export interface ServiceStats {
  totalBookings: number;
  pendingBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  totalRevenue: number;
  todayBookings: number;
}

export interface AdminSearchOrderServiceItem {
  soId: string;
  userVoucherId?: string | null;
  customerId?: string;
  orderCode?: string;
  customerNote?: string;
  receiverName?: string;
  address?: string;
  phoneNumber?: string;
  appointmentDate?: string;
  status?: string;
  totalPrice?: number;
  subTotalPrice?: number;
  createdAt?: string;
  updatedAt?: string | null;
  paymentMethod?: string;
  paymentStatus?: string;
  imageUrl?: string[];
  staff?: Staff | null;
  serviceTask?: ServiceTask | null;
  task?: ServiceTask | null;
  orderTask?: ServiceTask | null;
  serviceOrderTask?: ServiceTask | null;
  items?: ServiceItem[];
  orderDetails?: ServiceItem[];
  serviceOrderItems?: ServiceItem[];
  rating?: number | RatingInfo | null;
}

export interface PaginatedAdminSearchOrderServiceResponse {
  items: AdminSearchOrderServiceItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
