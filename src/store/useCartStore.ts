import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import cartService, { type CartResponse, type CartItemResponse } from "@/api/services/cartService"
import { toast } from "sonner"
import type { CartItem } from "./cartTypes"
import { useAuthStore } from "./authStore"

interface CartState {
    cart: CartItem[]
    loadingIds: string[]
    syncingIds: string[] // PER-ITEM update indicators
    isSyncing: boolean // GLOBAL sync lock
    totalItems: number
    totalPrice: number
    totalTradeInDiscount: number
    finalTotal: number

    // Actions
    fetchCart: () => Promise<void>
    addItem: (item: Omit<CartItem, 'quantity' | 'subtotal' | 'productVariantId'> & { quantity?: number; productVariantId?: string; comboId?: string }) => Promise<void>
    updateQuantity: (id: string, delta: number) => Promise<void>
    removeItem: (id: string) => Promise<void>
    clearCart: () => Promise<void> // Clears both server and local
    resetLocalCart: () => void // Strictly clears local state instantly
    syncWithServer: () => Promise<void>
    // Internal helper to sync state from API response
    updateStoreFromResponse: (response: CartResponse | unknown) => void
}

// Helper to calculate totals precisely
const calculateTotals = (cart: CartItem[]) => {
    return cart.reduce(
        (acc, item) => {
            const itemPrice = item.price || 0
            const itemQuantity = item.quantity || 0
            const discount = item.tradeIn?.totalValue || 0

            acc.totalItems += itemQuantity
            acc.totalPrice += itemQuantity * itemPrice
            acc.totalTradeInDiscount += discount
            acc.finalTotal += Math.max(0, itemQuantity * itemPrice - discount)

            return acc
        },
        { totalItems: 0, totalPrice: 0, totalTradeInDiscount: 0, finalTotal: 0 }
    )
}

