import type { LucideIcon } from 'lucide-react';
import type { Staff, ServiceBooking, ServiceEvidence } from '../../types';

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
  productType?: {
    productTypeId?: string;
    productTypeName?: string;
    isActive?: boolean;
    addPrice?: number;
    createdAt?: string;
  };
}

export interface ExtendedServiceItemDetail {
  id?: string;
  name?: string;
  packageName?: string;
  servicePackageName?: string;
  productTypeName?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  price?: number;
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
  serviceTaskId?: string;
  taskId?: string;
  staffId?: string;
  soId?: string;
  status?: string;
  staffNote?: string | null;
  checkIn?: string | null;
  checkInImage?: string | null;
  checkinImage?: string | null;
  checkinUrl?: string | null;
  checkInUrl?: string | null;
  checkOut?: string | null;
  checkOutImage?: string | null;
  checkoutImage?: string | null;
  checkoutUrl?: string | null;
  checkOutUrl?: string | null;
  staff?: Staff | null;
  evidences?: ServiceEvidence[];
}
