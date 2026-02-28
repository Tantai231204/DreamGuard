import { memo } from "react"
import { Package, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import TradeInRequestCard from "./TradeInRequestCard"
import type { TradeInRequest } from "./types"

interface TradeInHistoryProps {
    requests: TradeInRequest[]
    onCreateNew: () => void
}

function TradeInHistory({ requests, onCreateNew }: TradeInHistoryProps) {
    return (
        <section aria-labelledby="history-title">
            <h3 id="history-title" className="font-semibold text-gray-900 mb-4">
                Lịch sử yêu cầu
            </h3>
            
            <AnimatePresence mode="wait">
                {requests.length > 0 ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                        role="list"
                        aria-label="Danh sách yêu cầu thu mua"
                    >
                        {requests.map((request, index) => (
                            <TradeInRequestCard 
                                key={request.id} 
                                request={request} 
                                index={index} 
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Card>
                            <CardContent className="py-12 text-center">
                                <motion.div
                                    initial={{ y: -15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                        <Package className="h-8 w-8 text-gray-400" aria-hidden="true" />
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    <p className="font-medium text-gray-900 mb-1">Chưa có yêu cầu nào</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Bắt đầu bán lại sản phẩm không dùng đến
                                    </p>
                                    <Button 
                                        onClick={onCreateNew} 
                                        className="bg-gradient-to-r from-[#4988c4] to-[#3a73a8] hover:shadow-md transition-all"
                                    >
                                        Bán lại ngay
                                        <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                                    </Button>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default memo(TradeInHistory)
