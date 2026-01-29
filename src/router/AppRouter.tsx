import { Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import PrivateRoute from "../components/router/PrivateRoute";
import AdminRoute from "../components/router/AdminRoute";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ResetPassword from "../pages/auth/ResetPassword";
import ResetPasswordSuccess from "../pages/auth/ResetPasswordSuccess";
import Profile from "../pages/profile/index";
import Admin from "../pages/Admin";
import Home from "../pages/home";
import Products from "../pages/products";

export default function AppRouter() {
    return (
        <Routes>
            {/* Public Routes - Home Layout */}
            <Route element={<AppLayout variant="home" />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password-success" element={<ResetPasswordSuccess />} />
            </Route>

            {/* Private Routes - Home Layout with Header/Footer */}
            <Route element={<PrivateRoute />}>
                <Route element={<AppLayout variant="home" />}>
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