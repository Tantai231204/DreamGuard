export type SubmissionStatus = "idle" | "creating" | "uploading" | "finishing";

export interface BookingVoucher {
  userVoucherId: string;
  code: string;
  label: string;
  discountRatio: number;
  discountPct: number;
  maxDiscountAmount?: number;
}

export interface BookingState {
  step: number;
  direction: number;
  isSubmitting: boolean;
  isSuccess: boolean;
  shakeBtn: boolean;
  uploadedFiles: File[];
  paymentMethod: 'COD' | 'VNPAY';
  uploadProgress: number;
  submissionStatus: SubmissionStatus;
}
