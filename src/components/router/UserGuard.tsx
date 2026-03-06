import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { AppRoute } from "../../lib/constants";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * UserGuard component - Prevents admin users from accessing user-facing pages
 * Redirects admin users back to the admin dashboard
 */
export default function UserGuard() {
    const { isAuthenticated, role } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && role?.toLowerCase() === "admin") {
            toast.error("Access Restricted", {
                description: "Administrators are automatically redirected to the Management Dashboard.",
                duration: 4000,
            });
        }
    }, [isAuthenticated, role]);

    if (isAuthenticated && role?.toLowerCase() === "admin") {
        return <Navigate to={AppRoute.ADMIN} replace />;
    }

    return <Outlet />;
}
