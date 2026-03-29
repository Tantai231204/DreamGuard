import { useMemo } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminStatusBadge } from "@/components/admin"
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
import { getAllowedStatusTransitions, normalizeStatus } from "../../types"
import type { Combo, ComboItem } from "../../types"
import type { ProductItemResponse } from "@/api/services/comboService"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

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
    onUpdateStatus?: (id: string, status: string, comboName?: string, currentStatus?: string) => void
}

export function useComboColumns(options: UseComboColumnsOptions = {}) {
    const { onView, onEdit, onDelete, onDuplicate, onAddVariant, onUpdateStatus } = options

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
                    const isParent = depth === 0

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
                                        <AdminStatusBadge status="Collection" type="info" dot={false} className="h-4.5 px-2 bg-indigo-50 text-indigo-600 border-indigo-100" />
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
                                    <AdminStatusBadge
                                        status={`+${rest} more`}
                                        type="neutral"
                                        dot={false}
                                        className="h-4.5 px-2"
                                    />
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
                            <AdminStatusBadge
                                status={`-${discount}%`}
                                type="success"
                                dot={false}
                                className="h-5 px-2 bg-emerald-500 text-white border-none"
                            />
                        </div>
                    )
                },
            }),

            /* ── Price ────────────────────────────────────────────── */
            columnHelper.display({
                id: "price",
                header: () => <div className="text-right">Price Value</div>,
                cell: ({ row }) => {
                    const combo = row.original;
                    const isParent = row.depth === 0;

                    if (isParent && row.subRows?.length) {
                        const childPrices = row.subRows.map(r => r.original.baseSalePrice ?? r.original.salePrice ?? 0).filter(p => p > 0);
                        if (childPrices.length > 0) {
                            const minPrice = Math.min(...childPrices);
                            const maxPrice = Math.max(...childPrices);
                            return (
                                <div className="text-right flex flex-col items-end">
                                    <div className="font-black text-[13px] text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                        {minPrice === maxPrice 
                                            ? <>{minPrice.toLocaleString("en-US")}<span className="ml-0.5 text-[9px] font-bold text-slate-400">₫</span></>
                                            : <>{minPrice.toLocaleString("en-US")} - {maxPrice.toLocaleString("en-US")}<span className="ml-0.5 text-[9px] font-bold text-slate-400">₫</span></>
                                        }
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1">
                                        Options Range
                                    </span>
                                </div>
                            );
                        }
                    }

                    const basePrice = combo.basePrice;
                    const salePrice = combo.baseSalePrice ?? combo.salePrice ?? null;

                    if (!basePrice && !isParent)
                        return <span className="text-slate-300 text-[11px] block text-right font-black">N/A</span>;
                    if (!basePrice && isParent)
                        return <span className="text-slate-300 text-[11px] block text-right font-black whitespace-nowrap">No variants</span>;

                    const hasSale = salePrice != null && salePrice < basePrice;

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
                        </div>
                    );
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
                    const rawStatus = info.getValue()
                    const normalizedStatus = normalizeStatus(rawStatus)
                    const combo = info.row.original
                    
                    // Senior Parent Detection: Combine row depth with entity structure
                    const isParent = info.row.depth === 0 && !combo.comboParentId;
                    
                    // Robust Child Check: Look into all possible child containers
                    const children = (combo.subRows || combo.childCombos || combo.productItems || []);
                    const hasChildCombos = children.length > 0;

                    if (!onUpdateStatus) return <AdminStatusBadge status={normalizedStatus} />

                    const allowed = getAllowedStatusTransitions(normalizedStatus)

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-1 group/slink cursor-pointer">
                                    <AdminStatusBadge
                                        status={normalizedStatus}
                                        className="hover:border-slate-300 transition-colors shadow-sm"
                                    />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-48 shadow-xl border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-2 py-1.5 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                                    <span className={cn(
                                        "text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter",
                                        isParent ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {isParent ? 'Collection' : 'Variant'}
                                    </span>
                                </div>
                                {allowed.map((s) => {
                                    const normalized = s.toLowerCase();
                                    // Published is only allowed for parents if they have at least one child/variant
                                    const isBlockedPublished = s === 'Published' && isParent && !hasChildCombos;
                                    const isDisabledOption = normalizedStatus === s || isBlockedPublished;
                                    
                                    const colorCls =
                                        normalized === 'published' ? "text-emerald-600 hover:bg-emerald-50" :
                                            normalized === 'draft' ? "text-amber-600 hover:bg-amber-50" :
                                                normalized === 'hidden' ? "text-blue-600 hover:bg-blue-50" :
                                                    normalized === 'archived' ? "text-slate-500 hover:bg-slate-50" :
                                                        normalized === 'outofstock' ? "text-rose-600 hover:bg-rose-50" :
                                                            "text-slate-600 text-opacity-70 hover:bg-slate-50";

                                    return (
                                        <TooltipProvider key={s} delayDuration={0}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="w-full">
                                                        <DropdownMenuItem
                                                            disabled={isDisabledOption}
                                                            className={cn(
                                                                "rounded-lg cursor-pointer py-1.5 px-3 text-[12px] font-bold transition-colors mb-0.5 last:mb-0 w-full",
                                                                isDisabledOption ? "bg-slate-100/50 text-slate-400 opacity-60" : colorCls
                                                            )}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isDisabledOption) {
                                                                    onUpdateStatus(combo.id, s, combo.name, normalizedStatus);
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2 w-full justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn(
                                                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                                                        normalized === 'published' ? "bg-emerald-500" :
                                                                            normalized === 'draft' ? "bg-amber-500" :
                                                                                normalized === 'hidden' ? "bg-blue-500" :
                                                                                    normalized === 'archived' ? "bg-slate-400" :
                                                                                        normalized === 'outofstock' ? "bg-rose-500" :
                                                                                            "bg-slate-300"
                                                                    )} />
                                                                    <span>{s}</span>
                                                                </div>
                                                                {isBlockedPublished && (
                                                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 italic">
                                                                        Locked
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </DropdownMenuItem>
                                                    </div>
                                                </TooltipTrigger>
                                                {isBlockedPublished && (
                                                    <TooltipContent
                                                        side="right"
                                                        className="bg-slate-900 text-white border-none text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl z-[100]"
                                                    >
                                                        Add variants to this combo before publishing.
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                },
            }),

            /* ── Actions ──────────────────────────────────────────── */
            columnHelper.display({
                id: "actions",
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => {
                    const combo = row.original
                    const isParent = row.depth === 0

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
        [onView, onEdit, onDelete, onDuplicate, onAddVariant, onUpdateStatus]
    )
}