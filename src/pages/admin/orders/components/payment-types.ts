export type EvidenceStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

export interface EvidenceItem {
  id: string;
  file?: File;
  previewUrl: string;
  status: EvidenceStatus;
  progress: number;
}
