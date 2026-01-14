import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { AppRoute } from "../../lib/constants";

export default function AdminRoute() {
    const { isAuthenticated, isAdmin } = useAuthStore();

    if (!isAuthenticated()) {
        return <Navigate to={AppRoute.LOGIN} replace />;
    }

    if (!isAdmin()) {
        return <Navigate to={AppRoute.HOME} replace />;
    }

    return <Outlet />;
}