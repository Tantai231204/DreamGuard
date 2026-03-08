import { useMemo } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    ChevronDown,
    ChevronRight,
    Copy,
    Edit,
    Eye,
    MoreVertical,
    Package,
    Layers,
    Plus,
    ShoppingCart,
    Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Combo, ComboItem } from "../../types"
import type { ProductItemResponse } from "@/api/services/comboService"

const columnHelper = createColumnHelper<Combo>()

/* ─── helpers ──────────────────────────────────────────── */
interface ProductItemWithLabel extends ProductItemResponse {
    variantLabel?: string;
}

function resolveItems(combo: Combo): ComboItem[] {
    // Prefer combo.items (has variantLabel), fallback to productItems
    if (combo.items?.length) return combo.items
    if (combo.productItems?.length)
        return (combo.productItems as ProductItemWithLabel[]).map((pi) => ({
            productId: pi.productVariantId ?? "",
            productName: pi.productName ?? "",
            variantId: pi.sku,
            variantLabel: pi.variantLabel || "",
            quantity: pi.quantity ?? 0,
        }))
    return []
}

/* "Bộ chăn ga gối Baby Dream (x1) — White / S" */
function formatItemLine(item: ComboItem): string {
    const qty = item.quantity ?? 1
    const label = item.variantLabel ?? ""
    const base = `${item.productName} (x${qty})`
    return label ? `${base} — ${label}` : base
}

/* ─── Status config ─────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    Draft: { label: "Draft", className: "bg-amber-50 text-amber-600 border-amber-200" },
    Published: { label: "Published", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    Active: { label: "Active", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    OutOfStock: { label: "Out of Stock", className: "bg-red-50 text-red-600 border-red-200" },
    Hidden: { label: "Hidden", className: "bg-slate-50 text-slate-500 border-slate-200" },
}

/* ─── SubRow mapping ────────────────────────────────────── */

export function mapCombosToSubRows(combos: Combo[]): Combo[] {
    return combos.map((combo) => {
        const subRows = combo.childCombos?.length ? mapCombosToSubRows(combo.childCombos) : []
        const rest = { ...combo }
        return { ...rest, subRows }
    })
}

/* ─── Hook ──────────────────────────────────────────────── */

interface UseComboColumnsOptions {
    onView?: (combo: Combo) => void
    onEdit?: (combo: Combo) => void
    onDelete?: (combo: Combo) => void
    onDuplicate?: (combo: Combo) => void
    onAddVariant?: (combo: Combo) => void
    onAddToCart?: (combo: Combo) => void
}

