import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { AppRoute } from "../../lib/constants";

/**
 * PrivateRoute component - Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 * Preserves the intended destination for redirect after login
 */
export default function PrivateRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        // Save the location user tried to access
        return <Navigate to={AppRoute.LOGIN} replace state={{ from: location, reason: 'unauthenticated' }} />;
    }

    return <Outlet />;
}