import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Package, TrendingDown, AlertCircle, Check } from "lucide-react"
import type { TradeInItem } from "../types"

interface SetPriceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    items: TradeInItem[]
    onSave: (prices: Record<string, number>) => void
}

export function SetPriceDialog({ open, onOpenChange, items, onSave }: SetPriceDialogProps) {
    const [prices, setPrices] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {}
        items.forEach(item => {
            initial[item.productId] = item.estimatedPrice || 0
        })
        return initial
    })

    const handlePriceChange = (productId: string, value: string) => {
        const numValue = parseFloat(value) || 0
        setPrices(prev => ({ ...prev, [productId]: numValue }))
    }

    const handleAutoPrice = (productId: string, originalPrice: number) => {
        // Auto-calculate as 60% of original price (example logic)
        const autoPrice = Math.round(originalPrice * 0.6)
        setPrices(prev => ({ ...prev, [productId]: autoPrice }))
    }

    const handleSave = () => {
        onSave(prices)
        onOpenChange(false)
    }

    const totalEstimated = Object.values(prices).reduce((sum, price) => sum + price, 0)
    const totalOriginal = items.reduce((sum, item) => sum + item.originalPrice, 0)
    const allPriced = items.every(item => prices[item.productId] > 0)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 rounded-lg bg-emerald-500 shadow-sm">
                            <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        Set Estimated Prices
                    </DialogTitle>
                    <DialogDescription>
                        Set the estimated trade-in value for each item. You can use the auto-price feature or manually enter values.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {items.map((item) => {
                        const currentPrice = prices[item.productId] || 0
                        const depreciation = item.originalPrice > 0
                            ? Math.round((1 - currentPrice / item.originalPrice) * 100)
                            : 0

                        return (
                            <div
                                key={item.productId}
                                className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors bg-white"
                            >
                                    <div className="flex items-start gap-4">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            {item.productImage ? (
                                                <img
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info & Price Input */}
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-sm">{item.productName}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.condition}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">
                                                        Original: {item.originalPrice.toLocaleString("vi-VN")}₫
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label htmlFor={`price-${item.productId}`} className="text-xs font-medium mb-1.5">
                                                        Estimated Price (₫)
                                                    </Label>
                                                    <Input
                                                        id={`price-${item.productId}`}
                                                        type="number"
                                                        value={currentPrice || ""}
                                                        onChange={(e) => handlePriceChange(item.productId, e.target.value)}
                                                        placeholder="Enter price..."
                                                        className="text-sm font-semibold"
                                                        min={0}
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAutoPrice(item.productId, item.originalPrice)}
                                                        className="w-full h-10"
                                                    >
                                                        Auto Price (60%)
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Depreciation Info */}
                                            {currentPrice > 0 && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
                                                    <span className="text-amber-700 font-medium">
                                                        {depreciation}% depreciation
                                                    </span>
                                                    {currentPrice > item.originalPrice && (
                                                        <Badge variant="outline" className="text-xs ml-auto text-red-600 border-red-200">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            Price exceeds original
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Check Icon */}
                                        {currentPrice > 0 && (
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                                    <Check className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                <Separator className="my-4" />

                {/* Summary Section */}
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-xs text-gray-600 font-medium mb-1">Total Original</div>
                            <div className="text-lg font-semibold text-gray-700">
                                {totalOriginal.toLocaleString("vi-VN")}₫
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-emerald-700 font-medium mb-1">
                                Total Estimated
                            </div>
                            <div className="text-2xl font-semibold text-emerald-600">
                                {totalEstimated.toLocaleString("vi-VN")}₫
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-600 font-medium mb-1">Items Priced</div>
                            <div className="text-lg font-semibold text-gray-700">
                                {items.filter(item => prices[item.productId] > 0).length} / {items.length}
                            </div>
                        </div>
                    </div>
                    {!allPriced && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">Please set prices for all items before saving</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!allPriced}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                        <Check className="h-4 w-4" />
                        Save Prices
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
