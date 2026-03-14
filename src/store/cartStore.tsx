import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { useAuthStore } from "./authStore"
import { useCartStore } from "./useCartStore"

/**
 * @deprecated Use useCart() (which is Zustand) directly.
 * This provider now only handles initial hydration and auth-sync logic.
 */
export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuthStore()
    const { fetchCart, syncWithServer } = useCartStore()
    const firstLoad = useRef(true)
    const prevAuth = useRef(isAuthenticated)

    // 1. Initial Load & Auth Sync
    useEffect(() => {
        if (firstLoad.current) {
            firstLoad.current = false
            fetchCart()
        }

        // Logic: Guest -> Authenticated
        if (isAuthenticated && !prevAuth.current) {
            syncWithServer()
        }
        // Logic: Auth state changed (even if just refresh)
        else if (isAuthenticated && prevAuth.current === undefined) {
            fetchCart()
        }

        prevAuth.current = isAuthenticated
    }, [isAuthenticated, fetchCart, syncWithServer])

    return <>{children}</>
}
