import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone } from "lucide-react"
import type { CustomerInfo } from "../types"

interface TradeInCustomerCardProps {
    customer: CustomerInfo
    delay?: number
}

export function TradeInCustomerCard({ customer, delay = 0 }: TradeInCustomerCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="p-5 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full"></div>
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Customer Info
                    </h2>
                </div>

                {/* Customer Avatar & Name */}
                <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-gray-200">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                            {customer.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500">ID: {customer.id}</div>
                    </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs text-gray-500">Email</div>
                            <div className="text-sm text-gray-700 break-all">{customer.email}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                            <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Phone</div>
                            <div className="text-sm text-gray-700">{customer.phone}</div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
