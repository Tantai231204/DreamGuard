import React from 'react';
import { ShoppingBag, Plus, Search, LayoutGrid, ListFilter, MoreVertical, Edit, Copy, Trash2, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useComboDetail } from '@/hooks/queries/useCombo';

// Shared Sub-components & Utilities
import ChildComboItems from './ChildComboItems';
import LeafItemsView from './LeafItemsView';
import { getColorHex, toComboItems } from './combo-utils';

import type { ComboItem } from '../../types';
import type { ComboResponse } from '@/api/services/comboService';

/* ──────────────────────────────────────────────────────────
   Main ComboItemsTable Orchestrator
────────────────────────────────────────────────────────── */

interface ComboItemsTableProps {
    comboId: string;
    items?: ComboItem[] | null;
    childCombos?: ComboResponse[] | null;
    comboName: string;
    discount: number;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    Published: { label: 'Published', className: 'bg-green-50 text-green-700 border-green-200' },
    Active: { label: 'Active', className: 'bg-green-50 text-green-700 border-green-200' },
    Draft: { label: 'Draft', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    Hidden: { label: 'Hidden', className: 'bg-gray-50 text-gray-500 border-gray-200' },
    OutOfStock: { label: 'Out of Stock', className: 'bg-red-50 text-red-700 border-red-200' },
};

import { motion } from 'framer-motion';

export default function ComboItemsTable({
    comboId,
    items: fallbackItems = [],
    childCombos: initialChildCombos = [],
    comboName,
    discount,
}: ComboItemsTableProps) {
    const { data: detail, isLoading, isError } = useComboDetail(comboId);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [viewMode, setViewMode] = React.useState<'list' | 'tabs'>('tabs');

    /* ── Decide: parent with children, or leaf with own items ── */
    const childCombosFromStore = detail?.childCombos ?? [];
    const rawChildCombos: ComboResponse[] = (childCombosFromStore.length > 0
        ? childCombosFromStore
        : (initialChildCombos ?? [])) as ComboResponse[];

    const childCombos = rawChildCombos.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.color || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isParent = rawChildCombos.length > 0;

    // For leaf combos, use detail.items > fallbackItems
    const leafItems: ComboItem[] = isParent
        ? []
        : toComboItems(detail).length > 0
            ? toComboItems(detail)
            : (fallbackItems ?? []);

    // Statistics
    const totalVariants = rawChildCombos.length;
    const totalQty = isParent
        ? rawChildCombos.reduce((s, c) => s + (c.items ?? []).reduce((ss, i) => ss + i.quantity, 0), 0)
        : leafItems.reduce((s, i) => s + i.quantity, 0);

    /* ── Render States ────────────────────────────────────────── */
    if (isLoading) return <LoadingSkeleton />;
    if (isError) return <ErrorState />;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-gray-50/50 border-t-2 border-b-2 border-indigo-100/50 px-8 py-10 relative overflow-hidden"
        >
            {/* Background Decoration for "Nested" Feel */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            {/* Header Section - Clean & Focused */}
            <header className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-white border-2 border-indigo-100 flex items-center justify-center shadow-lg shadow-indigo-100/50 text-indigo-600">
                        <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-[19px] font-black text-gray-900 tracking-tight leading-none">
                            {isParent ? 'Combo Variants Catalog' : 'Constituent Product Items'}
                        </h4>
                        <div className="text-[11px] text-gray-400 mt-2 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                            Managing structure of <span className="bg-indigo-600/10 text-indigo-600 px-2 py-0.5 rounded-md text-[10px] font-black">{comboName}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    {isParent && (
                        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                    )}
                </div>
            </header>

