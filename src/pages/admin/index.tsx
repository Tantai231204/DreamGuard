import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Package,
    MessageSquare,
    Users,
    DollarSign,
    TrendingUp,
    ShoppingCart,
    ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { mockOrders } from './data';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Admin() {
    const role = useAuthStore((state) => state.role);

    // Calculate stats from mock data
    const stats = {
        totalOrders: mockOrders.length,
        revenue: mockOrders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: mockOrders.filter(o => o.status === 'pending').length,
        customers: new Set(mockOrders.map(o => o.email)).size,
    };

    const recentOrders = mockOrders.slice(0, 5);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-50/50 via-white to-blue-50/50">
            {/* Header */}
            <div className="flex-shrink-0 p-6 pb-4">
                <AdminPageHeader
                    title="Dashboard"
                    description={role === 'admin' ? 'Manage your store and orders' : 'System management overview'}
                    actions={
                        <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm border-green-200">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                System Online
                            </div>
                        </Badge>
                    }
                    stats={[
                        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart },
                        { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign },
                        { label: 'Pending', value: stats.pendingOrders, icon: Package },
                        { label: 'Customers', value: stats.customers, icon: Users },
                    ]}
                />
            </div>

            {/* Content */}
            <div className="flex-1 px-6 pb-6 overflow-y-auto">
                {/* Stats Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
                >
                <motion.div variants={item}>
                    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1 font-medium">Total Orders</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.totalOrders}</p>
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    +12% from last month
                                </p>
                            </div>
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <Package className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1 font-medium">Revenue</p>
                                <p className="text-4xl font-bold text-gray-900">${stats.revenue.toFixed(2)}</p>
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    +18% from last month
                                </p>
                            </div>
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                                <DollarSign className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1 font-medium">Pending Orders</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.pendingOrders}</p>
                                <p className="text-xs text-orange-600 mt-2 font-medium">
                                    Needs attention
                                </p>
                            </div>
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                                <ShoppingCart className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1 font-medium">Customers</p>
                                <p className="text-4xl font-bold text-gray-900">{stats.customers}</p>
                                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    +8% from last month
                                </p>
                            </div>
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <Link to="/admin/orders">
                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="p-6 hover:shadow-2xl transition-all cursor-pointer group border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-white to-blue-50">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                    <Package className="h-7 w-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900">Order Management</h3>
                                    <p className="text-sm text-gray-500">View and manage orders</p>
                                </div>
                                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                            </div>
                        </Card>
                    </motion.div>
                </Link>

                <Link to="/admin/chat">
                    <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="p-6 hover:shadow-2xl transition-all cursor-pointer group border-2 border-transparent hover:border-green-500 bg-gradient-to-br from-white to-green-50 relative">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                    <MessageSquare className="h-7 w-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900">Admin Chat</h3>
                                    <p className="text-sm text-gray-500">Customer support</p>
                                </div>
                                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-2 transition-all" />
                            </div>
                            <Badge className="absolute top-4 right-4 bg-red-500 text-white">3</Badge>
                        </Card>
                    </motion.div>
                </Link>

                <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card className="p-6 hover:shadow-2xl transition-all cursor-not-allowed group border-2 border-transparent bg-gradient-to-br from-white to-purple-50 opacity-60">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <TrendingUp className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">Reports & Analytics</h3>
                                <p className="text-sm text-gray-500">Coming soon</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card className="p-8 shadow-xl border-t-4 border-t-[var(--color-primary)]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
                            <p className="text-sm text-gray-500 mt-1">Latest customer orders</p>
                        </div>
                        <Link to="/admin/orders">
                            <Button variant="outline" size="sm" className="hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentOrders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                            >
                                <Link
                                    to={`/admin/orders/${order.id}`}
                                    className="flex items-center justify-between p-5 rounded-xl border-2 border-gray-100 hover:border-[var(--color-primary)] hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
                                            {order.customerName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                                {order.customerName}
                                            </div>
                                            <div className="text-sm text-gray-500">{order.products}</div>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div>
                                            <div className="font-bold text-lg text-gray-900">${order.total.toFixed(2)}</div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(order.date).toLocaleDateString('en-US')}
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </Card>
                </motion.div>
            </div>
        </div>
    );
}