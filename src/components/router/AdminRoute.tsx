import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { AppRoute, UserRole } from "../../lib/constants";

/**
 * AdminRoute component - Protects routes that require staff privileges
 * 1. Redirects to login if not authenticated
 * 2. Redirects to home if authenticated but not staff
 */
export default function AdminRoute() {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  const isStaff = role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.SELLER;

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={AppRoute.LOGIN} replace state={{ from: location, reason: 'unauthenticated' }} />;
  }

  // Check staff role
  if (!isStaff) {
    // Redirect to home if user is not a staff member
    return <Navigate to={AppRoute.HOME} replace state={{ from: location, reason: 'unauthorized' }} />;
  }

  return <Outlet />;
}
