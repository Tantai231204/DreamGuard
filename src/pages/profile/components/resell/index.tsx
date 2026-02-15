import { useState, useCallback, useMemo } from "react"
import { Package, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../../../components/ui/button"

// Sub-components
import BenefitsBanner from "./BenefitsBanner"
import StatsCards from "./StatsCards"
import TradeInHistory from "./TradeInHistory"
import CreateWizard from "./wizard"

// Types & Constants
import type { EligibleProduct, MediaFile, SelectedProductWithMedia } from "./types"
import { mockEligibleProducts, mockTradeInRequests } from "./constants"

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ResellTab() {
    const [view, setView] = useState<"list" | "create">("list")
    const [createStep, setCreateStep] = useState(1)
    
    // Multi-select products
    const [selectedProducts, setSelectedProducts] = useState<EligibleProduct[]>([])
    
    // Products with media for staff evaluation
    const [productsWithMedia, setProductsWithMedia] = useState<SelectedProductWithMedia[]>([])
    
    // Terms agreement
    const [agreedTerms, setAgreedTerms] = useState(false)

    // Memoized stats calculation - prevents recalculation on every render
    const stats = useMemo(() => ({
        total: mockTradeInRequests.length,
        pending: mockTradeInRequests.filter((r) => r.status === "pending").length,
        reviewing: mockTradeInRequests.filter((r) => r.status === "reviewing").length,
        completed: mockTradeInRequests.filter((r) => r.status === "completed").length,
        totalEarned: mockTradeInRequests
            .filter((r) => r.status === "completed")
            .reduce((sum, r) => r.items.reduce((s, item) => s + item.estimatedPrice, 0) + sum, 0),
    }), [])

    // Memoized eligible products
    const eligibleProducts = useMemo(() => 
        mockEligibleProducts.filter(p => p.canTradeIn),
    [])

    // Toggle single product selection
    const handleToggleProduct = useCallback((product: EligibleProduct) => {
        setSelectedProducts(prev => {
            const isSelected = prev.some(p => p.id === product.id)
            if (isSelected) {
                // Remove from selected and also from productsWithMedia
                setProductsWithMedia(pwm => pwm.filter(p => p.product.id !== product.id))
                return prev.filter(p => p.id !== product.id)
            } else {
                // Add to selected and initialize in productsWithMedia
                setProductsWithMedia(pwm => [...pwm, { product, media: [], note: "" }])
                return [...prev, product]
            }
        })
    }, [])

    // Select all products
    const handleSelectAll = useCallback(() => {
        setSelectedProducts(eligibleProducts)
        setProductsWithMedia(eligibleProducts.map(product => ({
            product,
            media: [],
            note: ""
        })))
    }, [eligibleProducts])

    // Deselect all products
    const handleDeselectAll = useCallback(() => {
        setSelectedProducts([])
        setProductsWithMedia([])
    }, [])

    // Update media for a specific product
    const handleUpdateProductMedia = useCallback((productId: string, media: MediaFile[], note: string) => {
        setProductsWithMedia(prev => 
            prev.map(p => 
                p.product.id === productId 
                    ? { ...p, media, note }
                    : p
            )
        )
    }, [])

    // Reset form with cleanup
    const resetForm = useCallback(() => {
        // Revoke object URLs to prevent memory leaks
        productsWithMedia.forEach(p => {
            p.media.forEach(m => {
                if (m.url.startsWith('blob:')) {
                    URL.revokeObjectURL(m.url)
                }
            })
        })
        
        setView("list")
        setCreateStep(1)
        setSelectedProducts([])
        setProductsWithMedia([])
        setAgreedTerms(false)
    }, [productsWithMedia])

    // Handle submit
    const handleSubmit = useCallback(() => {
        // Here you would send productsWithMedia to the server
        console.log("Submitting:", productsWithMedia)
        
        // Show success toast
        toast.success("Gửi yêu cầu thành công!", {
            description: `Đã gửi ${productsWithMedia.length} sản phẩm để đánh giá. Chúng tôi sẽ phản hồi trong vòng 24 giờ.`,
            duration: 5000,
        })
        
        resetForm()
    }, [productsWithMedia, resetForm])

    // Handle view change
    const handleCreateNew = useCallback(() => setView("create"), [])

    return (
        <div className="space-y-6">
            {/* ═══════════════════════════════════════════════════
                HEADER
            ═══════════════════════════════════════════════════ */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <RefreshCw className="h-6 w-6 text-[#4988c4]" />
                        <h2 className="text-2xl font-bold text-gray-900">Thu mua sản phẩm cũ</h2>
                    </div>
                    <p className="text-sm text-gray-500">
                        Bán lại sản phẩm đã mua cho DreamGuard và nhận hoàn tiền
                    </p>
                </div>
                <AnimatePresence mode="wait">
                    {view === "list" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Button
                                onClick={handleCreateNew}
                                className="bg-gradient-to-r from-[#4988c4] to-[#3a73a8] hover:shadow-lg transition-all"
                            >
                                <Package className="h-4 w-4 mr-2" />
                                Bán lại ngay
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════════════════════════════════════════════════
                CONTENT WITH TRANSITIONS
            ═══════════════════════════════════════════════════ */}
            <AnimatePresence mode="wait">
                {view === "list" ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <BenefitsBanner />
                        <StatsCards stats={stats} />
                        <TradeInHistory 
                            requests={mockTradeInRequests} 
                            onCreateNew={handleCreateNew} 
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CreateWizard
                            step={createStep}
                            products={mockEligibleProducts}
                            selectedProducts={selectedProducts}
                            productsWithMedia={productsWithMedia}
                            agreedTerms={agreedTerms}
                            onToggleProduct={handleToggleProduct}
                            onSelectAll={handleSelectAll}
                            onDeselectAll={handleDeselectAll}
                            onUpdateProductMedia={handleUpdateProductMedia}
                            onToggleTerms={setAgreedTerms}
                            onStepChange={setCreateStep}
                            onCancel={resetForm}
                            onSubmit={handleSubmit}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
