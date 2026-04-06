import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import cartService, { type CartResponse, type CartItemResponse, type AddCartItemRequest } from "@/api/services/cartService"
import { toast } from "sonner"
import type { CartItem } from "./cartTypes"
import { useAuthStore } from "./authStore"
import * as CryptoJS from "crypto-js"

// ── Types & Interfaces ──

interface CartState {
    cart: CartItem[]
    loadingIds: string[]
    syncingIds: string[]
    isFetching: boolean
    isSyncing: boolean
    isCartOpen: boolean

    totalItems: number
    totalPrice: number
    totalTradeInDiscount: number
    finalTotal: number

    fetchCart: () => Promise<void>
    setCartOpen: (open: boolean) => void
    addItem: (item: Omit<CartItem, 'quantity' | 'subtotal' | 'productVariantId' | 'comboId' | 'isAvailable' | 'availableStock' | 'sku'> & {
        quantity?: number;
        productVariantId?: string | null;
        comboId?: string | null;
        isAvailable?: boolean;
        availableStock?: number;
        sku?: string;
    }) => Promise<void>
    updateQuantity: (id: string, delta: number) => Promise<void>
    removeItem: (id: string) => Promise<void>
    clearCart: () => Promise<void>
    resetLocalCart: () => void
    syncWithServer: () => Promise<void>
    updateStoreFromResponse: (response: CartResponse | unknown) => void
    batchAddItems: (items: Array<{ productVariantId: string | null; comboId: string | null; quantity: number; configHash?: string; _optimisticData?: CartItem }>) => Promise<void>
}

// ── Helpers (Private) ──

const normalizeAttrKey = (name: string): string => {
    const n = name.toLowerCase().trim();
    if (n === 'color' || n === 'màu sắc' || n === 'màu') return 'color';
    if (n === 'size' || n === 'kích thước' || n === 'kích cỡ') return 'size';
    return n;
};

