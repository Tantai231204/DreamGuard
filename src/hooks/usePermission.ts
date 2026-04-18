import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/lib/constants';
import { hasRole, isAdminRole, isManagerRole, isSellerRole } from '@/lib/role';

/**
 * usePermission - Hook for functional permission checks
 */
export function usePermission() {
  const role = useAuthStore(state => state.role);

  const is = useCallback((targetRole: UserRole) => 
    role?.toLowerCase() === targetRole.toLowerCase(), [role]);

  const can = useCallback((allowedRoles: UserRole[]) => {
    return hasRole(role, allowedRoles);
  }, [role]);

  return useMemo(() => ({
    role,
    is,
    can,
    isAdmin: isAdminRole(role),
    isManager: isManagerRole(role),
    isSeller: isSellerRole(role),
  }), [can, is, role]);
}
