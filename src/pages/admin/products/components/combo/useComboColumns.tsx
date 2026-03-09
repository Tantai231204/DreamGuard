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
                    const isParent = !combo.comboParentId

                    return (
                        <div
                            className={cn(
                                "flex items-center gap-4 py-2 group/row",
                                depth > 0 && "opacity-90 ml-2"
                            )}
                            style={{ paddingLeft: `${depth * 28}px` }}
                        >
                            {/* Expand chevron */}
                            <div className="w-8 flex justify-center shrink-0">
                                {canExpand && (
                                    <button
                                        onClick={info.row.getToggleExpandedHandler()}
                                        className={cn(
                                            "h-7 w-7 flex items-center justify-center rounded-lg transition-all",
                                            isExpanded ? "bg-blue-50 text-blue-600 shadow-sm" : "hover:bg-slate-100 text-slate-400"
                                        )}
                                    >
                                        {isExpanded
                                            ? <ChevronDown className="h-4 w-4" />
                                            : <ChevronRight className="h-4 w-4" />
                                        }
                                    </button>
                                )}
                            </div>

                            <div className={cn(
                                "h-11 w-11 flex items-center justify-center rounded-xl border flex-shrink-0 shadow-sm transition-transform group-hover/row:scale-105",
                                isParent
                                    ? "bg-indigo-50 border-indigo-100 text-indigo-500"
                                    : "bg-white border-slate-200 text-slate-400"
                            )}>
                                {isParent ? <Layers className="h-5.5 w-5.5" /> : <Package className="h-5.5 w-5.5" />}
                            </div>

                            <div className="min-w-0 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "font-black text-[14px] truncate transition-colors",
                                        isParent ? "text-slate-900" : "text-slate-700",
                                        "group-hover/row:text-blue-600"
                                    )}>
                                        {info.getValue()}
                                    </span>
                                    {isParent && (
                                        <Badge className="bg-indigo-100 text-indigo-600 border-indigo-200 text-[9px] font-black uppercase tracking-wider h-4.5 px-1.5 hover:bg-indigo-200 transition-colors">
                                            Collection
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-sm shrink-0">
                                        {sku}
                                    </span>
                                    {!isParent && (combo.color || combo.size) && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500">
                                                {combo.color && (
                                                    <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5 mr-0.5">
                                                        <div className="w-2.5 h-2.5 rounded-sm border border-black/10 shadow-sm" style={{ backgroundColor: combo.color }} />
                                                        <span>{combo.color}</span>
                                                    </div>
                                                )}
                                                {combo.size && <span>{combo.size}</span>}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500/70 uppercase tracking-wider ml-auto">
                                        <Layers className="h-2.5 w-2.5" />
                                        <span>{items.length} {items.length === 1 ? "Item" : "Items"}</span>
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
                header: "Combo Composition",
                cell: ({ row }) => {
                    const combo = row.original
                    const items = resolveItems(combo)

                    if (!items.length)
                        return <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Empty</span>

                    const preview = items.slice(0, 2)
                    const rest = items.length - preview.length

                    return (
                        <div className="flex flex-col gap-1 max-w-[280px]">
                            {preview.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 group/item">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400/30 group-hover/item:bg-blue-500 transition-colors shrink-0" />
                                    <span className="text-[11.5px] text-slate-600 truncate font-medium group-hover/item:text-slate-900 transition-colors">
                                        {formatItemLine(item)}
                                    </span>
                                </div>
                            ))}
                            {rest > 0 && (
                                <div className="ml-3.5 pt-0.5">
                                    <Badge className="bg-slate-50 text-blue-600 border-slate-200 text-[9px] font-black h-4 px-1.5 shadow-none">
                                        +{rest} more products
                                    </Badge>
                                </div>
                            )}
                        </div>
                    )
                },
            }),

            /* ── Discount ─────────────────────────────────────────── */
            columnHelper.accessor("discount", {
                header: () => <div className="text-center">Savings</div>,
                cell: (info) => {
                    const discount = info.getValue()
                    if (!discount || discount === 0)
                        return <div className="flex justify-center"><span className="h-1 w-4 rounded-full bg-slate-100" /></div>

                    return (
                        <div className="flex justify-center">
                            <Badge className="bg-emerald-500 text-white border-0 font-black text-[10px] px-2 h-5 rounded-md shadow-sm animate-pulse-subtle">
                                -{discount}%
                            </Badge>
                        </div>
                    )
                },
            }),

            /* ── Price ────────────────────────────────────────────── */
            columnHelper.display({
                id: "price",
                header: () => <div className="text-right">Price Value</div>,
                cell: ({ row }) => {
                    const combo = row.original
                    const basePrice = combo.basePrice
                    const salePrice = combo.baseSalePrice ?? combo.salePrice ?? null

                    if (!basePrice)
                        return <span className="text-slate-300 text-[11px] block text-right font-black">N/A</span>

                    const hasSale = salePrice != null && salePrice < basePrice
                    const isParent = !combo.comboParentId

                    return (
                        <div className="text-right flex flex-col">
                            <div className={cn(
                                "font-black text-[15px] leading-tight",
                                hasSale ? "text-blue-600" : "text-slate-900"
                            )}>
                                {(hasSale ? salePrice : basePrice).toLocaleString("en-US")}
                                <span className="ml-0.5 text-[10px] font-bold text-slate-400 uppercase">₫</span>
                            </div>
                            {hasSale && (
                                <div className="text-[10px] line-through text-slate-400 font-bold">
                                    {basePrice.toLocaleString("en-US")}₫
                                </div>
                            )}
                            {isParent && (
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">
                                    Base Collection
                                </span>
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
        [onView, onEdit, onDelete, onDuplicate, onAddVariant]
    )
}