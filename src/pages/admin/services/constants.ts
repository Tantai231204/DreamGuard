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
  Brush,
  Repeat,
  Banknote,
  CreditCard,
  Wallet
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
    label: 'Pending',
  },
  confirmed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: CalendarCheck,
    label: 'Confirmed',
  },
  processing: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Loader2,
    label: 'Processing',
  },
  completed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle,
    label: 'Cancelled',
  },
  rejected: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle,
    label: 'Rejected',
  },
  refunded: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Repeat,
    label: 'Refunded',
  },
  forcedcancelled: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle,
    label: 'Forced Cancelled',
  },
  rescheduled: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Repeat,
    label: 'Rescheduled',
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
    label: 'Deep Clean',
    icon: Sparkles,
    color: 'text-primary-600',
    description: 'Comprehensive deeper sterilization',
  },
  basic_clean: {
    label: 'Basic Clean',
    icon: Brush,
    color: 'text-blue-600',
    description: 'Surface cleanliness and deodorization',
  },
  mattress_clean: {
    label: 'Mattress Clean',
    icon: Bed,
    color: 'text-purple-600',
    description: 'Washing mattresses, killing bed bacteria',
  },
  stroller_clean: {
    label: 'Stroller Clean',
    icon: Baby,
    color: 'text-pink-600',
    description: 'Baby stroller cleaning',
  },
  carseat_clean: {
    label: 'Car Seat Clean',
    icon: Car,
    color: 'text-emerald-600',
    description: 'Baby car seat cleaning',
  },
  toy_sanitize: {
    label: 'Toy Sanitize',
    icon: Boxes,
    color: 'text-orange-600',
    description: 'Safe sanitization for babies',
  },
};

// Payment status config
export const paymentStatusConfig: Record<PaymentStatus, {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: typeof Clock;
}> = {
  unpaid: {
    label: 'Unpaid',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: Clock,
  },
  paid: {
    label: 'Paid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  pending_payment: {
    label: 'Pending Payment',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
  },
  'COD Paid': {
    label: 'COD Paid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  refunded: {
    label: 'Refunded',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Repeat,
  },
};

export const paymentMethodConfig: Record<string, {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: typeof CreditCard;
}> = {
  cash: {
    label: 'Cash',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: Banknote,
  },
  banking: {
    label: 'Banking',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    icon: CreditCard,
  },
  momo: {
    label: 'MoMo',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
    icon: Wallet,
  },
  vnpay: {
    label: 'VNPay',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: CreditCard,
  },
};

// Filter options for service status
export const statusFilterOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'forcedcancelled', label: 'Forced Cancelled' },
  { value: 'rejected', label: 'Rejected' },
];

// Filter options for service type
export const serviceTypeFilterOptions = [
  { value: 'all', label: 'All Services' },
  { value: 'deep_clean', label: 'Deep Clean' },
  { value: 'basic_clean', label: 'Basic Clean' },
  { value: 'mattress_clean', label: 'Mattress Clean' },
  { value: 'stroller_clean', label: 'Stroller Clean' },
  { value: 'carseat_clean', label: 'Car Seat Clean' },
  { value: 'toy_sanitize', label: 'Toy Sanitize' },
];
