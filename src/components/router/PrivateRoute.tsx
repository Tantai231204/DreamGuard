import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { AppRoute } from "../../lib/constants";

export default function PrivateRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

    return isAuthenticated ? <Outlet /> : <Navigate to={AppRoute.LOGIN} replace />;
}