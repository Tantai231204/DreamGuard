import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { AppRoute } from "../../lib/constants";

/**
 * AdminRoute component - Protects routes that require admin privileges
 * 1. Redirects to login if not authenticated
 * 2. Redirects to home if authenticated but not admin
 */
export default function AdminRoute() {
    const { isAuthenticated, isAdmin } = useAuthStore();
    const location = useLocation();

    // Check authentication first
    if (!isAuthenticated()) {
        return <Navigate to={AppRoute.LOGIN} replace state={{ from: location }} />;
    }

    // Check admin role
    if (!isAdmin()) {
        return <Navigate to={AppRoute.HOME} replace />;
    }

    return <Outlet />;
}