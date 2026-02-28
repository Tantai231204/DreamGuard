import { memo } from "react"
import { DollarSign, Truck, CreditCard, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "../../../../components/ui/card"

// Define outside component to prevent recreation
const BENEFITS = [
    {
        icon: DollarSign,
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
        title: "Giá thu mua tốt",
        description: "Lên đến 60% giá gốc",
    },
    {
        icon: Truck,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        title: "Đến tận nơi",
        description: "Miễn phí lấy hàng",
    },
    {
        icon: CreditCard,
        bgColor: "bg-amber-100",
        iconColor: "text-amber-600",
        title: "Thanh toán nhanh",
        description: "Trong 24h sau duyệt",
    },
    {
        icon: Shield,
        bgColor: "bg-purple-100",
        iconColor: "text-purple-600",
        title: "An toàn",
        description: "Giao dịch minh bạch",
    },
] as const

function BenefitsBanner() {
    return (
        <Card 
            className="border-[#bde8f5] bg-gradient-to-r from-[#f0f9ff] via-white to-[#f0f9ff] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            role="region"
            aria-label="Lợi ích khi thu mua"
        >
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#bde8f5]/50">
                    {BENEFITS.map((benefit, index) => {
                        const Icon = benefit.icon
                        return (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08, duration: 0.3 }}
                                className="p-4 flex items-center gap-3 hover:bg-blue-50/50 transition-colors duration-150 cursor-default group"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.2 }}
                                    className={`w-10 h-10 rounded-full ${benefit.bgColor} flex items-center justify-center group-hover:shadow-md transition-shadow duration-150`}
                                    aria-hidden="true"
                                >
                                    <Icon className={`h-5 w-5 ${benefit.iconColor}`} />
                                </motion.div>
                                <div>
                                    <p className="font-semibold text-gray-900">{benefit.title}</p>
                                    <p className="text-xs text-gray-500">{benefit.description}</p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

export default memo(BenefitsBanner)
