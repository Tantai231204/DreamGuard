import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/lib/constants';

/**
 * usePermission - Hook for functional permission checks
 */
export function usePermission() {
  const { role } = useAuthStore();
  
  const check = (allowedRoles: UserRole[]) => {
    return role ? allowedRoles.includes(role as UserRole) : false;
  };

  return {
    role,
    is: (r: UserRole) => role === r,
    can: check,
    isAdmin: role === UserRole.ADMIN,
    isManager: role === UserRole.MANAGER,
    isSeller: role === UserRole.SELLER,
  };
}
