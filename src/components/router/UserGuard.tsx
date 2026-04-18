import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { AppRoute } from "../../lib/constants";
import { isAnyStaff } from "../../lib/role";

/**
 * UserGuard component - Prevents staff users from accessing user-facing pages
 * Redirects staff users back to the admin dashboard
 */
export default function UserGuard() {
    const { isAuthenticated, role } = useAuthStore();

    const isStaff = isAnyStaff(role);

    if (isAuthenticated && isStaff) {
        return <Navigate to={AppRoute.ADMIN} replace state={{ from: AppRoute.HOME, reason: 'staff_restricted' }} />;
    }

    return <Outlet />;
}