            {/* Search Bar */}
            {isParent && (
                <div className="flex items-center gap-2 mb-4 bg-white p-2 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                    <Search className="h-4 w-4 text-gray-400 ml-2" />
                    <Input
                        placeholder={`Search through ${rawChildCombos.length} variants...`}
                        className="bg-transparent border-0 focus-visible:ring-0 text-sm h-8 py-0 shadow-none px-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            {/* Main Content Area */}
            <main className="bg-white rounded-2xl border-2 border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden min-h-[300px]">
                {isParent ? (
                    viewMode === 'tabs' ? (
                        <VariantTabsView childCombos={childCombos} />
                    ) : (
                        <VariantListView childCombos={childCombos} />
                    )
                ) : (
                    <div className="p-8 bg-white h-full">
                        <LeafItemsView comboId={comboId} items={leafItems} />
                    </div>
                )}
            </main>

            {/* Footer Statistics */}
            <footer className="mt-8 flex flex-wrap items-center justify-between border-t border-gray-100 pt-6">
                <StatsGroup variants={totalVariants} items={totalQty} isParent={isParent} />
                <DiscountBadge discount={discount} />
            </footer>
        </motion.div>
    );
}

/* ──────────────────────────────────────────────────────────
   Internal Presentational Components
────────────────────────────────────────────────────────── */

function ViewModeToggle({ mode, onChange }: { mode: 'list' | 'tabs', onChange: (m: 'list' | 'tabs') => void }) {
    return (
        <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg border border-gray-200 mr-2">
            <Button
                variant={mode === 'tabs' ? 'secondary' : 'ghost'}
                size="sm"
                className={`h-7 px-2 rounded-md transition-all ${mode === 'tabs' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => onChange('tabs')}
            >
                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-[10px] font-bold">Split View</span>
            </Button>
            <Button
                variant={mode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className={`h-7 px-2 rounded-md transition-all ${mode === 'list' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => onChange('list')}
            >
                <ListFilter className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-[10px] font-bold">List View</span>
            </Button>
        </div>
    );
}

import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
} from '@tanstack/react-table';
import { SortAsc } from 'lucide-react';

function VariantTabsView({ childCombos }: { childCombos: ComboResponse[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useReactTable({
        data: childCombos,
        columns: [
            { accessorKey: 'name', header: 'Name' },
            { accessorKey: 'sku', header: 'SKU' },
            { accessorKey: 'salePrice', header: 'Price' },
            { accessorKey: 'status', header: 'Status' },
        ],
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const rows = table.getRowModel().rows;
    const [activeTab, setActiveTab] = React.useState(childCombos[0]?.id);

    if (childCombos.length === 0) return <EmptyResults />;

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex">
            <div className="w-[300px] border-r border-gray-100 bg-gray-50/30 flex flex-col">
                {/* Side Header with Sort Controls */}
                <div className="p-3 border-b border-gray-100 bg-white/50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Variants ({rows.length})
                        </span>
                        <span className="text-[9px] text-emerald-600 font-bold">● {rows.filter(r => r.original.status === 'Active').length} Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 w-7 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all"
                            title="Add New Variant"
                            onClick={() => console.log('Quick Add Variant')}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-4 bg-gray-200 mx-1" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[9px] font-black uppercase text-gray-400 hover:text-indigo-600">
                                    <SortAsc className="h-3 w-3 mr-1" />
                                    Sort
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-32 rounded-xl shadow-xl border-2">
                                <DropdownMenuItem onClick={() => setSorting([{ id: 'name', desc: false }])} className="text-[11px] font-bold">Name (A-Z)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSorting([{ id: 'salePrice', desc: false }])} className="text-[11px] font-bold">Lowest Price</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSorting([{ id: 'salePrice', desc: true }])} className="text-[11px] font-bold">Highest Price</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSorting([])} className="text-[11px] font-bold text-red-500">Reset</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-200 p-2 gap-1 bg-gray-50/10">
                    <TabsList className="flex flex-col h-auto w-full bg-transparent gap-1.5">
                        {rows.map(row => {
                            const child = row.original;
                            const isActive = activeTab === child.id;
                            const isWarning = child.status === 'OutOfStock' || (child.totalStock ?? 0) < 5;

                            return (
                                <TabsTrigger
                                    key={child.id}
                                    value={child.id}
                                    className={`w-full justify-start px-3 py-3 rounded-xl border-2 transition-all group relative overflow-hidden text-left
                                        ${isActive
                                            ? 'border-indigo-500/20 bg-white shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/5'
                                            : 'border-transparent hover:bg-white/60 hover:border-gray-200'}`}
                                >
                                    <div className="flex flex-col items-start gap-1.5 w-full">
                                        <div className="flex items-center gap-2 w-full justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ring-2 ring-white shadow-inner transition-transform duration-300 ${isActive ? 'scale-125' : ''}`}
                                                        style={{ backgroundColor: getColorHex(child.color) }}
                                                    />
                                                    {isWarning && (
                                                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white animate-pulse" />
                                                    )}
                                                </div>
                                                <span className={`text-[12px] font-black tracking-tight truncate max-w-[140px] transition-colors
                                                    ${isActive ? 'text-indigo-600' : 'text-gray-700'}`}>
                                                    {child.name}
                                                </span>
                                            </div>
                                            <Badge className={`text-[8px] font-black px-1.5 h-3.5 border-none shadow-none uppercase ${STATUS_MAP[child.status]?.className}`}>
                                                {child.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between w-full mt-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-[9px] text-gray-400 bg-gray-100/50 px-1 rounded truncate max-w-[80px]">
                                                    {child.sku}
                                                </span>
                                                {isWarning && <span className="text-[8px] text-red-500 font-black animate-bounce">! STOCK</span>}
                                            </div>
                                            <span className={`text-[10px] font-black ${isActive ? 'text-indigo-600' : 'text-gray-800'}`}>
                                                {(child.salePrice || child.basePrice).toLocaleString('vi-VN')}đ
                                            </span>
                                        </div>
                                    </div>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full animate-in slide-in-from-left-full duration-300" />
                                    )}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </div>
            </div>

            <div className="flex-1 bg-white flex flex-col min-h-[500px]">
                {childCombos.map(child => (
                    <TabsContent
                        key={child.id}
                        value={child.id}
                        className="m-0 border-0 outline-none flex-1 data-[state=inactive]:hidden animate-in fade-in slide-in-from-right-2 duration-300"
                    >
                        {/* Tab header detail */}
                        <div className="px-8 py-5 bg-gradient-to-r from-indigo-50/30 to-white border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white border-2 border-indigo-100 flex items-center justify-center shadow-sm">
                                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: getColorHex(child.color) }} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight">{child.name}</h3>
                                        <Badge variant="outline" className="bg-indigo-500 text-white border-none font-black text-[9px] h-4">ACTIVE</Badge>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 italic">Variant SKU: {child.sku}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Current Value</p>
                                    <div className="text-lg font-black text-indigo-600">{(child.salePrice || child.basePrice).toLocaleString('vi-VN')}đ</div>
                                </div>
                                <Separator orientation="vertical" className="h-10 bg-gray-100" />
                                <VariantActionDropdown variant={child} />
                            </div>
                        </div>

                        <div className="p-8 bg-white/50">
                            <div className="mb-4 flex items-center justify-between">
                                <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Constituent Items Configuration</h5>
                                <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                    {child.items?.length || 0} Products Included
                                </span>
                            </div>
                            <ChildComboItems childId={child.id} childName={child.name} parentChildData={child} />
                        </div>
                    </TabsContent>
                ))}
            </div>
        </Tabs>
    );
}

function VariantListView({ childCombos }: { childCombos: ComboResponse[] }) {
    if (childCombos.length === 0) return <EmptyResults />;

    return (
        <div className="divide-y-4 divide-gray-50">
            {childCombos.map((child, idx) => (
                <div key={child.id} className={`p-6 transition-all hover:bg-white ${idx % 2 === 0 ? 'bg-gray-50/20' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-md ring-1 ring-gray-100"
                                style={{ backgroundColor: getColorHex(child.color) }}
                            >
                                <span className="text-[10px] font-black mix-blend-difference text-white">{child.size || 'N/A'}</span>
                            </div>
                            <div>
                                <h5 className="text-sm font-black text-gray-800 leading-none">{child.name}</h5>
                                <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-widest">{child.sku}</p>
                            </div>
                            <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_MAP[child.status]?.className}`}>
                                {child.status}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-gray-900 leading-none">{(child.salePrice || child.basePrice).toLocaleString('vi-VN')}đ</div>
                            <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-tighter">Base: {child.basePrice.toLocaleString('vi-VN')}đ</p>
                        </div>
                    </div>
                    <ChildComboItems childId={child.id} childName={child.name} parentChildData={child} isDense />
                </div>
            ))}
        </div>
    );
}

function VariantActionDropdown({ variant }: { variant: ComboResponse }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-xl border-2 rounded-xl border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => console.log('View', variant.id)}>
                    <Eye className="h-3.5 w-3.5 mr-2.5 text-blue-500" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => console.log('Edit', variant.id)}>
                    <Edit className="h-3.5 w-3.5 mr-2.5 text-gray-600" />
                    Edit Variant
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => console.log('Duplicate', variant.id)}>
                    <Copy className="h-3.5 w-3.5 mr-2.5 text-emerald-500" />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer py-2 text-red-600 font-bold focus:bg-red-50 focus:text-red-700" onClick={() => console.log('Delete', variant.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2.5" />
                    Delete Variant
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function StatsGroup({ variants, items, isParent }: { variants: number, items: number, isParent: boolean }) {
    return (
        <div className="flex items-center gap-8">
            <StatItem label="Configuration" value={`${variants} ${isParent ? 'Variants' : 'Items'}`} icon={<LayoutGrid className="h-3 w-3" />} color="indigo" />
            <StatItem label="Total Inventory" value={`${items} Units Total`} icon={<ShoppingBag className="h-3 w-3" />} color="purple" />
        </div>
    );
}

