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
    Plus,
    Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Combo, ComboItem } from "../../types"

const columnHelper = createColumnHelper<Combo>()

/* ─── helpers ──────────────────────────────────────────── */

function resolveItems(combo: Combo): ComboItem[] {
    // Prefer combo.items (has variantLabel), fallback to productItems
    if (combo.items?.length) return combo.items
    if (combo.productItems?.length)
        return combo.productItems.map((pi) => ({
            productId: (pi as any).productVariantId ?? "",
            productName: (pi as any).productName ?? "",
            variantId: (pi as any).sku,
            variantLabel: (pi as any).variantLabel,
            quantity: (pi as any).quantity ?? 0,
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
    Draft: { label: "Draft", className: "bg-amber-50 text-amber-700 border-amber-300" },
    Published: { label: "Published", className: "bg-green-50 text-green-700 border-green-300" },
    Active: { label: "Active", className: "bg-green-50 text-green-700 border-green-300" },
    OutOfStock: { label: "Out of Stock", className: "bg-red-50 text-red-700 border-red-300" },
    Hidden: { label: "Hidden", className: "bg-gray-50 text-gray-600 border-gray-300" },
}

/* ─── SubRow mapping ────────────────────────────────────── */

export function mapCombosToSubRows(combos: Combo[]): Combo[] {
    return combos.map((combo) => {
        const subRows = combo.childCombos?.length ? mapCombosToSubRows(combo.childCombos) : []
        const { children, ...rest } = combo as any
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
}

export function useComboColumns(options: UseComboColumnsOptions = {}) {
    const { onView, onEdit, onDelete, onDuplicate, onAddVariant } = options

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
                                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all flex-shrink-0"
                                >
                                    {isExpanded
                                        ? <ChevronDown className="h-4 w-4 text-purple-600" />
                                        : <ChevronRight className="h-4 w-4 text-gray-400" />
                                    }
                                </button>
                            ) : (
                                <div className="h-8 w-8 flex-shrink-0" />
                            )}

                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-indigo-100 border border-indigo-200/50 flex-shrink-0 shadow-sm">
                                <Package className="h-5 w-5 text-indigo-600" />
                            </div>

                            <div className="min-w-0 flex flex-col gap-0.5">
                                <div className="font-black text-[14px] text-gray-900 truncate max-w-[240px] leading-tight group-hover:text-indigo-700 transition-colors">
                                    {info.getValue()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 italic">
                                        {sku}
                                    </code>
                                    <span className="text-gray-300 text-[10px]">•</span>
                                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tighter">
                                        {items.length} {items.length === 1 ? "Item" : "Items"}
                                    </span>
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
                                    <span className="text-gray-300 flex-shrink-0">•</span>
                                    <span className="text-gray-700 truncate">
                                        {formatItemLine(item)}
                                    </span>
                                </div>
                            ))}
                            {rest > 0 && (
                                <span className="text-[11px] text-indigo-500 font-medium ml-3">
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
                    const salePrice = combo.baseSalePrice ?? (combo as any).salePrice ?? null

                    if (!basePrice)
                        return <span className="text-gray-400 text-xs block text-right">—</span>

                    const hasSale = salePrice != null && salePrice < basePrice

                    return (
                        <div className="text-right">
                            <div className="font-bold text-purple-600 text-[14px]">
                                {(hasSale ? salePrice : basePrice).toLocaleString("vi-VN")}đ
                            </div>
                            {hasSale && (
                                <div className="text-xs line-through text-gray-400">
                                    {basePrice.toLocaleString("vi-VN")}đ
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
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all"
                                    >
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 shadow-xl border-2 rounded-xl">
                                    <DropdownMenuItem
                                        className="cursor-pointer py-2.5 font-medium"
                                        onClick={() => onView?.(combo)}
                                    >
                                        <Eye className="h-4 w-4 mr-3 text-blue-600" />
                                        View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer py-2.5 font-medium"
                                        onClick={() => onEdit?.(combo)}
                                    >
                                        <Edit className="h-4 w-4 mr-3 text-gray-700" />
                                        Edit Combo
                                    </DropdownMenuItem>
                                    {isParent && onAddVariant && (
                                        <DropdownMenuItem
                                            className="cursor-pointer py-2.5 font-medium"
                                            onClick={() => onAddVariant(combo)}
                                        >
                                            <Plus className="h-4 w-4 mr-3 text-indigo-600" />
                                            Add Variant
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        className="cursor-pointer py-2.5 font-medium"
                                        onClick={() => onDuplicate?.(combo)}
                                    >
                                        <Copy className="h-4 w-4 mr-3 text-sky-600" />
                                        Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-1" />
                                    <DropdownMenuItem
                                        className="cursor-pointer py-2.5 text-red-600 font-semibold focus:bg-red-50 focus:text-red-700"
                                        onClick={() => onDelete?.(combo)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-3" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                },
            }),
        ],
        [onView, onEdit, onDelete, onDuplicate, onAddVariant]
    )
}