export const generateConfigHash = (
    productVariantId: string | null | undefined,
    comboId: string | null | undefined,
    customDetails?: Array<{ ProductCustomizeTypeId?: string; CustomizeContent?: string; customizeTypeName?: string; customizeContent?: string }>
) => {
    const base = comboId ? `combo:${comboId}` : `var:${productVariantId || 'base'}`;
    if (!customDetails || customDetails.length === 0) return CryptoJS.MD5(`${base}|std`).toString();

    const normalized = customDetails
        .map(d => (d.CustomizeContent || d.customizeContent || "").trim().toLowerCase().replace(/\s+/g, ''))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .join('&');

    return CryptoJS.MD5(`${base}|${normalized}`).toString();
};

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
            isCartOpen: false,
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
                    isFetching: false,
                    isCartOpen: false
                })
            },

            setCartOpen: (open: boolean) => set({ isCartOpen: open }),

            updateStoreFromResponse: (response: unknown) => {
                const responseData = (response as { data?: { items: CartItemResponse[] } })?.data ?? (response as { items: CartItemResponse[] });
                if (!responseData || !Array.isArray(responseData.items)) return;

                const currentCart = get().cart;
                const serverPool = new Map<string, CartItemResponse>();
                
                for (const sItem of responseData.items) {
                    const apiCustoms = sItem.productCustomizeDetails || [];
                    const hash = (sItem as CartItemResponse & { configHash?: string }).configHash || 
                                generateConfigHash(sItem.productVariantId, sItem.comboId, apiCustoms);
                    serverPool.set(hash, sItem);
                }

                const newCart: CartItem[] = [];
                const localHashesProcessed = new Set<string>();

                for (const localItem of currentCart) {
                    const hash = localItem.configHash;
                    if (!hash) {
                        newCart.push(localItem);
                        continue;
                    }

                    const serverMatch = serverPool.get(hash);
                    if (serverMatch) {
                        const unitPrice = (serverMatch.unitPrice || 0) + (serverMatch.totalAddOnPrice || 0);
                        const apiAttrs: Record<string, string | number | undefined> = { ...localItem.customAttributes };
                        
                        // Ánh xạ mọi chi tiết tùy chỉnh từ Server vào thuộc tính hiển thị
                        serverMatch.productCustomizeDetails?.forEach(d => {
                            const key = normalizeAttrKey(d.customizeTypeName);
                            apiAttrs[key] = d.customizeContent;
                        });

                        newCart.push({
                            ...localItem,
                            id: serverMatch.id,
                            quantity: serverMatch.quantity,
                            price: unitPrice,
                            subtotal: unitPrice * serverMatch.quantity,
                            sku: serverMatch.sku || localItem.sku,
                            customAttributes: apiAttrs,
                            isAvailable: serverMatch.isAvailable,
                            availableStock: serverMatch.availableStock,
                        });
                        localHashesProcessed.add(hash);
                    } else {
                        const isPending = localItem.id.startsWith('c_') || localItem.id.startsWith('l_') || localItem.id.includes('_');
                        if (isPending) {
                            newCart.push(localItem);
                            localHashesProcessed.add(hash);
                        }
                    }
                }

                for (const [hash, sItem] of serverPool.entries()) {
                    if (localHashesProcessed.has(hash)) continue;

                    const unitPrice = (sItem.unitPrice || 0) + (sItem.totalAddOnPrice || 0);
                    const apiAttrs: Record<string, string | number | undefined> = {};
                    
                    sItem.productCustomizeDetails?.forEach(d => {
                        apiAttrs[normalizeAttrKey(d.customizeTypeName)] = d.customizeContent;
                    });

                    newCart.push({
                        id: sItem.id,
                        name: sItem.itemName || "Bespoke Product",
                        image: sItem.imageUrl || "",
                        price: unitPrice,
                        quantity: sItem.quantity,
                        subtotal: unitPrice * sItem.quantity,
                        productVariantId: sItem.productVariantId ?? null,
                        comboId: sItem.comboId ?? null,
                        color: (apiAttrs.color as string) || "",
                        size: (apiAttrs.size as string) || "",
                        customAttributes: apiAttrs,
                        configHash: hash,
                        sku: sItem.sku,
                        availableStock: sItem.availableStock,
                        isAvailable: sItem.isAvailable,
                        isCustom: sItem.productCustomizeDetails && sItem.productCustomizeDetails.length > 0
                    } as CartItem);
                }

                set({ cart: newCart, ...calculateTotals(newCart) });
            },

            fetchCart: async () => {
                if (get().isFetching) return;
                const { isAuthenticated, role } = useAuthStore.getState();
                
                // Security Guard: Admins and Staff do not have a functional shopping cart via api/cart
                const isManagement = role === 'Admin' || role === 'Staff' || (role && !['user', 'customer'].includes(role.toLowerCase()));
                if (!isAuthenticated || isManagement) return;

                set({ isFetching: true });
                try {
                    const res = await cartService.getCart();
                    get().updateStoreFromResponse(res);
                } catch {
                    console.error("[Cart] Fetch error");
                } finally {
                    set({ isFetching: false });
                }
            },

            addItem: async (newItem) => {
                const { isAuthenticated } = useAuthStore.getState();
                const currentCart = get().cart;
                const qty = newItem.quantity || 1;
                const pVariantId = newItem.comboId ? null : newItem.productVariantId;
                const cId = newItem.comboId || null;
                const baseId = cId || pVariantId || newItem.productId;
                const isCustom = !!newItem.isCustom || (newItem.ProductCustomizeDetailRequest?.length ?? 0) > 0;
                const configHash = newItem.configHash || generateConfigHash(pVariantId, cId, newItem.ProductCustomizeDetailRequest);

                const localId = (newItem.tradeIn || isCustom) ? `c_${baseId}_${configHash}` : `l_${baseId}`;
                const newItemEntry = {
                    ...newItem,
                    id: localId,
                    productVariantId: pVariantId,
                    comboId: cId,
                    isCustom,
                    configHash: configHash,
                    quantity: qty,
                    subtotal: qty * (newItem.price || 0),
                } as CartItem;

                const updatedCart = [...currentCart];
                let merged = false;
                if (!newItem.tradeIn) {
                    for (let i = 0; i < updatedCart.length; i++) {
                        if (updatedCart[i].configHash === configHash) {
                            const e = updatedCart[i];
                            const nextQty = e.quantity + qty;
                            updatedCart[i] = { ...e, quantity: nextQty, subtotal: nextQty * e.price };
                            merged = true;
                            break;
                        }
                    }
                }
                if (!merged) updatedCart.push(newItemEntry);
                set({ cart: updatedCart, ...calculateTotals(updatedCart) });

                if (isAuthenticated) {
                    set(s => ({ loadingIds: [...s.loadingIds, localId] }));
                    try {
                        const res = await cartService.addItem({
                            productVariantId: pVariantId ?? null,
                            comboId: cId ?? null,
                            quantity: qty,
                            ProductCustomizeDetailRequest: newItem.ProductCustomizeDetailRequest,
                            configHash
                        });
                        get().updateStoreFromResponse(res);
                        toast.success(`${newItem.name} added to your sanctuary.`, {
                            description: "Your selection has been synchronized.",
                            duration: 3000,
                        });
                        // Auto-open drawer after animation
                        setTimeout(() => get().setCartOpen(true), 1000);
                    } catch {
                        toast.error("Sync failed, retrying...");
                        await get().fetchCart();
                    } finally {
                        set(s => ({ loadingIds: s.loadingIds.filter(id => id !== localId) }));
                    }
                }
            },

            updateQuantity: async (id, delta) => {
                const { cart } = get();
                const item = cart.find(i => i.id === id);
                if (!item) return;
                const newQty = Math.max(1, item.quantity + delta);
                if (newQty === item.quantity) return;

                const updatedCart = cart.map(i => i.id === id ? { ...i, quantity: newQty, subtotal: newQty * i.price } : i);
                set({ cart: updatedCart, ...calculateTotals(updatedCart) });

                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated && !id.startsWith('c_') && !id.startsWith('l_')) {
                    if (debounceTimers.has(id)) clearTimeout(debounceTimers.get(id));
                    set(s => ({ syncingIds: [...s.syncingIds, id] }));
                    const timer = setTimeout(async () => {
                        try {
                            await cartService.updateItem(id, newQty);
                        } catch {
                            await get().fetchCart();
                        } finally {
                            set(s => ({ syncingIds: s.syncingIds.filter(sid => sid !== id) }));
                        }
                    }, 800);
                    debounceTimers.set(id, timer);
                }
            },

            removeItem: async (id) => {
                const { isAuthenticated } = useAuthStore.getState();
                const updatedCart = get().cart.filter(i => i.id !== id);
                set({ cart: updatedCart, ...calculateTotals(updatedCart) });

                if (isAuthenticated && !id.startsWith('c_') && !id.startsWith('l_')) {
                    try { await cartService.removeItem(id); } catch { await get().fetchCart(); }
                }
            },

            clearCart: async () => {
                const { isAuthenticated } = useAuthStore.getState();
                get().resetLocalCart();
                if (isAuthenticated) {
                    try { await cartService.clearCart(); } catch (e) { console.error(e); }
                }
            },

            syncWithServer: async () => {
                const { isAuthenticated, role } = useAuthStore.getState();
                const isManagement = role === 'Admin' || role === 'Staff' || (role && !['user', 'customer'].includes(role.toLowerCase()));
                if (!isAuthenticated || isManagement || get().isSyncing) return;

                const localItems = get().cart.filter(i => i.id.startsWith('c_') || i.id.startsWith('l_'));
                if (localItems.length === 0) return;

                set({ isSyncing: true });
                try {
                    const payload: AddCartItemRequest[] = localItems.map(i => ({
                        productVariantId: i.productVariantId ?? null,
                        comboId: i.comboId ?? null,
                        quantity: i.quantity,
                        ProductCustomizeDetailRequest: i.ProductCustomizeDetailRequest,
                        configHash: i.configHash
                    }));
                    await cartService.syncCart(payload);
                    await get().fetchCart();
                } catch (e) {
                    console.error("[Cart] Sync error", e);
                } finally {
                    set({ isSyncing: false });
                }
            },

            batchAddItems: async (items) => {
                const { isAuthenticated } = useAuthStore.getState();
                if (!isAuthenticated) return;
                set({ isSyncing: true });
                try {
                    const res = await cartService.syncCart(items as (CartItemResponse | AddCartItemRequest)[]);
                    get().updateStoreFromResponse(res);
                } catch {
                    await get().fetchCart();
                } finally {
                    set({ isSyncing: false });
                }
            }
        }),
        {
            name: "dreamguard-cart-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
)