import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole, AppRoute } from '@/lib/constants';
import { hasRole } from '@/lib/role';


interface PermissionGuardProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  mode?: 'redirect' | 'hide';
}

/**
 * PermissionGuard - Protects UI components or routes based on UserRole.
 */
export function PermissionGuard({ 
  allowedRoles, 
  children, 
  fallback, 
  mode = 'redirect' 
}: PermissionGuardProps) {
  const { role } = useAuthStore();
  const location = useLocation();

  const hasPermission = hasRole(role, allowedRoles as string[]);

  if (!hasPermission) {
    if (mode === 'hide') {
      return <>{fallback || null}</>;
    }
    
    return <Navigate to={AppRoute.ADMIN} replace state={{ from: location, reason: 'unauthorized' }} />;
  }

  // If used as a Route element wrapper (<Route element={<PermissionGuard ... />} />), use Outlet
  return <>{children || <Outlet />}</>;
}
