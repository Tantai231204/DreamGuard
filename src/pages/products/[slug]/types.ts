import type { LucideIcon } from "lucide-react";

export interface ColorOption {
  value: string;
  label: string;
  color: string;
}

export interface SizeOption {
  value: string;
  label: string;
  description: string;
}

export interface SafetyCertification {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

export interface ProductBenefit {
  icon: LucideIcon;
  label: string;
  description: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  verified: boolean;
}

export type TabType = "description" | "specs" | "reviews";