function StatItem({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: 'indigo' | 'purple' }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2">
                <div className={`h-5 w-5 rounded-md bg-${color}-50 text-${color}-500 flex items-center justify-center border border-${color}-100`}>
                    {icon}
                </div>
                <span className="text-xs font-bold text-gray-700">{value}</span>
            </div>
        </div>
    );
}

function DiscountBadge({ discount }: { discount: number }) {
    if (discount <= 0) return <p className="text-[10px] text-gray-400 italic">Static pricing model</p>;

    return (
        <div className="bg-gradient-to-br from-orange-400 to-red-500 p-[1px] rounded-xl shadow-lg shadow-orange-500/20">
            <div className="bg-white/95 px-4 py-2 rounded-[11px] flex items-center gap-3">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-tight">Active Promo</span>
                <Separator orientation="vertical" className="h-4 bg-orange-100" />
                <span className="text-sm font-black text-gray-900">
                    SAVE {discount}% <span className="text-xs font-bold text-gray-400 ml-1 uppercase">Off</span>
                </span>
            </div>
        </div>
    );
}

function EmptyResults() {
    return (
        <div className="p-12 text-center">
            <p className="text-xs text-gray-400 italic">No variants match your filter criteria.</p>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="bg-[#fafafa] border-t border-b border-gray-100 px-8 py-6 space-y-3">
            <div className="flex items-center gap-3 mb-5">
                <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
                <Skeleton className="h-5 w-48 bg-gray-200" />
                <Skeleton className="h-5 w-16 bg-gray-100 rounded-full" />
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-4">
                <Skeleton className="h-[200px] w-full rounded-xl bg-gray-100" />
                <Skeleton className="h-[200px] w-full rounded-xl bg-gray-100" />
            </div>
        </div>
    );
}

function ErrorState() {
    return (
        <div className="bg-[#fafafa] border-t border-b border-gray-100 px-8 py-6 text-center">
            <p className="text-sm text-red-500 font-medium">Failed to load combo items.</p>
        </div>
    );
}
