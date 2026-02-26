import { motion } from "framer-motion"
import { CheckCircle2, Clock, Package, XCircle, Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { TradeInStatus } from "../types"

interface TimelineEvent {
    status: TradeInStatus | "created"
    title: string
    description?: string
    timestamp: string
    isActive?: boolean
}

interface TradeInTimelineProps {
    currentStatus: TradeInStatus
    createdAt: string
    updatedAt?: string
    completedAt?: string
}

const STATUS_ICONS = {
    created: Package,
    pending: Clock,
    reviewing: Eye,
    approved: CheckCircle2,
    completed: CheckCircle2,
    rejected: XCircle,
}

const STATUS_TITLES = {
    created: "Request Created",
    pending: "Pending Review",
    reviewing: "Under Review",
    approved: "Approved",
    completed: "Completed",
    rejected: "Rejected",
}

export function TradeInTimeline({ currentStatus, createdAt, updatedAt, completedAt }: TradeInTimelineProps) {
    // Build timeline events based on status
    const events: TimelineEvent[] = []

    // Always show created
    events.push({
        status: "created",
        title: STATUS_TITLES.created,
        description: "Customer submitted trade-in request",
        timestamp: createdAt,
    })

    // Show pending if status is pending or beyond
    if (["pending", "reviewing", "approved", "completed", "rejected"].includes(currentStatus)) {
        events.push({
            status: "pending",
            title: STATUS_TITLES.pending,
            description: "Waiting for staff to review items",
            timestamp: createdAt,
            isActive: currentStatus === "pending",
        })
    }

    // Show reviewing if reached
    if (["reviewing", "approved", "completed", "rejected"].includes(currentStatus)) {
        events.push({
            status: "reviewing",
            title: STATUS_TITLES.reviewing,
            description: "Staff is evaluating item conditions and pricing",
            timestamp: updatedAt || createdAt,
            isActive: currentStatus === "reviewing",
        })
    }

    // Show approved or rejected
    if (currentStatus === "approved" || currentStatus === "completed") {
        events.push({
            status: "approved",
            title: STATUS_TITLES.approved,
            description: "Trade-in request has been approved",
            timestamp: updatedAt || createdAt,
            isActive: currentStatus === "approved",
        })
    }

    if (currentStatus === "rejected") {
        events.push({
            status: "rejected",
            title: STATUS_TITLES.rejected,
            description: "Trade-in request was rejected",
            timestamp: updatedAt || createdAt,
            isActive: true,
        })
    }

    // Show completed
    if (currentStatus === "completed") {
        events.push({
            status: "completed",
            title: STATUS_TITLES.completed,
            description: "Trade-in process completed successfully",
            timestamp: completedAt || updatedAt || createdAt,
            isActive: true,
        })
    }

    // Reverse to show latest first
    const reversedEvents = [...events].reverse()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="p-6 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                        Request Timeline
                    </h2>
                </div>
                <div className="space-y-5">
                    {reversedEvents.map((event, index) => {
                        const Icon = STATUS_ICONS[event.status]
                        const isLatest = index === 0

                        return (
                            <div key={event.status + index} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm ${
                                            isLatest
                                                ? event.status === "rejected"
                                                    ? "bg-gradient-to-br from-red-500 to-red-600 text-white"
                                                    : event.status === "completed"
                                                    ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                                                    : "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white"
                                                : "bg-gray-100 text-gray-400"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    {index < reversedEvents.length - 1 && (
                                        <div className="w-px h-12 bg-gray-200 mt-2" />
                                    )}
                                </div>
                                <div className="flex-1 pb-1">
                                    <div className={`font-medium ${isLatest ? "text-gray-900" : "text-gray-600"}`}>
                                        {event.title}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />
                                        {new Date(event.timestamp).toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                    {event.description && (
                                        <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                                            {event.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </motion.div>
    )
}
