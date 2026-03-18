import type { StaffResponse } from '@/api/types/staff.types';

export type StaffRole = 'admin' | 'manager' | 'staff' | 'support' | string;
export type StaffStatus = 'active' | 'inactive' | 'suspended';

export type Staff = StaffResponse;
