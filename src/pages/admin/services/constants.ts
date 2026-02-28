import { 
  Clock, 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  CalendarCheck,
  Sparkles,
  Bed,
  Car,
  Baby,
  Boxes,
  Brush
} from 'lucide-react';
import type { ServiceStatus, ServiceType, PaymentStatus } from './types';

// Status colors with gradient support
export const statusConfig: Record<ServiceStatus, { 
  bg: string; 
  text: string; 
  border: string;
  icon: typeof Clock;
  label: string;
}> = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
    label: 'Chờ xác nhận',
  },
  confirmed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: CalendarCheck,
    label: 'Đã xác nhận',
  },
  in_progress: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: Loader2,
    label: 'Đang thực hiện',
  },
  completed: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: CheckCircle2,
    label: 'Hoàn thành',
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: XCircle,
    label: 'Đã hủy',
  },
};

// Service type configuration
export const serviceTypeConfig: Record<ServiceType, {
  label: string;
  icon: typeof Sparkles;
  color: string;
  description: string;
}> = {
  deep_clean: {
    label: 'Vệ sinh sâu',
    icon: Sparkles,
    color: 'text-indigo-600',
    description: 'Vệ sinh toàn diện, khử khuẩn chuyên sâu',
  },
  basic_clean: {
    label: 'Vệ sinh cơ bản',
    icon: Brush,
    color: 'text-blue-600',
    description: 'Làm sạch bề mặt, khử mùi',
  },
  mattress_clean: {
    label: 'Vệ sinh nệm',
    icon: Bed,
    color: 'text-purple-600',
    description: 'Giặt nệm, diệt khuẩn, ve giường',
  },
  stroller_clean: {
    label: 'Vệ sinh xe đẩy',
    icon: Baby,
    color: 'text-pink-600',
    description: 'Vệ sinh xe đẩy em bé',
  },
  carseat_clean: {
    label: 'Vệ sinh ghế xe hơi',
    icon: Car,
    color: 'text-emerald-600',
    description: 'Vệ sinh ghế ngồi ô tô cho bé',
  },
  toy_sanitize: {
    label: 'Khử khuẩn đồ chơi',
    icon: Boxes,
    color: 'text-orange-600',
    description: 'Khử khuẩn an toàn cho bé',
  },
};

// Payment status config
export const paymentStatusConfig: Record<PaymentStatus, {
  label: string;
  bg: string;
  text: string;
}> = {
  unpaid: {
    label: 'Chưa thanh toán',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
  },
  paid: {
    label: 'Đã thanh toán',
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
};

// Filter options for service status
export const statusFilterOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'in_progress', label: 'Đang thực hiện' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

// Filter options for service type
export const serviceTypeFilterOptions = [
  { value: 'all', label: 'Tất cả dịch vụ' },
  { value: 'deep_clean', label: 'Vệ sinh sâu' },
  { value: 'basic_clean', label: 'Vệ sinh cơ bản' },
  { value: 'mattress_clean', label: 'Vệ sinh nệm' },
  { value: 'stroller_clean', label: 'Vệ sinh xe đẩy' },
  { value: 'carseat_clean', label: 'Vệ sinh ghế xe hơi' },
  { value: 'toy_sanitize', label: 'Khử khuẩn đồ chơi' },
];
