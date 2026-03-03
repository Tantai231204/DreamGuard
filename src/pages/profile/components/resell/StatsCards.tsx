import { memo, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "../../../../components/ui/card"
import { TrendingUp, Clock, Eye, CheckCircle2, DollarSign } from "lucide-react"
import { formatPrice } from "../../utils"
import type { TradeInStats } from "./types"

interface StatsCardsProps {
    stats: TradeInStats
}

// Define outside component to prevent recreation
const STAT_ITEMS = [
    { key: "total", label: "Tổng yêu cầu", color: "text-gray-900", icon: TrendingUp, gradient: "from-gray-50 to-gray-100" },
    { key: "pending", label: "Đang chờ", color: "text-amber-600", icon: Clock, gradient: "from-amber-50 to-amber-100" },
    { key: "reviewing", label: "Đang đánh giá", color: "text-blue-600", icon: Eye, gradient: "from-blue-50 to-blue-100" },
    { key: "completed", label: "Hoàn thành", color: "text-green-600", icon: CheckCircle2, gradient: "from-green-50 to-green-100" },
] as const

// Memoized stat card component
const StatCard = memo(function StatCard({
    item,
    value,
    index,
}: {
    item: typeof STAT_ITEMS[number]
    value: number
    index: number
}) {
    const Icon = item.icon
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            whileHover={{ y: -2 }}
        >
            <Card 
                className={`hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br ${item.gradient} border-none`}
                role="status"
                aria-label={`${item.label}: ${value}`}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Icon className={`h-5 w-5 ${item.color}`} aria-hidden="true" />
                        <motion.span
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.08 + 0.15, type: "spring", stiffness: 200 }}
                            className={`text-3xl font-bold ${item.color} tabular-nums`}
                        >
                            {value}
                        </motion.span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{item.label}</p>
                </CardContent>
            </Card>
        </motion.div>
    )
})

function StatsCards({ stats }: StatsCardsProps) {
    // Memoize formatted price to prevent recalculation
    const formattedEarned = useMemo(() => formatPrice(stats.totalEarned), [stats.totalEarned])

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4" role="region" aria-label="Thống kê yêu cầu thu mua">
            {STAT_ITEMS.map((item, index) => (
                <StatCard
                    key={item.key}
                    item={item}
                    value={stats[item.key as keyof typeof stats] as number}
                    index={index}
                />
            ))}
            
            {/* Total Earned Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.3 }}
                whileHover={{ y: -2 }}
            >
                <Card 
                    className="bg-gradient-to-br from-[#4988c4] via-[#3a73a8] to-[#2d5a85] text-white hover:shadow-xl transition-all duration-200 cursor-pointer border-none overflow-hidden relative h-full"
                    role="status"
                    aria-label={`Tổng đã nhận: ${formattedEarned}`}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none" />
                    <CardContent className="p-4 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="h-5 w-5" aria-hidden="true" />
                            <motion.p
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                className="text-2xl font-bold tabular-nums"
                            >
                                {formattedEarned}
                            </motion.p>
                        </div>
                        <p className="text-sm text-white/90 font-medium">Tổng đã nhận</p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

export default memo(StatsCards)
