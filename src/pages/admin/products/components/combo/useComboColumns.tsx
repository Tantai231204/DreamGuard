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
import StatusSelectionDropdown from "./items-table/StatusSelectionDropdown"
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
import { normalizeStatus } from "../../types"
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
    onUpdateStatus?: (id: string, status: string, comboName?: string, currentStatus?: string, totalStock?: number, hasPublishedChild?: boolean) => void
}

export function useComboColumns(options: UseComboColumnsOptions = {}) {
    const { onView, onEdit, onDelete, onDuplicate, onAddVariant, onUpdateStatus } = options

    return useMemo(
        () => [
            /* ── Checkbox ─────────────────────────────────────────── */
            columnHelper.display({
                id: "select",
                header: ({ table }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
                            aria-label="Select all"
                            className="data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(checked) => row.toggleSelected(!!checked)}
                            aria-label="Select row"
                            className="data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                        />
                    </div>
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
                                    ? "bg-primary-50 border-primary-100 text-primary-500"
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
                                        <AdminStatusBadge status="Collection" type="info" dot={false} className="h-4.5 px-2 bg-primary-50 text-primary-600 border-primary-100" />
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

            /* ── Sales ────────────────────────────────────────────── */
            columnHelper.accessor("sales", {
                header: () => <div className="text-center">Sales</div>,
                cell: (info) => {
                    const sales = info.getValue() || 0;
                    return (
                        <div className="flex flex-col items-center">
                            <span className="text-[14px] font-black text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 min-w-[40px] text-center">
                                {sales.toLocaleString()}
                            </span>
                        </div>
                    );
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

                    // Robust Child Check: Look into all possible child containers (variants)
                    const variants = (combo.subRows || combo.childCombos || []);
                    const hasPublishedChild = variants.some((c: Combo) => normalizeStatus(c.status) === 'Published');

                    if (!onUpdateStatus) return <AdminStatusBadge status={normalizedStatus} />

                    return (
                        <StatusSelectionDropdown
                            id={combo.id}
                            name={combo.name}
                            status={normalizedStatus}
                            totalStock={combo.totalStock}
                            hasPublishedChild={hasPublishedChild}
                            onUpdateStatus={onUpdateStatus}
                            badgeLabel={isParent ? 'Collection' : 'Variant'}
                            align="start"
                        />
                    );
                },
            }),

            /* ── Actions ──────────────────────────────────────────── */
            columnHelper.display({
                id: "actions",
                header: () => <div className="text-right pr-4 uppercase text-[10px] font-black tracking-widest text-slate-400">Actions</div>,
                cell: ({ row }) => {
                    const combo = row.original
                    const isParent = row.depth === 0

                    return (
                        <div className="flex justify-end items-center gap-1 pr-2">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                {onView && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onView(combo);
                                        }}
                                        title="View Details"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                )}
                                {onEdit && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(combo);
                                        }}
                                        title="Edit Combo"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded hover:bg-slate-100 dropdown-trigger transition-colors"
                                    >
                                        <MoreVertical className="h-4 w-4 text-slate-400" />
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