import { useParams } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AdminPageHeader from "@/components/layout/AdminPageHeader"
import { mockAdminTradeInRequests, STATUS_CONFIG } from "./data"
import {
    canApproveRequest,
    canCompleteRequest,
    canRejectRequest,
    VALIDATION_MESSAGES,
} from "./businessRules"
import {
    TradeInItemsList,
    TradeInSummary,
    TradeInTimeline,
    TradeInCustomerCard,
    TradeInActionsCard,
    TradeInPriorityCard,
    TradeInNotFound,
    TradeInRequirements,
    RejectDialog,
    TradeInRejectionInfo,
} from "./components"

export default function TradeInDetail() {
    const { id } = useParams<{ id: string }>()
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

    // In a real app, fetch trade-in request by ID
    const request = mockAdminTradeInRequests.find((r) => r.id === id)

    if (!request) {
        return <TradeInNotFound requestId={id} />
    }

    const statusConfig = STATUS_CONFIG[request.status]

    const handlePrint = () => {
        window.print()
    }

    const handleSetPrice = () => {
        console.log("Set price for request:", request.id)
        // TODO: Open price setting modal
    }

    const handleApprove = () => {
        // Validate using business rules
        const validation = canApproveRequest(request)
        
        if (!validation.canApprove) {
            alert(validation.reason || VALIDATION_MESSAGES.APPROVAL.INVALID_STATUS)
            return
        }
        
        console.log("Approve request:", request.id)
        alert(VALIDATION_MESSAGES.APPROVAL.SUCCESS)
        // TODO: Implement approve logic (API call, state update, etc.)
    }

    const handleReject = () => {
        // Validate using business rules
        const validation = canRejectRequest(request)
        
        if (!validation.canReject) {
            alert(validation.reason || VALIDATION_MESSAGES.REJECTION.INVALID_STATUS)
            return
        }
        
        // Open reject dialog
        setRejectDialogOpen(true)
    }

    const handleRejectConfirm = (reason: string, category: string) => {
        console.log("Reject request:", request.id)
        console.log("Reason:", reason)
        console.log("Category:", category)
        
        alert(VALIDATION_MESSAGES.REJECTION.SUCCESS)
        // TODO: Implement reject logic with reason (API call, state update, etc.)
        // The reason and category can be saved to database
    }

    const handleComplete = () => {
        // Validate using business rules
        const validation = canCompleteRequest(request)
        
        if (!validation.canComplete) {
            alert(validation.reason || VALIDATION_MESSAGES.COMPLETION.NOT_APPROVED)
            return
        }
        
        // Confirm completion
        const confirmed = confirm(
            "Mark this trade-in request as completed? This action confirms the customer has received their trade-in value."
        )
        
        if (!confirmed) return
        
        console.log("Complete request:", request.id)
        alert(VALIDATION_MESSAGES.REOPEN.SUCCESS)
        alert(VALIDATION_MESSAGES.COMPLETION.SUCCESS)
        // TODO: Implement complete logic (API call, state update, etc.)
    }

    const handleReopen = () => {
        // Confirm reopening
        const confirmed = confirm(
            "Reopen this trade-in request? The status will be changed to 'Reviewing' for re-evaluation."
        )
        
        if (!confirmed) return
        
        console.log("Reopen request:", request.id)
        // TODO: Implement reopen logic (API call, state update, etc.)
    }

    return (
        <div className="flex flex-col h-full">
            <AdminPageHeader
                title={`Trade-in Request #${request.id}`}
                description={request.customer.name}
                actions={
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} text-sm px-3 py-1 font-semibold`}
                        >
                            {statusConfig.label}
                        </Badge>
                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            size="sm"
                            className="gap-2 hover:bg-gray-50"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                    </div>
                }
                stats={[
                    {
                        label: "Request Date",
                        value: new Date(request.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }),
                    },
                    {
                        label: "Estimated Value",
                        value: request.totalEstimatedPrice > 0
                            ? `₫${request.totalEstimatedPrice.toLocaleString("vi-VN")}`
                            : "Not priced",
                    },
                    { label: "Items", value: request.items.length },
                ]}
            />

            <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Trade-in Items */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <TradeInItemsList items={request.items} />
                                <div className="mt-4">
                                    <TradeInSummary
                                        totalOriginalPrice={request.totalOriginalPrice}
                                        totalEstimatedPrice={request.totalEstimatedPrice}
                                        itemCount={request.items.length}
                                    />
                                </div>
                            </motion.div>

                            {/* Timeline */}
                            <TradeInTimeline
                                currentStatus={request.status}
                                createdAt={request.createdAt}
                                updatedAt={request.updatedAt}
                                completedAt={request.completedAt}
                            />
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            <TradeInCustomerCard customer={request.customer} />

                            {/* Show rejection info for rejected requests */}
                            {request.status === "rejected" && request.rejectionReason && (
                                <TradeInRejectionInfo
                                    reason={request.rejectionReason}
                                    category={request.rejectionCategory || "other"}
                                    delay={0.12}
                                />
                            )}

                            <TradeInRequirements
                                status={request.status}
                                totalEstimatedPrice={request.totalEstimatedPrice}
                                itemCount={request.items.length}
                                hasAllItemsPriced={request.items.every(item => item.estimatedPrice > 0)}
                                delay={0.14}
                            />

                            <TradeInPriorityCard
                                priority={request.priority}
                                createdAt={request.createdAt}
                                updatedAt={request.updatedAt}
                                delay={0.16}
                            />

                            <TradeInActionsCard
                                status={request.status}
                                totalEstimatedPrice={request.totalEstimatedPrice}
                                hasAllItemsPriced={request.items.every(item => item.estimatedPrice > 0)}
                                onSetPrice={handleSetPrice}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onComplete={handleComplete}
                                onReopen={handleReopen}
                                delay={0.2}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Dialog */}
            <RejectDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                onConfirm={handleRejectConfirm}
                requestId={request.id}
                customerName={request.customer.name}
            />
        </div>
    )
}
