import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import PrivateRoute from "../components/router/PrivateRoute";
import AdminRoute from "../components/router/AdminRoute";
import { AppRoute } from "../lib/constants";

// Lazy load pages for better performance
const Home = lazy(() => import("../pages/home"));
const Products = lazy(() => import("../pages/products"));
const ProductDetail = lazy(() => import("../pages/products/[id]"));
const CartPage = lazy(() => import("../pages/cart"));
const CheckoutPage = lazy(() => import("../pages/checkout"));

// Auth pages
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const VerifyOTP = lazy(() => import("../pages/auth/VerifyOTP"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const ResetPasswordSuccess = lazy(() => import("../pages/auth/ResetPasswordSuccess"));

// User pages
const Profile = lazy(() => import("../pages/profile/index"));

// Admin pages
const Admin = lazy(() => import("../pages/Admin"));

// Loading component
const LoadingFallback = () => (
    <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4988c4] border-t-transparent" />
    </div>
);

export default function AppRouter() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Public Routes - Home Layout */}
                <Route element={<AppLayout variant="home" />}>
                    <Route path={AppRoute.HOME} element={<Home />} />
                    <Route path={AppRoute.PRODUCTS} element={<Products />} />
                    <Route path={AppRoute.PRODUCT_DETAIL} element={<ProductDetail />} />
                    <Route path={AppRoute.CART} element={<CartPage />} />
                </Route>

                {/* Auth Routes - No Layout */}
                <Route element={<AuthLayout />}>
                    <Route path={AppRoute.LOGIN} element={<Login />} />
                    <Route path={AppRoute.REGISTER} element={<Register />} />
                    <Route path={AppRoute.FORGOT_PASSWORD} element={<ForgotPassword />} />
                    <Route path={AppRoute.VERIFY_OTP} element={<VerifyOTP />} />
                    <Route path={AppRoute.RESET_PASSWORD} element={<ResetPassword />} />
                    <Route path={AppRoute.RESET_PASSWORD_SUCCESS} element={<ResetPasswordSuccess />} />
                </Route>

                {/* Private Routes - Requires Authentication */}
                <Route element={<PrivateRoute />}>
                    <Route element={<AppLayout variant="home" />}>
                        <Route path={AppRoute.PROFILE} element={<Profile />} />
                        <Route path={AppRoute.CHECKOUT} element={<CheckoutPage />} />
                    </Route>
                </Route>

                {/* Admin Routes - Requires Admin Role */}
                <Route element={<AdminRoute />}>
                    <Route element={<AppLayout variant="main" />}>
                        <Route path={AppRoute.ADMIN} element={<Admin />} />
                    </Route>
                </Route>

                {/* 404 Not Found */}
                <Route 
                    path={AppRoute.NOT_FOUND} 
                    element={
                        <div className="flex h-screen flex-col items-center justify-center">
                            <h1 className="text-6xl font-bold text-gray-900">404</h1>
                            <p className="mt-4 text-xl text-gray-600">Page not found</p>
                            <a href={AppRoute.HOME} className="mt-6 text-[#4988c4] hover:underline">
                                Go back home
                            </a>
                        </div>
                    } 
                />
            </Routes>
        </Suspense>
    );
}