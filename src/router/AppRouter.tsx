import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";

import PrivateRoute from "../components/router/PrivateRoute";
import AdminRoute from "../components/router/AdminRoute";
import UserGuard from "../components/router/UserGuard";
import { PageLoader } from "../components/common";

import { AppRoute } from "../lib/constants";

/* =======================
   Lazy loaded pages
======================= */

// Public
const Home = lazy(() => import("../pages/home"));
const Products = lazy(() => import("../pages/products"));
const ProductDetail = lazy(() => import("../pages/products/[slug]"));
const CartPage = lazy(() => import("../pages/cart"));
const CheckoutPage = lazy(() => import("../pages/checkout"));

// Auth
const Login = lazy(() => import("../pages/auth/Login"));
// const Register = lazy(() => import("../pages/auth/Register"));
const RegisterBasic = lazy(() => import("../pages/auth/RegisterBasic"));
const VerifyRegisterOTP = lazy(() => import("../pages/auth/VerifyRegisterOTP"));
const RegisterComplete = lazy(() => import("../pages/auth/RegisterComplete"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const VerifyOTP = lazy(() => import("../pages/auth/VerifyOTP"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const ResetPasswordSuccess = lazy(() => import("../pages/auth/ResetPasswordSuccess"));

// User
const Profile = lazy(() => import("../pages/profile"));
const Services = lazy(() => import("../pages/services"));

// Admin
const AdminDashboard = lazy(() => import("../pages/admin/dashboard"));
const OrderManagement = lazy(() => import("../pages/admin/orders"));
const OrderDetail = lazy(() => import("../pages/admin/orders/[id]"));
const ServiceManagement = lazy(() => import("../pages/admin/services"));
const ChatAdmin = lazy(() => import("../pages/admin/chat"));
const ProductManagement = lazy(() => import("../pages/admin/products"));
const AdminProductDetail = lazy(() => import("../pages/admin/products/[id]"));
const CategoryManagement = lazy(() => import("../pages/admin/categories"));
const VoucherManagement = lazy(() => import("../pages/admin/vouchers"));
const ResellManagement = lazy(() => import("../pages/admin/resell"));
const TradeInDetail = lazy(() => import("../pages/admin/resell/[id]"));
const UserManagement = lazy(() => import("../pages/admin/users"));

/* =======================
   Router
======================= */
export default function AppRouter() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>

                {/* ===== Public & Auth Routes (Restricted for Admins) ===== */}
                <Route element={<UserGuard />}>
                    {/* Public Routes */}
                    <Route element={<AppLayout variant="home" />}>
                        <Route path={AppRoute.HOME} element={<Home />} />
                        <Route path={AppRoute.PRODUCTS} element={<Products />} />
                        <Route path={AppRoute.PRODUCT_DETAIL} element={<ProductDetail />} />
                        <Route path={AppRoute.SERVICES} element={<Services />} />
                        <Route path={AppRoute.CART} element={<CartPage />} />
                    </Route>

                    <Route element={<AuthLayout />}>
                        <Route path={AppRoute.LOGIN} element={<Login />} />
                        <Route path={AppRoute.REGISTER} element={<RegisterBasic />} />
                        <Route path={AppRoute.REGISTER_BASIC} element={<RegisterBasic />} />
                        <Route path="/verify-register-otp" element={<VerifyRegisterOTP />} />
                        <Route path={AppRoute.REGISTER_COMPLETE} element={<RegisterComplete />} />
                        <Route path={AppRoute.FORGOT_PASSWORD} element={<ForgotPassword />} />
                        <Route path={AppRoute.VERIFY_OTP} element={<VerifyOTP />} />
                        <Route path={AppRoute.RESET_PASSWORD} element={<ResetPassword />} />
                        <Route
                            path={AppRoute.RESET_PASSWORD_SUCCESS}
                            element={<ResetPasswordSuccess />}
                        />
                    </Route>

                    {/* Private User Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<AppLayout variant="home" />}>
                            <Route path={AppRoute.PROFILE} element={<Profile />} />
                            <Route path={AppRoute.CHECKOUT} element={<CheckoutPage />} />
                        </Route>
                    </Route>
                </Route>

                {/* ===== Admin Routes ===== */}
                <Route element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path={AppRoute.ADMIN} element={<AdminDashboard />} />
                        <Route path="/admin/orders" element={<OrderManagement />} />
                        <Route path="/admin/orders/:id" element={<OrderDetail />} />
                        <Route path="/admin/services" element={<ServiceManagement />} />
                        <Route path="/admin/chat" element={<ChatAdmin />} />
                        <Route path="/admin/products" element={<ProductManagement />} />
                        <Route path="/admin/products/:id" element={<AdminProductDetail />} />
                        <Route path="/admin/categories" element={<CategoryManagement />} />
                        <Route path="/admin/vouchers" element={<VoucherManagement />} />
                        <Route path="/admin/resell" element={<ResellManagement />} />
                        <Route path="/admin/resell/:id" element={<TradeInDetail />} />
                        <Route path="/admin/users" element={<UserManagement />} />
                    </Route>
                </Route>

                {/* ===== 404 ===== */}
                <Route
                    path={AppRoute.NOT_FOUND}
                    element={
                        <div className="flex h-screen flex-col items-center justify-center">
                            <h1 className="text-6xl font-bold text-gray-900">404</h1>
                            <p className="mt-4 text-xl text-gray-600">Page not found</p>
                            <a
                                href={AppRoute.HOME}
                                className="mt-6 text-[#4988c4] hover:underline"
                            >
                                Go back home
                            </a>
                        </div>
                    }
                />

            </Routes>
        </Suspense>
    );
}
