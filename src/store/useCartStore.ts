import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import cartService, { type CartResponse, type CartItemResponse, type AddCartItemRequest } from "@/api/services/cartService"
import { toast } from "sonner"
import type { CartItem as BaseCartItem } from "./cartTypes"
import { useAuthStore } from "./authStore"
import MD5 from "crypto-js/md5"

// ── Types & Interfaces ──

export type CartItem = BaseCartItem & {
    isCustom?: boolean;
    ProductCustomizeDetailRequest?: Array<{ ProductCustomizeTypeId: string; CustomizeContent: string }>;
    customAttributes?: {
        [key: string]: string | number | undefined;
        length?: number;
        width?: number;
        thickness?: number;
        colorHex?: string;
    };
    attributeSignature?: string;
    configHash?: string;
};

interface CartState {
    // Core State
    cart: CartItem[]
    loadingIds: string[]
    syncingIds: string[]
    isFetching: boolean
    isSyncing: boolean

    // Computed State (Derived)
    totalItems: number
    totalPrice: number
    totalTradeInDiscount: number
    finalTotal: number

    // Actions
    fetchCart: () => Promise<void>
    addItem: (item: Omit<CartItem, 'quantity' | 'subtotal' | 'productVariantId'> & {
        quantity?: number;
        productVariantId?: string | null;
        comboId?: string | null
    }) => Promise<void>
    updateQuantity: (id: string, delta: number) => Promise<void>
    removeItem: (id: string) => Promise<void>
    clearCart: () => Promise<void>
    resetLocalCart: () => void
    syncWithServer: () => Promise<void>
    updateStoreFromResponse: (response: CartResponse | unknown) => void
    batchAddItems: (items: Array<{ productVariantId: string | null; comboId: string | null; quantity: number; configHash?: string; _optimisticData?: CartItem }>) => Promise<void>
}

// Internal type for normalization
type CustomizeDetailEntry = {
    ProductCustomizeTypeId?: string;
    customizeTypeName?: string;
    CustomizeContent?: string;
    customizeContent?: string;
};

// ── Helpers (Private/Internal) ──

/**
 * Normalizes attribute names for consistent internal mapping
 */
const normalizeAttrKey = (name: string): string => {
    const n = name.toLowerCase().trim();
    if (n === 'color' || n === 'màu sắc' || n === 'màu') return 'color';
    if (n === 'size' || n === 'kích thước' || n === 'kích cỡ') return 'size';
    return n;
};

/**
 * Generates a deterministic Config Hash for the item.
 * Used for BE deduplication and logic grouping.
 * SENIOR STANDARD: Fixed-length 32-char Hex string is O(1) for DB indexing.
 */
export const generateConfigHash = (
    productVariantId: string | null | undefined,
    comboId: string | null | undefined,
    customDetails?: Array<{ ProductCustomizeTypeId?: string; CustomizeContent?: string; customizeTypeName?: string; customizeContent?: string }>,
    metadata?: string
) => {
    const base = comboId ? `combo:${comboId}` : `var:${productVariantId || 'base'}`;
    const meta = metadata ? `meta:${metadata.toLowerCase().trim()}` : "meta:none";
    if (!customDetails || customDetails.length === 0) return MD5(`${base}|${meta}|std`).toString();

    // Key-agnostic normalization: Use ONLY content values for hashing
    // This ensures Local (UUID keys) and Server (name keys) produce identical hashes
    const normalized = customDetails
        .map(d => (d.CustomizeContent || d.customizeContent || "").trim().toLowerCase().replace(/\s+/g, ''))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .join('&');

    return MD5(`${base}|${normalized}|${meta}`).toString();
};

/**
 * Generate a signature for UI matching/display
 */
const generateAttributeSignature = (customDetails?: CustomizeDetailEntry[], metadata?: string) => {
    const metaStr = metadata ? `meta:${metadata.toLowerCase().trim()}` : "";
    if (!customDetails || customDetails.length === 0) return metaStr || "standard";

    const parts = customDetails.map(d => {
        const type = normalizeAttrKey(d.ProductCustomizeTypeId || d.customizeTypeName || "");
        const content = (d.CustomizeContent || d.customizeContent || "").toLowerCase().trim();
        return `${type}:${content}`;
    });

    if (metaStr) parts.push(metaStr);
    return parts.sort().join('|');
};

