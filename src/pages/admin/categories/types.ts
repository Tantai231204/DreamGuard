export type CategoryStatus = 'active' | 'inactive';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string | null;
  status: CategoryStatus;
  productCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
