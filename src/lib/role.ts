function normalizeRole(role?: string | null): string {
  return String(role || '').trim().toLowerCase();
}

export function isAdminRole(role?: string | null): boolean {
  return normalizeRole(role) === 'admin';
}

export function isCustomerRole(role?: string | null): boolean {
  const value = normalizeRole(role);
  return value === 'user' || value === 'customer';
}

export function isStaffRole(role?: string | null): boolean {
  const value = normalizeRole(role);
  return !!value && value !== 'admin' && value !== 'user' && value !== 'customer';
}