// Global timers for debouncing
const debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],
            loadingIds: [],
            syncingIds: [],
            isSyncing: false,
            totalItems: 0,
            totalPrice: 0,
            totalTradeInDiscount: 0,
            finalTotal: 0,

            resetLocalCart: () => {
                set({
                    cart: [],
                    totalItems: 0,
                    totalPrice: 0,
                    totalTradeInDiscount: 0,
                    finalTotal: 0,
                    syncingIds: [],
                    loadingIds: [],
                    isSyncing: false
                })
            },

            updateStoreFromResponse: (response: unknown) => {
                const responseData = (response as { data?: { items: CartItemResponse[] } })?.data ?? (response as { items: CartItemResponse[] });

                // Be defensive: if the response doesn't look like a cart, 
                // we don't update the store from it. 
                // The caller should handle falling back to fetchCart() if needed.
                if (!responseData || !Array.isArray(responseData.items)) {
                    return;
                }

                // If we are logged in and get an empty list immediately after sending items, 
                // it might be a race condition on the server. We should be careful here.
                // However, we follow the server's truth if it returns a valid (even if empty) list.

                const mappedItems: CartItem[] = responseData.items.map((item: CartItemResponse) => ({
                    id: item.id || `svr_${Math.random()}`,
                    name: item.itemName || "Unknown Product",
                    image: item.imageUrl || "",
                    price: item.unitPrice || 0,
                    quantity: item.quantity || 0,
                    subtotal: item.subTotal || 0,
                    productVariantId: item.productVariantId || null,
                    comboId: item.comboId || null,
                    sku: item.sku || "",
                    availableStock: item.availableStock ?? 0,
                    isAvailable: item.isAvailable ?? true
                }));

                set({
                    cart: mappedItems,
                    ...calculateTotals(mappedItems)
                });
            },

            fetchCart: async () => {
                const { isAuthenticated } = useAuthStore.getState()
                if (!isAuthenticated) return

                try {
                    const response = await cartService.getCart()
                    get().updateStoreFromResponse(response)
                } catch (error) {
                    console.error("[CartStore] fetchCart failed:", error)
                }
            },

            addItem: async (newItem) => {
                const { isAuthenticated } = useAuthStore.getState()
                const { cart } = get()

                const itemQuantity = newItem.quantity || 1
                // Match the Sync API logic: comboId takes precedence, variantId is null if combo exists
                const productVariantId = newItem.comboId ? null : (newItem.productVariantId || newItem.id)
                const comboId = newItem.comboId || null
                const baseId = comboId || productVariantId

                // Unique key for local identification (prevents duplicates in UI)
                const localId = newItem.tradeIn
                    ? `${baseId}_tradein_${Date.now()}`
                    : `local_${baseId}`

                // 1. Check if item already exists in local cart (Optimistic)
                const existingIdx = cart.findIndex(item =>
                    item.productVariantId === productVariantId &&
                    item.comboId === comboId &&
                    !item.tradeIn
                )

                const updatedCart = [...cart]
                if (existingIdx > -1 && !newItem.tradeIn) {
                    const existing = updatedCart[existingIdx]
                    updatedCart[existingIdx] = {
                        ...existing,
                        quantity: existing.quantity + itemQuantity,
                        subtotal: (existing.quantity + itemQuantity) * existing.price
                    }
                } else {
                    const freshItem: CartItem = {
                        ...newItem,
                        id: localId,
                        productVariantId,
                        comboId,
                        quantity: itemQuantity,
                        subtotal: Math.max(0, itemQuantity * newItem.price - (newItem.tradeIn?.totalValue || 0)),
                    }
                    updatedCart.push(freshItem)
                }

                // Update UI immediately
                set({ cart: updatedCart, ...calculateTotals(updatedCart) })
                toast.success(`Item added to cart`)

                // 2. Sync with Backend if logged in
                if (isAuthenticated) {
                    const targetId = updatedCart[existingIdx > -1 ? existingIdx : updatedCart.length - 1].id
                    set(s => ({ loadingIds: [...s.loadingIds, targetId] }))
                    try {

                        const response = await cartService.addItem({
                            productVariantId,
                            comboId,
                            quantity: itemQuantity
                        })
                        
                        const resObj = response as unknown as Record<string, unknown>;
                        const isFullCart = !!(resObj?.items || resObj?.data);
                        if (isFullCart) {
                            get().updateStoreFromResponse(response)
                        } else {
                            // If API returns a string like "Item added successfully", 
                            // we need to pull the full cart to get the real UUIDs.
                            await get().fetchCart()
                        }
                    } catch (err) {
                        console.warn("[CartStore] Server sync failed, falling back to fetchCart", err)
                        await get().fetchCart()
                    } finally {
                        set(s => ({ loadingIds: s.loadingIds.filter(id => id !== targetId) }))
                    }
                }
            },

            updateQuantity: async (id, delta) => {
                const { isAuthenticated } = useAuthStore.getState()
                const { cart } = get()

                const item = cart.find(i => i.id === id)
                if (!item) return

                const newQty = Math.max(1, item.quantity + delta)
                if (newQty === item.quantity) return

                // 1. Local/Optimistic update
                const updatedCart = cart.map(i => i.id === id ? {
                    ...i,
                    quantity: newQty,
                    subtotal: Math.max(0, newQty * i.price - (i.tradeIn?.totalValue || 0))
                } : i)

                set({ cart: updatedCart, ...calculateTotals(updatedCart) })

                // 2. Debounced API Sync
                if (isAuthenticated) {
                    // Check if ID is a server UUID (UUIDs usually don't have underscores like our local IDs)
                    const isServerId = !id.includes('_')
                    if (!isServerId) {
                        // If it's a local ID but authenticated, we should have synced it already.
                        // Force a refresh if this happens.
                        await get().fetchCart()
                        return
                    }

                    if (debounceTimers.has(id)) {
                        clearTimeout(debounceTimers.get(id))
                    }

                    set(s => ({ syncingIds: Array.from(new Set([...s.syncingIds, id])) }))

                    const timer = setTimeout(async () => {
                        try {
                            await cartService.updateItem(id, newQty)
                        } catch {
                            toast.error("Update failed")
                            await get().fetchCart()
                        } finally {
                            set(s => ({ syncingIds: s.syncingIds.filter(sid => sid !== id) }))
                            debounceTimers.delete(id)
                        }
                    }, 1000)

                    debounceTimers.set(id, timer)
                }
            },

            removeItem: async (id) => {
                const { isAuthenticated } = useAuthStore.getState()
                const { cart } = get()

                // 1. Optimistic
                const updatedCart = cart.filter(i => i.id !== id)
                set({ cart: updatedCart, ...calculateTotals(updatedCart) })

                // 2. API Sync
                if (isAuthenticated && !id.includes('_')) {
                    set(s => ({ loadingIds: [...s.loadingIds, id] }))
                    try {
                        await cartService.removeItem(id)
                    } catch {
                        toast.error("Exceed removal limit or server error")
                        await get().fetchCart()
                    } finally {
                        set(s => ({ loadingIds: s.loadingIds.filter(lid => lid !== id) }))
                    }
                }
            },

            clearCart: async () => {
                const { isAuthenticated } = useAuthStore.getState()
                get().resetLocalCart()

                if (isAuthenticated) {
                    try {
                        await cartService.clearCart()
                    } catch {
                        console.error("[CartStore] Failed to clear server cart")
                    }
                }
            },

            syncWithServer: async () => {
                const { isAuthenticated } = useAuthStore.getState()
                if (!isAuthenticated) return
                if (get().isSyncing) return

                // CAPTURE guest items
                // Only items added locally before logging in will not have an ID from the server
                // BUT if they just logged in, we trust everything in local storage is a guest item
                const localGuestItems = get().cart
                set({ isSyncing: true })

                try {
                    if (localGuestItems.length > 0) {
                        const guestItemsPayload = localGuestItems.map(item => {
                            // Support legacy localStorage where variantId was saved instead of productVariantId
                            const legacyVariantId = (item as unknown as { variantId?: string }).variantId;
                            const variantId = item.productVariantId || legacyVariantId || null;

                            // If variantId somehow matches the product ID (fallback bug), we still send it,
                            // but ideally it should be a valid variant UUID.

                            return {
                                productVariantId: variantId,
                                comboId: item.comboId || null,
                                quantity: item.quantity,
                            }
                        })

                        await cartService.syncCart(guestItemsPayload)

                        if (localGuestItems.length > 0) {
                            toast.success("Guest items successfully merged!")
                        }
                    }

                    // Whether we pushed items or not, ALWAYS pull the final definitive cart from server
                    // This circumvents any issues where the syncCart API response format is unknown
                    await get().fetchCart()

                } catch (error) {
                    console.error("[CartStore] Sync sequence failed:", error)
                    // If the sync call strictly fails due to 400 Bad Request, we've caught the error.
                    // The guest items will REMAIN in the local cart so the user doesn't lose them.
                } finally {
                    set({ isSyncing: false })
                }
            }
        }),
        {
            name: "dreamguard-cart-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ cart: state.cart }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    const totals = calculateTotals(state.cart)
                    useCartStore.setState({ ...totals })
                }
            }
        }
    )
)
