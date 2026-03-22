import type { LucideIcon } from 'lucide-react';
import type { ServiceItemDetail } from '../ServiceDetailDialog';
import type { Staff, ServiceBooking } from '../../types';

export interface ServicePackageMappingResponse {
  servicePackageMappingId?: string;
  price?: number;
  duration?: number;
  servicePackage?: {
    imageUrl?: string;
    benefits?: string;
    packageName?: string;
    duration?: number;
    suitableFor?: string;
    serviceContent?: string;
  };
}

export interface ExtendedServiceItemDetail extends ServiceItemDetail {
  servicePackageMappingId?: string;
}

export type DetailOrder = ServiceBooking;

export interface StatusConfigItem {
  bg: string;
  text: string;
  border: string;
  icon: LucideIcon; 
  label: string;
}

export interface TaskDetail {
  status?: string;
  staffNote?: string;
  checkIn?: string | null;
  checkinImage?: string | null;
  checkinUrl?: string | null;
  checkOut?: string | null;
  checkoutImage?: string | null;
  checkoutUrl?: string | null;
  staff?: Staff | null;
}