/**
 * Single-pass totals calculation for performance.
 * O(N) where N is cart size.
 */
const calculateTotals = (cart: CartItem[]) => {
    let totalItems = 0, totalPrice = 0, totalTradeInDiscount = 0, finalTotal = 0;

    for (const item of cart) {
        const qty = item.quantity || 0;
        const price = item.price || 0;
        const discount = item.tradeIn?.totalValue || 0;

        totalItems += qty;
        totalPrice += qty * price;
        totalTradeInDiscount += discount;
        finalTotal += Math.max(0, qty * price - discount);
    }

    return { totalItems, totalPrice, totalTradeInDiscount, finalTotal };
}

// Global debouncing map
const debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

// ── Store Implementation ──

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],
            loadingIds: [],
            syncingIds: [],
            isFetching: false,
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
                    isSyncing: false,
                    isFetching: false
                })
            },

            /**
             * Reconciliation Engine (O(N)): Maps Server Response to Local State.
             * Uses Map-based lookup for maximum performance.
             */
            updateStoreFromResponse: (response: unknown) => {
                const responseData = (response as { data?: { items: CartItemResponse[] } })?.data ?? (response as { items: CartItemResponse[] });
                if (!responseData || !Array.isArray(responseData.items)) return;

                // 1. Index local pool by configHash for O(1) match
                const localPool = new Map<string, CartItem>();
                const currentCart = get().cart;
                for (const item of currentCart) {
                    if (item.configHash) localPool.set(item.configHash, item);
                }

                const mappedItems: CartItem[] = responseData.items.map((item: CartItemResponse) => {
                    const apiCustoms = item.productCustomizeDetails || [];

                    // Normalize server data once
                    const normalizedForHash: Array<{ customizeContent?: string }> = [];
                    const apiAttrs: CartItem['customAttributes'] = {};
                    let apiColor: string | undefined;
                    let apiSize: string | undefined;

                    for (const d of apiCustoms) {
                        const content = (d.customizeContent || "").trim();
                        if (!content) continue;

                        normalizedForHash.push({ customizeContent: content });

                        const key = normalizeAttrKey(d.customizeTypeName);
                        if (key === 'color') {
                            apiColor = content;
                            apiAttrs.colorHex = content;
                        } else if (key === 'size') {
                            apiSize = content;
                            const dims = content.split('x');
                            if (dims.length >= 2) {
                                apiAttrs.length = parseInt(dims[0]);
                                apiAttrs.width = parseInt(dims[1]);
                                if (dims[2]) apiAttrs.thickness = parseInt(dims[2]);
                            }
                        }
                    }

                    // Senior Parsing: Split once
                    const fullName = item.itemName || "";
                    const firstDashIdx = fullName.indexOf(' - ');
                    const serverName = firstDashIdx > -1 ? fullName.substring(0, firstDashIdx) : fullName;
                    const rest = firstDashIdx > -1 ? fullName.substring(firstDashIdx + 3) : "";
                    const secondDashIdx = rest.indexOf(' - ');
                    const serverColorLabel = secondDashIdx > -1 ? rest.substring(0, secondDashIdx) : (rest || undefined);
                    const serverSizeLabel = secondDashIdx > -1 ? rest.substring(secondDashIdx + 3) : undefined;

                    const apiConfigHash = generateConfigHash(item.productVariantId, item.comboId, normalizedForHash, serverColorLabel);

                    // Fast Identity Match
                    let local = localPool.get(apiConfigHash);
                    if (!local && (item.productVariantId || item.comboId)) {
                        const apiSignature = item.productVariantId ? generateAttributeSignature(apiCustoms as CustomizeDetailEntry[], serverColorLabel) : "standard";
                        local = currentCart.find(l => {
                            if (item.comboId) return l.comboId === item.comboId;
                            return l.productVariantId === item.productVariantId && l.attributeSignature === apiSignature;
                        });
                    }

                    const unitPrice = (item.unitPrice || 0) + (item.totalAddOnPrice || 0);
                    return {
                        id: item.id,
                        name: serverName,
                        image: item.imageUrl || local?.image || "",
                        price: unitPrice,
                        quantity: item.quantity || 0,
                        subtotal: unitPrice * item.quantity,
                        productVariantId: item.productVariantId || null,
                        comboId: item.comboId || null,
                        color: apiColor || serverColorLabel || local?.color || "",
                        size: apiSize || serverSizeLabel || local?.size || "",
                        isCustom: apiCustoms.length > 0 || (item.totalAddOnPrice || 0) > 0,
                        customAttributes: Object.keys(apiAttrs).length > 0 ? apiAttrs : local?.customAttributes,
                        attributeSignature: local?.attributeSignature,
                        configHash: local?.configHash || apiConfigHash,
                        sku: item.sku || local?.sku,
                        availableStock: item.availableStock ?? 0,
                        isAvailable: item.isAvailable ?? true,
                        tradeIn: local?.tradeIn,
                        ProductCustomizeDetailRequest: normalizedForHash.length > 0 ? normalizedForHash : undefined,
                    } as CartItem;
                });

                set({ cart: mappedItems, ...calculateTotals(mappedItems) });
            },

            fetchCart: async () => {
                if (get().isFetching) return;
                const { isAuthenticated } = useAuthStore.getState();
                if (!isAuthenticated) return;

                set({ isFetching: true });
                try {
                    const response = await cartService.getCart();
                    get().updateStoreFromResponse(response);
                } catch (error) {
                    console.error("[Cart] Fetch failed:", error);
                } finally {
                    set({ isFetching: false });
                }
            },

            addItem: async (newItem) => {
                const { isAuthenticated } = useAuthStore.getState();
                const currentCart = get().cart;

                const qty = newItem.quantity || 1;
                // Senior Fix: Never use local bespoke ID (item_...) as the API variant ID
                const pVariantId = newItem.comboId ? null : newItem.productVariantId;
                const cId = newItem.comboId || null;
                const baseId = cId || pVariantId || newItem.productId;

                const isCustom = !!newItem.isCustom || (newItem.ProductCustomizeDetailRequest?.length ?? 0) > 0;
                const signature = generateAttributeSignature(newItem.ProductCustomizeDetailRequest as CustomizeDetailEntry[], newItem.color);

                // Priority 1: Use pre-calculated hash from the action caller (e.g. useProductDetailState)
                // Priority 2: Recalculate locally with full metadata context
                const configHash = newItem.configHash || generateConfigHash(pVariantId, cId, newItem.ProductCustomizeDetailRequest, newItem.color);

                // Optimistic Local ID
                const localId = (newItem.tradeIn || isCustom)
                    ? `c_${baseId}_${configHash}`
                    : `l_${baseId}`;

                // 1. OPTIMISTIC UI: Update EVERYTHING immediately (including count badge)
                const newItemEntry = {
                    ...newItem,
                    id: localId,
                    productVariantId: pVariantId,
                    comboId: cId,
                    isCustom,
                    attributeSignature: signature,
                    configHash: configHash,
                    quantity: qty,
                    subtotal: Math.max(0, qty * (newItem.price || 0) - (newItem.tradeIn?.totalValue || 0)),
                } as CartItem;

                // MERGE OPTIMIZATION (O(1) instead of O(N))
                const updatedCart = [...currentCart];
                let merged = false;

                // Standard Bespoke/Variant merge logic
                if (!newItem.tradeIn) {
                    for (let i = 0; i < updatedCart.length; i++) {
                        if (updatedCart[i].configHash === configHash) {
                            const e = updatedCart[i];
                            const nextQty = e.quantity + qty;
                            updatedCart[i] = {
                                ...e,
                                quantity: nextQty,
                                subtotal: nextQty * (e.price || 0)
                            };
                            merged = true;
                            break;
                        }
                    }
                }

                if (!merged) {
                    updatedCart.push(newItemEntry);
                }

                set({ cart: updatedCart, ...calculateTotals(updatedCart) });

                // 2. CONSOLIDATED FEEDBACK
                const toastId = `addItem-${localId}`;
                toast.loading("Syncing with cart...", { id: toastId });

                if (isAuthenticated) {
                    try {
                        const response = await cartService.addItem({
                            productVariantId: pVariantId ?? null,
                            comboId: cId,
                            quantity: qty,
                            ProductCustomizeDetailRequest: newItem.ProductCustomizeDetailRequest,
                            configHash: configHash
                        });

                        get().updateStoreFromResponse(response);
                        toast.success("Item added successfully", { id: toastId });

                    } catch (error: unknown) {
                        const apiError = error as { response?: { data?: { message?: string } }; message?: string };
                        const errorMessage = apiError.response?.data?.message || apiError.message || "Failed to sync cart";

                        toast.error(errorMessage, { id: toastId });
                        await get().fetchCart();
                    }
                } else {
                    toast.success("Item added to cart", { id: toastId });
                }
            },

            /**
             * Optimistic quantity updates with server debouncing.
             */
            updateQuantity: async (id, delta) => {
                const { cart, syncingIds } = get();
                const item = cart.find(i => i.id === id);
                if (!item) return;

                const newQty = Math.max(1, item.quantity + delta);
                if (newQty === item.quantity) return;

                // ── STEP 1: Optimistic Local Update (Immediate gratification) ──
                const updatedCart = cart.map(i => i.id === id ? {
                    ...i,
                    quantity: newQty,
                    subtotal: Math.max(0, newQty * i.price - (i.tradeIn?.totalValue || 0))
                } : i);

                set({ cart: updatedCart, ...calculateTotals(updatedCart) });

                // ── STEP 2: Server Sync (Throttled/Debounced) ──
                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated && !id.startsWith('l_') && !id.includes('_')) {
                    if (debounceTimers.has(id)) clearTimeout(debounceTimers.get(id));

                    set({ syncingIds: [...syncingIds, id] });
                    const timer = setTimeout(async () => {
                        try {
                            await cartService.updateItem(id, newQty);
                        } catch {
                            toast.error("Cloud sync failed");
                            await get().fetchCart();
                        } finally {
                            set(s => ({ syncingIds: s.syncingIds.filter(sid => sid !== id) }));
                            debounceTimers.delete(id);
                        }
                    }, 800);
                    debounceTimers.set(id, timer);
                }
            },

            /**
             * Optimistic removal.
             */
            removeItem: async (id) => {
                const { isAuthenticated } = useAuthStore.getState();
                const updatedCart = get().cart.filter(i => i.id !== id);
                set({ cart: updatedCart, ...calculateTotals(updatedCart) });

                if (isAuthenticated && !id.includes('_')) {
                    try {
                        await cartService.removeItem(id);
                    } catch {
                        toast.error("Failed to remove item from cloud");
                        await get().fetchCart();
                    }
                }
            },

            clearCart: async () => {
                const { isAuthenticated } = useAuthStore.getState();
                get().resetLocalCart();
                if (isAuthenticated) {
                    try { await cartService.clearCart(); } catch { console.error("Server clear failed"); }
                }
            },

            syncWithServer: async () => {
                const { isAuthenticated } = useAuthStore.getState();
                if (!isAuthenticated || get().isSyncing) return;

                const localItems = get().cart;
                if (localItems.length === 0) return;

                set({ isSyncing: true });
                try {
                    const payload: AddCartItemRequest[] = localItems.map(i => ({
                        productVariantId: i.productVariantId || null,
                        comboId: i.comboId || null,
                        quantity: i.quantity,
                        ProductCustomizeDetailRequest: i.ProductCustomizeDetailRequest,
                        configHash: i.configHash
                    }));
                    await cartService.syncCart(payload);
                    await get().fetchCart();
                } catch (e) {
                    console.error("[Cart] Global sync error", e);
                } finally {
                    set({ isSyncing: false });
                }
            },

            batchAddItems: async (items) => {
                const { isAuthenticated } = useAuthStore.getState();
                if (!isAuthenticated) return;

                set({ isSyncing: true });
                try {
                    const res = await cartService.syncCart(items);
                    get().updateStoreFromResponse(res);
                } catch (e) {
                    console.error("[Cart] Batch error", e);
                    await get().fetchCart();
                } finally {
                    set({ isSyncing: false });
                }
            }
        }),
        {
            name: "dreamguard-cart-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (s) => ({ cart: s.cart }),
            onRehydrateStorage: () => (s) => {
                if (s) {
                    const t = calculateTotals(s.cart);
                    useCartStore.setState({ ...t });
                }
            }
        }
    )
)
