import { motion } from 'framer-motion'
import { TrendingUp, CreditCard, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/pages/profile/utils'

interface PaymentStatsProps {
    totalRevenue: number
    pendingAmount: number
    failedCount: number
}

export function PaymentStats({ totalRevenue, pendingAmount, failedCount }: PaymentStatsProps) {
    return (
        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                label="Verified Revenue"
                value={formatPrice(totalRevenue)}
                icon={TrendingUp}
                color="text-emerald-600"
                delay={0}
            />
            <StatCard
                label="Pending Processing"
                value={formatPrice(pendingAmount)}
                icon={CreditCard}
                color="text-amber-600"
                delay={0.1}
            />
            <StatCard
                label="Failed Issues"
                value={`${failedCount} Requests`}
                icon={AlertCircle}
                color="text-rose-600"
                delay={0.2}
            />
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color, delay }: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-5 group hover:shadow-lg transition-all"
        >
            <div className={`h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center ${color} group-hover:scale-110 transition-transform shadow-inner`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
                <div className="text-xl font-bold text-slate-900 tracking-tight">{value}</div>
            </div>
        </motion.div>
    )
}
