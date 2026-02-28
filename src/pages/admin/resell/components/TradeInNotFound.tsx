import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FileQuestion, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TradeInNotFoundProps {
    requestId?: string
}

export function TradeInNotFound({ requestId }: TradeInNotFoundProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <FileQuestion className="h-10 w-10 text-gray-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Request Not Found
                    </h1>

                    <p className="text-gray-600 mb-6">
                        {requestId ? (
                            <>
                                The trade-in request <span className="font-mono font-semibold text-[var(--color-primary)]">#{requestId}</span> does not exist or has been removed.
                            </>
                        ) : (
                            "The trade-in request you're looking for does not exist or has been removed."
                        )}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            asChild
                            variant="outline"
                            className="gap-2"
                        >
                            <Link to="/admin/resell">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Trade-ins
                            </Link>
                        </Button>

                        <Button
                            onClick={() => window.location.reload()}
                            className="gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh Page
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
