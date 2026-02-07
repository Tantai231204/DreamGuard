import { motion } from 'framer-motion';
import { LayoutDashboard, Users, ShoppingCart, DollarSign, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../components/layout/AdminPageHeader';
import { Card } from '../components/ui/card';

export default function Admin() {
    const stats = [
        {
            label: 'Total Revenue',
            value: '₫89,450,000',
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            lightBg: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            label: 'Total Orders',
            value: '567',
            change: '+8.2%',
            trend: 'up',
            icon: ShoppingCart,
            color: 'from-blue-500 to-blue-600',
            lightBg: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            label: 'Total Users',
            value: '1,234',
            change: '+5.4%',
            trend: 'up',
            icon: Users,
            color: 'from-purple-500 to-purple-600',
            lightBg: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
        {
            label: 'Products',
            value: '89',
            change: '+2.1%',
            trend: 'up',
            icon: Package,
            color: 'from-orange-500 to-orange-600',
            lightBg: 'bg-orange-50',
            textColor: 'text-orange-600',
        },
    ];

    const headerStats = [
        { label: 'Today Orders', value: 23 },
        { label: 'Pending', value: 12 },
        { label: 'Active Users', value: 156 },
    ];

    return (
        <div className="flex flex-col h-full">
            <AdminPageHeader
                title="Dashboard"
                description="Welcome back! Here's what's happening with your store today."
                stats={headerStats}
            />

            <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
                <div className="p-6 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${stat.lightBg}`}>
                                                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                                                </div>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${stat.lightBg} ${stat.textColor}`}>
                                                    <TrendingUp className="h-3 w-3" />
                                                    {stat.change}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                            </div>
                                        </div>
                                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border border-gray-200 shadow-sm">
                            <div className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Link
                                        to="/admin/orders"
                                        className="group flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:bg-blue-50/50 transition-all"
                                    >
                                        <div className="p-3 rounded-lg bg-blue-100 text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                                            <ShoppingCart className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">View Orders</p>
                                            <p className="text-sm text-gray-600">Manage all orders</p>
                                        </div>
                                        <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                                    </Link>

                                    <Link
                                        to="/admin/products"
                                        className="group flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:bg-blue-50/50 transition-all"
                                    >
                                        <div className="p-3 rounded-lg bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">Products</p>
                                            <p className="text-sm text-gray-600">Manage inventory</p>
                                        </div>
                                        <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                                    </Link>

                                    <Link
                                        to="/admin/chat"
                                        className="group flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:bg-blue-50/50 transition-all"
                                    >
                                        <div className="p-3 rounded-lg bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">Chat Support</p>
                                            <p className="text-sm text-gray-600">Help customers</p>
                                        </div>
                                        <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}