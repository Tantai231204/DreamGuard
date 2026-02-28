import type { LucideIcon } from "lucide-react";

export interface StepConfig {
  label: string;
  icon: LucideIcon;
}

export interface FormStepperProps {
  steps: readonly StepConfig[];
  currentStep: number;
}

export interface ImageUploaderProps {
  images: File[];
  previewUrls: string[];
  onImagesChange: (files: File[]) => void;
  onPreviewUrlsChange: (urls: string[]) => void;
  maxImages?: number;
}

export interface ContactFormProps {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  preferredDate: string;
  preferredTime: string;
  onFieldChange: <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => void;
  onAddressChange: (key: keyof ContactFormProps["address"], value: string) => void;
}

export type ContactFormData = Pick<
  ContactFormProps,
  "customerName" | "customerPhone" | "customerEmail" | "preferredDate" | "preferredTime"
>;

export interface ReviewSummaryProps {
  previewUrls: string[];
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  preferredDate: string;
  preferredTime: string;
}

export interface SuccessStateProps {
  contactInfo: string;
  onReset: () => void;
}
