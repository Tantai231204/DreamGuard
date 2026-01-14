import { Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import PrivateRoute from "../components/router/PrivateRoute";
import AdminRoute from "../components/router/AdminRoute";
import Login from "../pages/Login";
import Profile from "../pages/Profile";
import Admin from "../pages/Admin";
import Home from "../pages/home";

// Pages


export default function AppRouter() {
    return (
        <Routes>
            {/* Public Routes - Home Layout */}
            <Route element={<AppLayout variant="home" />}>
                <Route path="/" element={<Home />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
            </Route>

            {/* Private Routes - Main Layout */}
            <Route element={<PrivateRoute />}>
                <Route element={<AppLayout variant="main" />}>
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Route>

            {/* Admin Routes - Main Layout */}
            <Route element={<AdminRoute />}>
                <Route element={<AppLayout variant="main" />}>
                    <Route path="/admin" element={<Admin />} />
                </Route>
            </Route>
        </Routes>
    );
}