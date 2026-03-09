import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import cartService from "@/api/services/cartService"
import { toast } from "sonner"
import type { CartItem } from "./cartTypes"
import { useAuthStore } from "./authStore"

interface CartState {
    cart: CartItem[]
    loadingIds: string[]
    syncingIds: string[] // Non-blocking sync indicator
    totalItems: number
    totalPrice: number
    totalTradeInDiscount: number
    finalTotal: number

    // Actions
    fetchCart: () => Promise<void>
    addItem: (item: Omit<CartItem, 'quantity' | 'subtotal' | 'productVariantId'> & { quantity?: number; variantId?: string; comboId?: string }) => Promise<void>
    updateQuantity: (id: string, delta: number) => Promise<void>
    removeItem: (id: string) => Promise<void>
    clearCart: () => Promise<void>
    syncWithServer: () => Promise<void>
}

// Helper to calculate totals
const calculateTotals = (cart: CartItem[]) => {
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0)
    const totalPrice = cart.reduce((s, i) => s + i.quantity * i.price, 0)
    const totalTradeInDiscount = cart.reduce((s, i) => s + (i.tradeIn?.totalValue || 0), 0)
    const finalTotal = Math.max(0, totalPrice - totalTradeInDiscount)
    return { totalItems, totalPrice, totalTradeInDiscount, finalTotal }
}

