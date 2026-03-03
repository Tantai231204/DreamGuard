import { motion } from "framer-motion"

interface LoadingRowProps {
    columns?: number
    delay?: number
}

function LoadingRow({ columns = 6, delay = 0 }: LoadingRowProps) {
    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay }}
            className="border-b border-gray-100"
        >
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <div className="animate-pulse">
                        <div className={`h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded ${
                            i === 0 ? 'w-16' : i === 1 ? 'w-32' : i === columns - 1 ? 'w-8' : 'w-24'
                        }`} 
                        style={{
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite'
                        }}
                        />
                    </div>
                </td>
            ))}
        </motion.tr>
    )
}

interface TableLoadingStateProps {
    rows?: number
    columns?: number
}

export function TableLoadingState({ rows = 5, columns = 6 }: TableLoadingStateProps) {
    return (
        <div className="w-full">
            <table className="w-full">
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <LoadingRow key={i} columns={columns} delay={i * 0.05} />
                    ))}
                </tbody>
            </table>
            <style>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
            `}</style>
        </div>
    )
}

interface SkeletonCardProps {
    delay?: number
}

function SkeletonCard({ delay = 0 }: SkeletonCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="p-6 border-2 border-gray-200 rounded-xl bg-white"
        >
            <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded" />
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-5/6" />
                </div>
            </div>
        </motion.div>
    )
}

interface CardLoadingStateProps {
    cards?: number
}

export function CardLoadingState({ cards = 3 }: CardLoadingStateProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: cards }).map((_, i) => (
                <SkeletonCard key={i} delay={i * 0.1} />
            ))}
        </div>
    )
}

export function FullPageLoadingState() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-4"
                >
                    <div className="h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm font-medium text-gray-600"
                >
                    Loading...
                </motion.p>
            </motion.div>
        </div>
    )
}
