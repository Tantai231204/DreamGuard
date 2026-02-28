// Types for cleaning service management

export type ServiceStatus = 
  | 'pending'      // Chờ xác nhận
  | 'confirmed'    // Đã xác nhận
  | 'in_progress'  // Đang thực hiện
  | 'completed'    // Hoàn thành
  | 'cancelled';   // Đã hủy

export type ServiceType = 
  | 'deep_clean'      // Vệ sinh sâu
  | 'basic_clean'     // Vệ sinh cơ bản
  | 'mattress_clean'  // Vệ sinh nệm
  | 'stroller_clean'  // Vệ sinh xe đẩy
  | 'carseat_clean'   // Vệ sinh ghế xe hơi
  | 'toy_sanitize';   // Khử khuẩn đồ chơi

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface ServiceBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: ServiceType;
  status: ServiceStatus;
  paymentStatus: PaymentStatus;
  scheduledDate: string;
  scheduledTime: string;
  address: ServiceAddress;
  items: ServiceItem[];
  technician?: Technician;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAddress {
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  completedJobs: number;
}

export interface ServiceStats {
  totalBookings: number;
  pendingBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  totalRevenue: number;
  todayBookings: number;
}
