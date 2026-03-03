import { motion } from "framer-motion"
import { Search, Inbox, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    title?: string
    description?: string
    icon?: React.ReactNode
    action?: {
        label: string
        onClick: () => void
    }
}

export function EmptyState({ 
    title = "No results found", 
    description = "Try adjusting your search or filters",
    icon,
    action 
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16 px-4"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mb-6"
            >
                {icon || (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Inbox className="h-12 w-12 text-gray-400" />
                    </div>
                )}
            </motion.div>
            
            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-gray-900 mb-2"
            >
                {title}
            </motion.h3>
            
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-600 text-center max-w-md mb-6"
            >
                {description}
            </motion.p>
            
            {action && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Button
                        onClick={action.onClick}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                    >
                        {action.label}
                    </Button>
                </motion.div>
            )}
        </motion.div>
    )
}

export function EmptySearchState() {
    return (
        <EmptyState
            title="No matching results"
            description="We couldn't find any items matching your search criteria. Try using different keywords or clearing filters."
            icon={
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Search className="h-12 w-12 text-blue-600" />
                </div>
            }
        />
    )
}

export function EmptyFilterState({ onClearFilters }: { onClearFilters?: () => void }) {
    return (
        <EmptyState
            title="No results with current filters"
            description="Try adjusting or clearing your filters to see more results."
            icon={
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <Filter className="h-12 w-12 text-purple-600" />
                </div>
            }
            action={onClearFilters ? {
                label: "Clear Filters",
                onClick: onClearFilters
            } : undefined}
        />
    )
}

export function EmptyDataState({ onCreate }: { onCreate?: () => void }) {
    return (
        <EmptyState
            title="No data yet"
            description="Get started by creating your first item. It will appear here once created."
            action={onCreate ? {
                label: "Create New",
                onClick: onCreate
            } : undefined}
        />
    )
}