// Private debounce map (outside of store state to avoid re-renders)
const debounceTimers: Record<string, any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],
            loadingIds: [],
            syncingIds: [],
            totalItems: 0,
            totalPrice: 0,
            totalTradeInDiscount: 0,
            finalTotal: 0,

            fetchCart: async () => {
                const { isAuthenticated } = useAuthStore.getState()
                if (!isAuthenticated) return

                try {
                    const response = await cartService.getCart()
                    const mappedItems: CartItem[] = response.items.map(item => ({
                        id: item.id,
                        name: item.itemName,
                        image: item.imageUrl,
                        price: item.unitPrice,
                        quantity: item.quantity,
                        subtotal: item.subTotal,
                        productVariantId: item.productVariantId || item.id,
                        comboId: item.comboId,
                        sku: item.sku,
                        availableStock: item.availableStock,
                        isAvailable: item.isAvailable
                    }))

                    set({
                        cart: mappedItems,
                        ...calculateTotals(mappedItems)
                    })
                } catch (error) {
                    console.error("[CartStore] fetchCart failed:", error)
                }
            },

            addItem: async (newItem) => {
                const state = get()
                const { isAuthenticated } = useAuthStore.getState()

                const itemQuantity = newItem.quantity || 1
                const variantId = newItem.comboId ? null : (newItem.variantId || newItem.id)
                const comboId = newItem.comboId || null
                const baseId = comboId || variantId

                const uniqueId = newItem.tradeIn
                    ? `${baseId}_tradein_${Date.now()}`
                    : `${baseId}_${newItem.color || ''}_${newItem.size || ''}`

                // 1. Optimistic Update
                const existing = state.cart.find(item =>
                    item.id === uniqueId ||
                    (!newItem.tradeIn && item.productVariantId === variantId && item.comboId === comboId && item.color === newItem.color && item.size === newItem.size)
                )

                let updatedCart: CartItem[]
                if (existing && !newItem.tradeIn) {
                    updatedCart = state.cart.map(item =>
                        item.id === existing.id
                            ? {
                                ...item,
                                quantity: item.quantity + itemQuantity,
                                subtotal: (item.quantity + itemQuantity) * item.price
                            }
                            : item
                    )
                } else {
                    const freshItem: CartItem = {
                        ...newItem,
                        id: uniqueId,
                        productVariantId: variantId!,
                        comboId,
                        quantity: itemQuantity,
                        subtotal: Math.max(0, itemQuantity * newItem.price - (newItem.tradeIn?.totalValue || 0)),
                    }
                    updatedCart = [...state.cart, freshItem]
                }

                set({ cart: updatedCart, ...calculateTotals(updatedCart) })
                toast.success(`Add ${newItem.name} to cart`)

                // 2. Sync with API if authenticated
                if (isAuthenticated) {
                    set(prev => ({ loadingIds: [...prev.loadingIds, uniqueId] }))
                    try {
                        const response = await cartService.addItem({
                            productVariantId: variantId ?? null,
                            comboId,
                            quantity: itemQuantity
                        })
                        // Refresh cart from server to ensure data accuracy (DB IDs, etc)
                        if (response) await get().fetchCart()
                    } catch {
                        toast.error("Sync failed, rolling back...")
                        // Rollback on failure (simplified: just fetch the latest server state)
                        await get().fetchCart()
                    } finally {
                        set(prev => ({ loadingIds: prev.loadingIds.filter(id => id !== uniqueId) }))
                    }
                }
            },

            updateQuantity: async (id, delta) => {
                const state = get()
                const { isAuthenticated } = useAuthStore.getState()

                // 1. Optimistic Update locally
                const updatedCart = state.cart.map(item => {
                    if (item.id !== id) return item
                    const newQty = Math.max(1, item.quantity + delta)
                    return {
                        ...item,
                        quantity: newQty,
                        subtotal: Math.max(0, newQty * item.price - (item.tradeIn?.totalValue || 0))
                    }
                })

                set({ cart: updatedCart, ...calculateTotals(updatedCart) })

                // 2. API Sync (Authenticated & Real DB item) - DEBOUNCED
                if (isAuthenticated && !id.includes('_')) {
                    // Start debouncing
                    if (debounceTimers[id]) clearTimeout(debounceTimers[id])

                    set(prev => ({ syncingIds: Array.from(new Set([...prev.syncingIds, id])) }))

                    debounceTimers[id] = setTimeout(async () => {
                        try {
                            const latestItem = get().cart.find(i => i.id === id)
                            if (latestItem) {
                                await cartService.updateItem(id, latestItem.quantity)
                            }
                        } catch {
                            toast.error("Failed to sync quantity")
                            await get().fetchCart() // Sync back from server on error
                        } finally {
                            set(prev => ({ syncingIds: prev.syncingIds.filter(lid => lid !== id) }))
                            delete debounceTimers[id]
                        }
                    }, 800) // 800ms debounce
                }
            },

            removeItem: async (id) => {
                const state = get()
                const { isAuthenticated } = useAuthStore.getState()

                // 1. Optimistic
                const updatedCart = state.cart.filter(item => item.id !== id)
                set({ cart: updatedCart, ...calculateTotals(updatedCart) })

                // 2. API Sync
                if (isAuthenticated && !id.includes('_')) {
                    set(prev => ({ loadingIds: [...prev.loadingIds, id] }))
                    try {
                        await cartService.removeItem(id)
                    } catch {
                        toast.error("Failed to remove from server")
                        await get().fetchCart()
                    } finally {
                        set(prev => ({ loadingIds: prev.loadingIds.filter(lid => lid !== id) }))
                    }
                }
            },

            clearCart: async () => {
                const { isAuthenticated } = useAuthStore.getState()
                set({ cart: [], ...calculateTotals([]) })

                if (isAuthenticated) {
                    try {
                        await cartService.clearCart()
                    } catch {
                        console.error("Failed to clear server cart")
                    }
                }
            },

            syncWithServer: async () => {
                const { cart } = get()
                const { isAuthenticated } = useAuthStore.getState()
                if (!isAuthenticated || cart.length === 0) {
                    if (isAuthenticated) await get().fetchCart()
                    return
                }

                try {
                    const syncData = cart.map(item => ({
                        productVariantId: item.productVariantId || null,
                        comboId: item.comboId || null,
                        quantity: item.quantity,
                    }))
                    await cartService.syncCart(syncData)
                    await get().fetchCart()
                    toast.success("Guest cart merged with account")
                } catch {
                    await get().fetchCart()
                }
            }
        }),
        {
            name: "dreamguard-cart-storage",
            storage: createJSONStorage(() => localStorage),
            // Only persist critical data (items)
            partialize: (state) => ({ cart: state.cart }),
            onRehydrateStorage: () => (state) => {
                // After rehydration, recalculate totals
                if (state) {
                    const totals = calculateTotals(state.cart)
                    useCartStore.setState({ ...totals })
                }
            }
        }
    )
)
