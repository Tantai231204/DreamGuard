import { useMemo } from "react"
import { MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle, Package } from "lucide-react"
import { Link } from "react-router-dom"
import { SortableHeader } from "@/components/admin"
import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AdminTradeInRequest } from "../types"
import { STATUS_CONFIG } from "../data"

export const useResellColumns = () => {
    const columns: ColumnDef<AdminTradeInRequest>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
                            aria-label="Select all"
                            className="data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onChange={(e) => row.toggleSelected(e.target.checked)}
                            aria-label="Select row"
                            className="data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                        />
                    </div>
                ),
                size: 40,
                enableSorting: false,
            },
            {
                accessorKey: "id",
                enableSorting: true,
                sortingFn: "alphanumeric",
                header: ({ column }) => <SortableHeader column={column} label="ID" />,
                cell: ({ row }) => (
                    <Link 
                        to={`/admin/resell/${row.getValue("id")}`}
                        className="font-mono text-xs font-semibold text-[var(--color-primary)] hover:underline"
                    >
                        #{row.getValue("id")}
                    </Link>
                ),
                size: 80,
            },
            {
                accessorKey: "customer",
                enableSorting: true,
                sortingFn: (rowA, rowB) => {
                    return rowA.original.customer.name.localeCompare(rowB.original.customer.name)
                },
                header: ({ column }) => <SortableHeader column={column} label="Customer" />,
                cell: ({ row }) => {
                    const customer = row.original.customer
                    return (
                        <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 border border-gray-200">
                                <AvatarImage src={customer.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                                    {customer.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate max-w-[120px]">{customer.name}</div>
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: "items",
                enableSorting: false,
                header: () => <span className="font-semibold">Products</span>,
                cell: ({ row }) => {
                    const items = row.original.items
                    return (
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                                {items.slice(0, 2).map((item, i) => (
                                    <div
                                        key={item.productId}
                                        className="h-7 w-7 rounded-md bg-gray-100 border border-white shadow-sm overflow-hidden"
                                        style={{ zIndex: 2 - i }}
                                    >
                                        {item.productImage ? (
                                            <img
                                                src={item.productImage}
                                                alt={item.productName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Package className="h-3 w-3 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm text-gray-700 font-medium">
                                {items.length} {items.length === 1 ? "item" : "items"}
                            </span>
                        </div>
                    )
                },
            },
            {
                accessorKey: "totalEstimatedPrice",
                enableSorting: true,
                sortingFn: "basic",
                header: ({ column }) => <SortableHeader column={column} label="Value" />,
                cell: ({ row }) => {
                    const price = row.original.totalEstimatedPrice
                    if (price === 0) {
                        return <span className="text-gray-400 text-sm">—</span>
                    }
                    return (
                        <span className="font-semibold text-emerald-600 text-sm">
                            {price.toLocaleString("vi-VN")}₫
                        </span>
                    )
                },
            },
            {
                accessorKey: "status",
                enableSorting: true,
                header: ({ column }) => <SortableHeader column={column} label="Status" />,
                cell: ({ row }) => {
                    const status = row.original.status
                    const config = STATUS_CONFIG[status]
                    return (
                        <Badge
                            variant="outline"
                            className={`${config.bgColor} ${config.color} ${config.borderColor} border text-xs px-2 py-0.5`}
                        >
                            {config.label}
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "createdAt",
                enableSorting: true,
                sortingFn: "datetime",
                header: ({ column }) => <SortableHeader column={column} label="Date" />,
                cell: ({ row }) => {
                    const date = new Date(row.original.createdAt)
                    return (
                        <span className="text-sm text-gray-600">
                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                    )
                },
            },
            {
                id: "actions",
                header: () => null,
                cell: ({ row }) => {
                    const request = row.original
                    const hasPrice = request.totalEstimatedPrice > 0
                    const canShowApprove = ["pending", "reviewing"].includes(request.status)
                    const canApprove = canShowApprove && hasPrice
                    const canReject = ["pending", "reviewing"].includes(request.status)
                    const canComplete = request.status === "approved"

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild className="gap-2 cursor-pointer text-sm">
                                    <Link to={`/admin/resell/${request.id}`}>
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer text-sm">
                                    <Edit className="h-4 w-4" />
                                    Set Price
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {canShowApprove && (
                                    <DropdownMenuItem 
                                        disabled={!canApprove}
                                        className={`gap-2 cursor-pointer text-sm ${
                                            canApprove 
                                                ? "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50" 
                                                : "opacity-50 cursor-not-allowed"
                                        }`}
                                        title={!hasPrice ? "Must set price first" : ""}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Approve</span>
                                        {!hasPrice && <span className="text-xs ml-auto">(No price)</span>}
                                    </DropdownMenuItem>
                                )}
                                {canComplete && (
                                    <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-green-600 focus:text-green-600 focus:bg-green-50">
                                        <CheckCircle className="h-4 w-4" />
                                        Complete
                                    </DropdownMenuItem>
                                )}
                                {canReject && (
                                    <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-red-600 focus:text-red-600 focus:bg-red-50">
                                        <XCircle className="h-4 w-4" />
                                        Reject
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                },
                size: 44,
            },
        ],
        []
    )

    return columns
}
