import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import cartService, { type CartResponse, type CartItemResponse, type AddCartItemRequest } from "@/api/services/cartService"
import { toast } from "sonner"
import { useAuthStore } from "./authStore"
import { isAnyStaff } from "@/lib/role"
import * as CryptoJS from "crypto-js"
import type { CartItem } from "./cartTypes"

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
    if ((n.includes('wrap') && n.includes('image')) || n.includes('ảnh bọc')) return 'wrapImage';
    return n;
};

export const generateConfigHash = (
    productVariantId: string | null | undefined,
    comboId: string | null | undefined,
    customDetails?: Array<{
        ProductCustomizeTypeId?: string;
        CustomizeContent?: string;
        customizeTypeId?: string;
        customizeTypeName?: string;
        customizeContent?: string;
    }>
) => {
    const base = comboId ? `combo:${comboId}` : `var:${productVariantId || 'base'}`;
    if (!customDetails || customDetails.length === 0) return CryptoJS.MD5(`${base}|std`).toString();

    // To bridge the gap between Guest (using IDs) and Server (using Names),
    // we use the actual customization contents for identification, sorted to ensure stability.
    // This is safe as mattress dimensions and hex colors have distinct patterns.
    const normalized = customDetails
        .map(d => (d.CustomizeContent || d.customizeContent || "").trim().replace(/\s+/g, ''))
        .filter(s => s.length > 0)
        .sort((a, b) => a.localeCompare(b))
        .join('|');

    return CryptoJS.MD5(`${base}[${normalized}]`).toString();
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
let lastFetchedAt = 0;
const FETCH_STALE_MS = 30_000; // 30 seconds

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
                console.log("[Cart] updateStoreFromResponse called", response);
                const responseData = (response as { data?: { items: CartItemResponse[] } })?.data ?? (response as { items: CartItemResponse[] });
                if (!responseData || !Array.isArray(responseData.items)) return;

                const currentCart = get().cart;
                const serverPool = new Map<string, CartItemResponse>();

                for (const sItem of responseData.items) {
                    const apiCustoms = sItem.productCustomizeDetails || [];
                    // Force re-calculation on client-side to ensure consistency with current logic
                    const hash = generateConfigHash(sItem.productVariantId, sItem.comboId, apiCustoms);

                    const existing = serverPool.get(hash);
                    if (existing) {
                        console.log(`[Cart] Aggregating server line item for hash ${hash}: ${existing.quantity} + ${sItem.quantity}`);
                        existing.quantity += sItem.quantity;
                        existing.subTotal = (existing.subTotal || 0) + (sItem.subTotal || 0);
                        if (existing.id.startsWith('c_') || existing.id.startsWith('l_')) {
                            existing.id = sItem.id;
                        }
                    } else {
                        serverPool.set(hash, { ...sItem });
                    }
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

                        serverMatch.productCustomizeDetails?.forEach(d => {
                            const key = normalizeAttrKey(d.customizeTypeName);
                            apiAttrs[key] = d.customizeContent;
                            // Also ensure wrapImage is directly accessible if normalized
                            if (key === 'wrapImage') apiAttrs.wrapImage = d.customizeContent;
                        });

                        const isServerCustom = !!(serverMatch.productCustomizeDetails && serverMatch.productCustomizeDetails.length > 0);
                        const isLocalCustom = !!localItem.isCustom;

                        const serverImg = (serverMatch.imageUrl && serverMatch.imageUrl.trim() !== "") ? serverMatch.imageUrl : null;
                        const localImg = (localItem.image && localItem.image.trim() !== "") ? localItem.image : null;

                        const finalImage = (apiAttrs.wrapImage as string) ||
                            (localImg?.startsWith('blob:') ? localImg : null) ||
                            serverImg ||
                            (isServerCustom || isLocalCustom ? "/images/logo_no_name.svg" : (localImg || "/placeholder.png"));

                        // Heuristic: Enrich color/size from itemName if missing
                        let inferredColor = localItem.color || (apiAttrs.color as string) || "";
                        let inferredSize = localItem.size || (apiAttrs.size as string) || "";

                        const nameParts = (serverMatch.itemName || localItem.name).split(" - ");
                        let cleanName = nameParts[0];

                        if (nameParts.length > 1) {
                            nameParts.slice(1).forEach(p => {
                                const val = p.trim();
                                const isHex = val.startsWith('#');
                                const isSize = (/\d+x\d+/.test(val) || val.toLowerCase().match(/^(s|m|l|xl|xxl)$/));

                                if (isHex || isSize || val.length < 15) {
                                    if (!inferredSize && isSize) inferredSize = val;
                                    else if (!inferredColor && (isHex || (!isSize && val.length > 2))) inferredColor = val;
                                } else {
                                    cleanName += ` - ${val}`;
                                }
                            });
                        }

                        newCart.push({
                            ...localItem,
                            id: serverMatch.id,
                            isCustom: isServerCustom || isLocalCustom,
                            quantity: serverMatch.quantity,
                            price: unitPrice,
                            subtotal: unitPrice * serverMatch.quantity,
                            sku: serverMatch.sku || localItem.sku,
                            image: finalImage,
                            name: cleanName,
                            color: inferredColor,
                            size: inferredSize,
                            customAttributes: apiAttrs,
                            isAvailable: serverMatch.isAvailable,
                            availableStock: serverMatch.availableStock,
                            comboId: serverMatch.comboId || localItem.comboId, // Preserve local ID (slug) if server returns null
                            productVariantId: serverMatch.productVariantId || localItem.productVariantId,
                        });
                        localHashesProcessed.add(hash);
                    } else {
                        // FUZZY MATCHING: Stricter check to allow multiple different custom items
                        const isPending = localItem.id.startsWith('c_') || localItem.id.startsWith('l_') || localItem.id.includes('_');

                        let likelyMatchedOnServer = false;
                        if (isPending) {
                            for (const sItem of serverPool.values()) {
                                // Match only if same variant AND it hasn't been claimed by another hash-match yet
                                if (sItem.productVariantId === localItem.productVariantId && sItem.comboId === localItem.comboId) {
                                    // Backup Content Check: If contents are identical, it's the same item even if hash failed
                                    const sContents = (sItem.productCustomizeDetails || []).map(d => d.customizeContent.trim().toLowerCase()).sort().join('|');
                                    const lContents = (localItem.ProductCustomizeDetailRequest || []).map(d => d.CustomizeContent.trim().toLowerCase()).sort().join('|');

                                    if (sContents === lContents && sContents.length > 0) {
                                        likelyMatchedOnServer = true;
                                        break;
                                    }

                                    // Heuristic Check: Same number of details
                                    const sCustomLen = sItem.productCustomizeDetails?.length || 0;
                                    const lCustomLen = localItem.ProductCustomizeDetailRequest?.length || 0;

                                    if (sCustomLen > 0 && sCustomLen === lCustomLen) {
                                        likelyMatchedOnServer = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (isPending && !likelyMatchedOnServer) {
                            newCart.push(localItem);
                            localHashesProcessed.add(hash);
                        }
                    }
                }

                for (const [hash, sItem] of serverPool.entries()) {
                    if (localHashesProcessed.has(hash)) continue;

                    // FUZZY RECOVERY: The ultimate matching strategy to bridge Guest -> User gap
                    const sNameRaw = sItem.itemName || "";
                    const sNameNorm = sNameRaw.toLowerCase().replace(/[^a-z0-9]/g, '');

                    const localMatch = currentCart.find(l => {
                        const lNameRaw = l.name || "";
                        const lNameNorm = lNameRaw.toLowerCase().replace(/[^a-z0-9]/g, '');

                        const nameMatch = lNameNorm === sNameNorm ||
                            (lNameNorm.includes(sNameNorm) && sNameNorm.length > 5) ||
                            (sNameNorm.includes(lNameNorm) && lNameNorm.length > 5);

                        return (l.productVariantId === sItem.productVariantId && l.productVariantId !== null) ||
                            (l.comboId === sItem.comboId && l.comboId !== null) ||
                            (l.sku === sItem.sku && sItem.sku) ||
                            nameMatch;
                    });

                    const unitPrice = (sItem.unitPrice || 0) + (sItem.totalAddOnPrice || 0);
                    const apiAttrs: Record<string, string | number | undefined> = {};

                    sItem.productCustomizeDetails?.forEach(d => {
                        apiAttrs[normalizeAttrKey(d.customizeTypeName)] = d.customizeContent;
                    });

                    // Heuristic: Extract color/size from itemName for standard products if missing
                    let inferredColor = (apiAttrs.color as string) || (localMatch?.color) || "";
                    let inferredSize = (apiAttrs.size as string) || (localMatch?.size) || "";

                    const nameParts = (sItem.itemName || "DreamGuard Product").split(" - ");
                    let cleanName = nameParts[0];

                    if (nameParts.length > 1) {
                        nameParts.slice(1).forEach(p => {
                            const val = p.trim();
                            const isHex = val.startsWith('#');
                            const isSize = (/\d+x\d+/.test(val) || val.toLowerCase().match(/^(s|m|l|xl|xxl)$/));

                            if (isHex || isSize || val.length < 15) {
                                if (!inferredSize && isSize) inferredSize = val;
                                else if (!inferredColor && (isHex || (!isSize && val.length > 2))) inferredColor = val;
                            } else {
                                cleanName += ` - ${val}`;
                            }
                        });
                    }

                    const serverImg = (sItem.imageUrl && sItem.imageUrl.trim() !== "") ? sItem.imageUrl : null;
                    const fallbackImg = localMatch?.image || (sItem.comboId ? "/images/combo-placeholder.png" : "/placeholder.png");

                    newCart.push({
                        id: sItem.id,
                        name: cleanName,
                        image: serverImg || fallbackImg,
                        price: unitPrice,
                        quantity: sItem.quantity,
                        subtotal: unitPrice * sItem.quantity,
                        productVariantId: sItem.productVariantId ?? null,
                        comboId: sItem.comboId ?? null,
                        color: inferredColor,
                        size: inferredSize,
                        customAttributes: apiAttrs,
                        configHash: hash,
                        sku: sItem.sku,
                        availableStock: sItem.availableStock,
                        isAvailable: sItem.isAvailable,
                        isCustom: localMatch?.isCustom || (sItem.productCustomizeDetails && sItem.productCustomizeDetails.length > 0)
                    } as CartItem);
                }

                set({ cart: newCart, ...calculateTotals(newCart) });
            },

            fetchCart: async () => {
                if (get().isFetching) return;

                // Staleness guard: skip if last successful fetch was recent
                const now = Date.now();
                if (now - lastFetchedAt < FETCH_STALE_MS) {
                    console.log(`[Cart] Skipping fetch — last fetched ${Math.round((now - lastFetchedAt) / 1000)}s ago`);
                    return;
                }

                const { isAuthenticated, role } = useAuthStore.getState();

                // Security Guard: Admins and Staff do not have a functional shopping cart via api/cart
                const isManagement = isAnyStaff(role);
                if (!isAuthenticated || isManagement) return;

                set({ isFetching: true });
                try {
                    const res = await cartService.getCart();
                    get().updateStoreFromResponse(res);
                    lastFetchedAt = Date.now();
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
                const isManagement = isAnyStaff(role);
                if (!isAuthenticated || isManagement || get().isSyncing) return;

                const localItems = get().cart.filter(i => i.id.startsWith('c_') || i.id.startsWith('l_'));
                if (localItems.length === 0) return;

                set({ isSyncing: true });
                try {
                    // Use addItem for each guest item instead of syncCart.
                    // The /cart/items endpoint correctly increments quantity
                    // for items that already exist in the user's cart,
                    // whereas /cart/sync does not.
                    console.log(`[Cart] Syncing ${localItems.length} guest items via addItem`);
                    for (const item of localItems) {
                        try {
                            await cartService.addItem({
                                productVariantId: item.productVariantId ?? null,
                                comboId: item.comboId ?? null,
                                quantity: item.quantity,
                                ProductCustomizeDetailRequest: item.ProductCustomizeDetailRequest,
                                configHash: item.configHash
                            });
                            console.log(`[Cart] Synced item: ${item.name} (qty: ${item.quantity})`);
                        } catch (itemErr) {
                            console.warn(`[Cart] Failed to sync item: ${item.name}`, itemErr);
                        }
                    }
                    // Fetch the authoritative cart state after all items are added
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
            partialize: (state) => ({
                cart: state.cart,
                totalItems: state.totalItems,
                totalPrice: state.totalPrice,
                totalTradeInDiscount: state.totalTradeInDiscount,
                finalTotal: state.finalTotal,
            }),
        }
    )
)