import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/lib/constants';

/**
 * usePermission - Hook for functional permission checks
 */
export function usePermission() {
  const role = useAuthStore(state => state.role);

  const is = useCallback((targetRole: UserRole) => role === targetRole, [role]);

  const can = useCallback((allowedRoles: UserRole[]) => {
    return role ? allowedRoles.includes(role as UserRole) : false;
  }, [role]);

  return useMemo(() => ({
    role,
    is,
    can,
    isAdmin: role === UserRole.ADMIN,
    isManager: role === UserRole.MANAGER,
    isSeller: role === UserRole.SELLER,
  }), [can, is, role]);
}
