import { memo } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice } from '@/pages/profile/utils';

interface OrderStatsProps {
    total: number;
    revenue: number;
    pending: number;
    delivered: number;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const StatCard = memo(({
    title,
    value,
    icon: Icon,
    iconBg,
    trend,
    trendValue,
}: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    trend?: 'up' | 'down';
    trendValue?: string;
}) => (
    <motion.div
        variants={item}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all"
    >
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                    {value}
                </p>
                {trend && trendValue && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                        trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {trend === 'up' ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
            <div className={`h-12 w-12 rounded-lg ${iconBg} flex items-center justify-center`}>
                <Icon className="h-6 w-6 text-gray-700" />
            </div>
        </div>
    </motion.div>
));

StatCard.displayName = 'StatCard';

export const OrderStats = memo(({ total, revenue, pending, delivered }: OrderStatsProps) => {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
            <StatCard
                title="Total Orders"
                value={total}
                icon={Package}
                iconBg="bg-gray-100"
                trend="up"
                trendValue="+12.5%"
            />
            <StatCard
                title="Revenue"
                value={formatPrice(revenue)}
                icon={DollarSign}
                iconBg="bg-gray-100"
                trend="up"
                trendValue="+18.2%"
            />
            <StatCard
                title="Pending"
                value={pending}
                icon={Clock}
                iconBg="bg-amber-50"
                trend="down"
                trendValue="-5.3%"
            />
            <StatCard
                title="Delivered"
                value={delivered}
                icon={CheckCircle2}
                iconBg="bg-green-50"
                trend="up"
                trendValue="+23.1%"
            />
        </motion.div>
    );
});

OrderStats.displayName = 'OrderStats';