export function useComboColumns(options: UseComboColumnsOptions = {}) {
    const { onView, onEdit, onDelete, onDuplicate, onAddVariant, onAddToCart } = options

    return useMemo(
        () => [
            /* ── Checkbox ─────────────────────────────────────────── */
            columnHelper.display({
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(e.target.checked)}
                    />
                ),
                size: 40,
            }),

            /* ── Combo Info (Rich Cell) ───────────────────────── */
            columnHelper.accessor("name", {
                header: "Combo Info",
                cell: (info) => {
                    const combo = info.row.original
                    const items = resolveItems(combo)
                    const sku = combo.slug || combo.sku || "—"
                    const canExpand = info.row.getCanExpand()
                    const isExpanded = info.row.getIsExpanded()
                    const depth = info.row.depth

                    return (
                        <div
                            className="flex items-center gap-4 py-1"
                            style={{ paddingLeft: `${depth * 24}px` }}
                        >
                            {/* Expand chevron */}
                            {canExpand ? (
                                <button
                                    onClick={info.row.getToggleExpandedHandler()}
                                    className="h-8 w-8 flex items-center justify-center rounded hover:bg-slate-100 transition-colors flex-shrink-0"
                                >
                                    {isExpanded
                                        ? <ChevronDown className="h-4 w-4 text-blue-600" />
                                        : <ChevronRight className="h-4 w-4 text-slate-400" />
                                    }
                                </button>
                            ) : (
                                <div className="h-8 w-8 flex-shrink-0" />
                            )}

                            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 flex-shrink-0">
                                <Package className="h-6 w-6 text-slate-400" />
                            </div>

                            <div className="min-w-0 flex flex-col gap-0.5">
                                <div className="font-bold text-[14px] text-slate-900 truncate max-w-[240px] leading-tight group-hover:text-blue-700 transition-colors">
                                    {info.getValue()}
                                </div>
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 flex-shrink-0">
                                        {sku}
                                    </span>
                                    <span className="text-slate-300 text-[10px]">.</span>
                                    <div className="flex items-center gap-1.5 truncate">
                                        <Layers className="h-3 w-3 text-slate-400" />
                                        <span className="text-[11px] text-blue-600/80 font-bold uppercase tracking-wider truncate">
                                            {items.length} {items.length === 1 ? "Item" : "Items"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                },
            }),

            /* ── Products in Combo ────────────────────────────────── */
            columnHelper.display({
                id: "products",
                header: "Products in Combo",
                cell: ({ row }) => {
                    const combo = row.original
                    const items = resolveItems(combo)

                    if (!items.length)
                        return <span className="text-xs text-gray-400 italic">No items</span>

                    const preview = items.slice(0, 2)
                    const rest = items.length - preview.length

                    return (
                        <div className="space-y-0.5 max-w-[280px]">
                            {preview.map((item, idx) => (
                                <div key={idx} className="flex items-baseline gap-1 text-xs leading-relaxed">
                                    <span className="text-gray-300 flex-shrink-0">.</span>
                                    <span className="text-gray-700 truncate font-medium">
                                        {formatItemLine(item)}
                                    </span>
                                </div>
                            ))}
                            {rest > 0 && (
                                <span className="text-[11px] text-blue-500 font-bold ml-2.5">
                                    +{rest} more
                                </span>
                            )}
                        </div>
                    )
                },
            }),

            /* ── Discount ─────────────────────────────────────────── */
            columnHelper.accessor("discount", {
                header: () => <div className="text-center">Discount</div>,
                cell: (info) => {
                    const discount = info.getValue()
                    if (!discount || discount === 0)
                        return <span className="text-gray-300 text-xs block text-center">—</span>

                    return (
                        <div className="flex justify-center">
                            <Badge
                                variant="outline"
                                className="bg-orange-500 text-white border-orange-500 font-bold text-[11px] px-2.5 rounded-full"
                            >
                                -{discount}%
                            </Badge>
                        </div>
                    )
                },
            }),

            /* ── Price ────────────────────────────────────────────── */
            columnHelper.display({
                id: "price",
                header: () => <div className="text-right">Price</div>,
                cell: ({ row }) => {
                    const combo = row.original
                    const basePrice = combo.basePrice
                    const salePrice = combo.baseSalePrice ?? combo.salePrice ?? null

                    if (!basePrice)
                        return <span className="text-gray-400 text-xs block text-right">—</span>

                    const hasSale = salePrice != null && salePrice < basePrice

                    return (
                        <div className="text-right">
                            <div className="font-bold text-blue-600 text-[14px]">
                                {(hasSale ? salePrice : basePrice).toLocaleString("en-US")}₫
                            </div>
                            {hasSale && (
                                <div className="text-xs line-through text-gray-400">
                                    {basePrice.toLocaleString("en-US")}₫
                                </div>
                            )}
                        </div>
                    )
                },
            }),

            /* ── Stock ────────────────────────────────────────────── */
            columnHelper.accessor("totalStock", {
                header: "Stock",
                cell: (info) => {
                    const stock = info.getValue() ?? 0
                    const color =
                        stock === 0 ? "text-red-600" : stock < 10 ? "text-orange-600" : "text-green-600"
                    return <span className={cn("font-bold text-sm", color)}>{stock}</span>
                },
            }),

            /* ── Sales ────────────────────────────────────────────── */
            columnHelper.accessor("sales", {
                header: "Sales",
                cell: (info) => {
                    const sales = info.getValue() ?? 0
                    return <span className="font-bold text-sm text-gray-700">{sales}</span>
                },
            }),

            /* ── Status ───────────────────────────────────────────── */
            columnHelper.accessor("status", {
                header: "Status",
                cell: (info) => {
                    const status = info.getValue()
                    const config = STATUS_CONFIG[status]
                    if (!config) return <Badge variant="outline">Unknown</Badge>
                    return (
                        <Badge variant="outline" className={config.className}>
                            {config.label}
                        </Badge>
                    )
                },
            }),

            /* ── Actions ──────────────────────────────────────────── */
            columnHelper.display({
                id: "actions",
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => {
                    const combo = row.original
                    const isParent = !combo.comboParentId

                    return (
                        <div className="flex justify-end gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded hover:bg-slate-100 transition-colors text-blue-600"
                                onClick={(e) => { e.stopPropagation(); onAddToCart?.(combo); }}
                                title="Add to Cart"
                            >
                                <ShoppingCart className="h-5 w-5" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 w-9 p-0 rounded hover:bg-slate-100 transition-colors"
                                    >
                                        <MoreVertical className="h-5 w-5 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 shadow-xl border border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                                    <DropdownMenuItem
                                        className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors gap-2.5"
                                        onClick={() => onView?.(combo)}
                                    >
                                        <Eye className="h-4 w-4 opacity-70" />
                                        <span className="text-[13px]">View Details</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors gap-2.5"
                                        onClick={() => onEdit?.(combo)}
                                    >
                                        <Edit className="h-4 w-4 opacity-70" />
                                        <span className="text-[13px]">Edit Combo</span>
                                    </DropdownMenuItem>
                                    {isParent && onAddVariant && (
                                        <DropdownMenuItem
                                            className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors gap-2.5"
                                            onClick={() => onAddVariant(combo)}
                                        >
                                            <Plus className="h-4 w-4 opacity-70" />
                                            <span className="text-[13px]">Add Variant</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors gap-2.5"
                                        onClick={() => onDuplicate?.(combo)}
                                    >
                                        <Copy className="h-4 w-4 opacity-70" />
                                        <span className="text-[13px]">Duplicate</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-1 bg-slate-100" />
                                    <DropdownMenuItem
                                        className="rounded-lg cursor-pointer py-2 px-3 font-medium text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors gap-2.5"
                                        onClick={() => onDelete?.(combo)}
                                    >
                                        <Trash2 className="h-4 w-4 opacity-70" />
                                        <span className="text-[13px]">Delete Combo</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                },
            }),
        ],
        [onView, onEdit, onDelete, onDuplicate, onAddVariant, onAddToCart]
    )
}