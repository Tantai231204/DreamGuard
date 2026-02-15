import { useState, createContext } from "react"
import type { ReactNode } from "react"

export interface TradeInItem {
    id: string
    name: string
    image: string
    originalPrice: number
    tradeInValue: number
}

export interface CartItem {
    id: string
    name: string
    image: string
    price: number
    quantity: number
    subtotal: number
    // Trade-in information
    tradeIn?: {
        products: TradeInItem[]
        totalValue: number
    }
    // Variant info
    color?: string
    size?: string
}

interface CartContextType {
    cart: CartItem[]
    addItem: (item: Omit<CartItem, 'quantity' | 'subtotal'> & { quantity?: number }) => void
    updateQuantity: (id: string, delta: number) => void
    removeItem: (id: string) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
    totalTradeInDiscount: number
    finalTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export { CartContext }

// Mock data
const initialCart: CartItem[] = [
    {
        id: "1",
        name: "DreamGuard Memory Foam Pillow",
        image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        price: 89,
        quantity: 1,
        subtotal: 89,
    },
    {
        id: "2", 
        name: "Premium Cotton Bedding Set",
        image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        price: 159,
        quantity: 1,
        subtotal: 159,
    },
]

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>(initialCart)

    const addItem = (newItem: Omit<CartItem, 'quantity' | 'subtotal'> & { quantity?: number }) => {
        const itemQuantity = newItem.quantity || 1
        
        setCart(prev => {
            // Generate unique ID for items with trade-in or variant options
            const uniqueId = newItem.tradeIn 
                ? `${newItem.id}_tradein_${Date.now()}`
                : `${newItem.id}_${newItem.color || ''}_${newItem.size || ''}`
            
            const existingItem = prev.find(item => 
                item.id === uniqueId || 
                (item.id.startsWith(newItem.id) && 
                 item.color === newItem.color && 
                 item.size === newItem.size &&
                 !item.tradeIn && !newItem.tradeIn)
            )
            
            if (existingItem && !newItem.tradeIn) {
                // Update quantity for non-trade-in items
                return prev.map(item => 
                    item.id === existingItem.id
                        ? { 
                            ...item, 
                            quantity: item.quantity + itemQuantity, 
                            subtotal: (item.quantity + itemQuantity) * item.price 
                        }
                        : item
                )
            } else {
                // Add new item (trade-in items are always new entries)
                const finalSubtotal = itemQuantity * newItem.price - (newItem.tradeIn?.totalValue || 0)
                return [...prev, { 
                    ...newItem, 
                    id: uniqueId,
                    quantity: itemQuantity, 
                    subtotal: Math.max(0, finalSubtotal)
                }]
            }
        })
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta)
                const baseSubtotal = newQuantity * item.price
                const tradeInDiscount = item.tradeIn?.totalValue || 0
                return {
                    ...item,
                    quantity: newQuantity,
                    subtotal: Math.max(0, baseSubtotal - tradeInDiscount)
                }
            }
            return item
        }))
    }

    const removeItem = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const clearCart = () => {
        setCart([])
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const totalTradeInDiscount = cart.reduce((sum, item) => sum + (item.tradeIn?.totalValue || 0), 0)
    const finalTotal = Math.max(0, totalPrice - totalTradeInDiscount)

    return (
        <CartContext.Provider value={{
            cart,
            addItem,
            updateQuantity,
            removeItem,
            clearCart,
            totalItems,
            totalPrice,
            totalTradeInDiscount,
            finalTotal
        }}>
            {children}
        </CartContext.Provider>
    )
}