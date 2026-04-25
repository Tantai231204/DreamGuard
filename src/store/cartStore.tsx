import type { ReactNode } from "react"

/**
 * @deprecated CartProvider is no longer needed.
 * Cart initialization and auth-sync are handled in App.tsx.
 * This file exists only as a passthrough to avoid breaking imports.
 */
export function CartProvider({ children }: { children: ReactNode }) {
    return <>{children}</>
}
