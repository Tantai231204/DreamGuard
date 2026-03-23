export type SubmissionStatus = "idle" | "creating" | "uploading" | "finishing";

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
