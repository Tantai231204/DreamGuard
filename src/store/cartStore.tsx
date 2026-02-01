import { useState, createContext } from "react"
import type { ReactNode } from "react"

export interface CartItem {
    id: string
    name: string
    image: string
    price: number
    quantity: number
    subtotal: number
}

interface CartContextType {
    cart: CartItem[]
    addItem: (item: Omit<CartItem, 'quantity' | 'subtotal'>) => void
    updateQuantity: (id: string, delta: number) => void
    removeItem: (id: string) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
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

    const addItem = (newItem: Omit<CartItem, 'quantity' | 'subtotal'>) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.id === newItem.id)
            if (existingItem) {
                return prev.map(item => 
                    item.id === newItem.id 
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
                        : item
                )
            } else {
                return [...prev, { ...newItem, quantity: 1, subtotal: newItem.price }]
            }
        })
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta)
                return {
                    ...item,
                    quantity: newQuantity,
                    subtotal: newQuantity * item.price
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
    const totalPrice = cart.reduce((sum, item) => sum + item.subtotal, 0)

    return (
        <CartContext.Provider value={{
            cart,
            addItem,
            updateQuantity,
            removeItem,
            clearCart,
            totalItems,
            totalPrice
        }}>
            {children}
        </CartContext.Provider>
    )
}