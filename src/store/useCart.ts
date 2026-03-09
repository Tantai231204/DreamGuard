import { useCartStore } from "./useCartStore"

// Re-export types for simpler imports elsewhere
export * from "./cartTypes"

/**
 * Main Cart Hook using Zustand
 */
export const useCart = () => useCartStore()

// Also export the store reference if needed for direct access in non-React code
export { useCartStore }