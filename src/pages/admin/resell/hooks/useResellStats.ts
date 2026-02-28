import { useMemo } from "react"
import { mockAdminTradeInRequests } from "../data"
import type { TradeInStats } from "../types"

export function useResellStats(): TradeInStats {
    return useMemo(() => {
        const requests = mockAdminTradeInRequests
        
        return {
            total: requests.length,
            pending: requests.filter(r => r.status === "pending").length,
            reviewing: requests.filter(r => r.status === "reviewing").length,
            approved: requests.filter(r => r.status === "approved").length,
            completed: requests.filter(r => r.status === "completed").length,
            rejected: requests.filter(r => r.status === "rejected").length,
            totalValue: requests
                .filter(r => r.status === "completed")
                .reduce((sum, r) => sum + r.totalEstimatedPrice, 0),
            avgProcessingTime: 3.5, // days
        }
    }, [])
}
