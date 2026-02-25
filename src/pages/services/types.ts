import type { LucideIcon } from "lucide-react";

export type ServiceType =
  | "deep_clean"
  | "basic_clean"
  | "mattress_clean"
  | "stroller_clean"
  | "carseat_clean"
  | "toy_sanitize";

export type BookingFlow = "package" | "custom";

export interface ServiceCategory {
  type: ServiceType;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  lightBg: string;
  borderColor: string;
  priceFrom: string;
  image: string;
}

export interface ServiceItemOption {
  id: string;
  name: string;
  unitPrice: number;
  serviceType: ServiceType;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface PricingPackage {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  priceNote: string;
  description: string;
  features: string[];
  includes: string[];
  featured?: boolean;
  badge?: string;
}

export interface PackageBookingData {
  packageId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  scheduledDate: string;
  scheduledTime: string;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  notes: string;
}

export interface CustomBookingData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: ServiceType | "";
  items: { itemId: string; quantity: number }[];
  scheduledDate: string;
  scheduledTime: string;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  notes: string;
}
