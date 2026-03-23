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
const Combos = lazy(() => import("../pages/combos"));
const ComboDetail = lazy(() => import("../pages/combos/[slug]"));
const CartPage = lazy(() => import("../pages/cart"));
const CheckoutPage = lazy(() => import("../pages/checkout"));
const CheckoutResult = lazy(() => import("../pages/checkout/CheckoutResult"));

// Auth
const Login = lazy(() => import("../pages/auth/Login"));
const RegisterBasic = lazy(() => import("../pages/auth/RegisterBasic"));
const VerifyRegisterOTP = lazy(() => import("../pages/auth/VerifyRegisterOTP"));
const RegisterComplete = lazy(() => import("../pages/auth/RegisterComplete"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPasswordOTP = lazy(() => import("../pages/auth/ResetPasswordOTP"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const ResetPasswordSuccess = lazy(() => import("../pages/auth/ResetPasswordSuccess"));

// User
const Profile = lazy(() => import("../pages/profile"));
const Services = lazy(() => import("../pages/services"));
const ServicesBooking = lazy(() => import("../pages/services/Booking"));
const ServicesCustomize = lazy(() => import("../pages/services/customize"));

// Admin
const AdminDashboard = lazy(() => import("../pages/admin/dashboard"));
const OrderManagement = lazy(() => import("../pages/admin/orders"));
const OrderDetail = lazy(() => import("../pages/admin/orders/[id]"));
const ServiceManagement = lazy(() => import("../pages/admin/services"));
const ServiceDetail = lazy(() => import("../pages/admin/services/[id].tsx"));
const ServicePackagesPage = lazy(() => import("../pages/admin/service-packages"));
const ChatAdmin = lazy(() => import("../pages/admin/chat"));
const ProductManagement = lazy(() => import("../pages/admin/products"));
const AdminProductDetail = lazy(() => import("../pages/admin/products/[id]"));
const ProductTypeManagement = lazy(() => import("../pages/admin/product-types"));
const CategoryManagement = lazy(() => import("../pages/admin/categories"));
const VoucherManagement = lazy(() => import("../pages/admin/vouchers"));
const UserManagement = lazy(() => import("../pages/admin/users"));
const StaffManagement = lazy(() => import("../pages/admin/staff"));
const PaymentManagement = lazy(() => import("../pages/admin/payments"));

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
                        <Route path={AppRoute.COMBOS} element={<Combos />} />
                        <Route path={AppRoute.COMBO_DETAIL} element={<ComboDetail />} />
                        <Route path={AppRoute.SERVICES} element={<Services />} />
                        <Route path={AppRoute.CART} element={<CartPage />} />
                    </Route>


                    <Route element={<AuthLayout />}>
                        <Route path={AppRoute.LOGIN} element={<Login />} />
                        <Route path={AppRoute.REGISTER} element={<RegisterBasic />} />
                        {/* <Route path={AppRoute.REGISTER_BASIC} element={<RegisterBasic />} /> */}
                        <Route path={AppRoute.VERIFY_REGISTER_OTP} element={<VerifyRegisterOTP />} />
                        <Route path={AppRoute.REGISTER_COMPLETE} element={<RegisterComplete />} />
                        <Route path={AppRoute.FORGOT_PASSWORD} element={<ForgotPassword />} />
                        <Route path={AppRoute.RESET_PASSWORD_OTP} element={<ResetPasswordOTP />} />
                        <Route path={AppRoute.RESET_PASSWORD} element={<ResetPassword />} />
                        <Route
                            path={AppRoute.RESET_PASSWORD_SUCCESS}
                            element={<ResetPasswordSuccess />}
                        />
                    </Route>

                    {/* Private User Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route path={AppRoute.SERVICES_BOOKING} element={<ServicesBooking />} />
                        <Route path={AppRoute.SERVICES_CUSTOMIZE} element={<ServicesCustomize />} />
                        <Route element={<AppLayout variant="home" />}>
                            <Route path={AppRoute.PROFILE} element={<Profile />} />
                        </Route>
                        <Route element={<AppLayout variant="checkout" />}>
                            <Route path={AppRoute.CHECKOUT} element={<CheckoutPage />} />
                            <Route path={AppRoute.CHECKOUT_RESULT} element={<CheckoutResult />} />
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
                        <Route path="/admin/services/:id" element={<ServiceDetail />} />
                        <Route path="/admin/service-packages" element={<ServicePackagesPage />} />
                        <Route path="/admin/chat" element={<ChatAdmin />} />
                        <Route path="/admin/products" element={<ProductManagement />} />
                        <Route path="/admin/products/:id" element={<AdminProductDetail />} />
                        <Route path={AppRoute.ADMIN_PRODUCT_TYPES} element={<ProductTypeManagement />} />
                        <Route path="/admin/categories" element={<CategoryManagement />} />
                        <Route path="/admin/vouchers" element={<VoucherManagement />} />
                        <Route path="/admin/users" element={<UserManagement />} />
                        <Route path="/admin/staff" element={<StaffManagement />} />
                        <Route path="/admin/payments" element={<PaymentManagement />} />
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
