import type { StaffResponse } from '@/api/types/staff.types';

export type StaffRole = 'Admin' | 'Manager' | 'Seller' | (string & {});

export type Staff = StaffResponse;
