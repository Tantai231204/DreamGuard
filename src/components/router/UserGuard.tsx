import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { AppRoute } from "../../lib/constants";

/**
 * UserGuard component - Prevents admin users from accessing user-facing pages
 * Redirects admin users back to the admin dashboard
 */
export default function UserGuard() {
    const { isAuthenticated, role } = useAuthStore();

    if (isAuthenticated && role?.toLowerCase() === "admin") {
        return <Navigate to={AppRoute.ADMIN} replace state={{ from: AppRoute.HOME, reason: 'admin_restricted' }} />;
    }

    return <Outlet />;
}
