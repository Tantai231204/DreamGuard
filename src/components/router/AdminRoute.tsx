import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { AppRoute } from "../../lib/constants";

export default function AdminRoute() {
  const { isAuthenticated, role } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    role: s.role,
  }));

  if (!isAuthenticated) {
    return <Navigate to={AppRoute.LOGIN} replace />;
  }

  if (role !== "Admin") {
    return <Navigate to={AppRoute.HOME} replace />;
  }

  return <Outlet />;
}