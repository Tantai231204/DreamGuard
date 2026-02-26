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
        <Card className="p-5 border rounded-lg">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded bg-blue-600">
                    <Clock className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">
                    Request Timeline
                </h2>
            </div>
            <div className="space-y-6">
                {reversedEvents.map((event, index) => {
                    const Icon = STATUS_ICONS[event.status]
                    const isLatest = index === 0

                    return (
                        <div
                            key={event.status + index}
                            className="flex gap-4"
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isLatest
                                        ? event.status === "rejected"
                                            ? "bg-red-500 text-white border-red-200"
                                            : event.status === "completed"
                                                ? "bg-green-500 text-white border-green-200"
                                                : "bg-blue-500 text-white border-blue-200"
                                        : "bg-gray-100 text-gray-500 border-gray-200"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                {index < reversedEvents.length - 1 && (
                                    <div className="w-0.5 h-12 bg-gray-300 mt-2 rounded-full" />
                                )}
                            </div>
                            <div className="flex-1 pb-2">
                                <div className={`font-semibold text-sm ${isLatest ? "text-gray-900" : "text-gray-600"}`}>
                                    {event.title}
                                    {isLatest && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-semibold">
                                            Current
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(event.timestamp).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                                {event.description && (
                                    <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {event.description}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
