/**
 * Centralized role utilities — single source of truth for all RBAC checks.
 * Every function is case-insensitive to prevent casing mismatches between
 * the backend response and the frontend constants.
 */

function normalizeRole(role?: string | null): string {
  return String(role || '').trim().toLowerCase();
}

export function isAdminRole(role?: string | null): boolean {
  return normalizeRole(role) === 'admin';
}

export function isManagerRole(role?: string | null): boolean {
  return normalizeRole(role) === 'manager';
}

export function isSellerRole(role?: string | null): boolean {
  return normalizeRole(role) === 'seller';
}

/** Admin or Manager — used for product/service/inventory management gates */
export function isAdminOrManager(role?: string | null): boolean {
  const v = normalizeRole(role);
  return v === 'admin' || v === 'manager';
}

/** Any staff member (Admin, Manager, Seller) */
export function isAnyStaff(role?: string | null): boolean {
  const v = normalizeRole(role);
  return v === 'admin' || v === 'manager' || v === 'seller';
}

export function isCustomerRole(role?: string | null): boolean {
  const value = normalizeRole(role);
  return value === 'user' || value === 'customer';
}

/** Generic case-insensitive check: does `role` match any entry in `allowedRoles`? */
export function hasRole(role: string | null | undefined, allowedRoles: string[]): boolean {
  const v = normalizeRole(role);
  return !!v && allowedRoles.some(r => r.toLowerCase() === v);
}

/**
 * @deprecated Use `isAnyStaff` instead.
 * Kept for backward compatibility — will be removed in next major refactor.
 */
export function isStaffRole(role?: string | null): boolean {
  return isAnyStaff(role);
}
