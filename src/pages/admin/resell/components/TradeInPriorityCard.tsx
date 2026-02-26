import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flag, Calendar, Clock } from "lucide-react"
import { PRIORITY_CONFIG } from "../data"

interface TradeInPriorityCardProps {
    priority: "low" | "medium" | "high"
    createdAt: string
    updatedAt?: string
    delay?: number
}

export function TradeInPriorityCard({ priority, createdAt, updatedAt, delay = 0 }: TradeInPriorityCardProps) {
    const priorityConfig = PRIORITY_CONFIG[priority]
    const createdDate = new Date(createdAt)
    const updatedDate = updatedAt ? new Date(updatedAt) : null
    const now = new Date()
    const daysSinceCreated = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

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
                        Request Details
                    </h2>
                </div>

                <div className="space-y-4">
                    {/* Priority */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Flag className="h-4 w-4" />
                            <span className="text-sm">Priority</span>
                        </div>
                        <Badge
                            variant="secondary"
                            className={`${priorityConfig.bgColor} ${priorityConfig.color} font-medium`}
                        >
                            {priorityConfig.label}
                        </Badge>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">Created</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                                {createdDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>
                            <div className="text-xs text-gray-500">
                                {daysSinceCreated === 0 ? "Today" : `${daysSinceCreated} days ago`}
                            </div>
                        </div>
                    </div>

                    {/* Last Updated */}
                    {updatedDate && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">Updated</span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                                {updatedDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    )
}
