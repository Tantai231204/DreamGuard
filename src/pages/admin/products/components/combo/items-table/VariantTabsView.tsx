import React from 'react';
import { Plus, SortAsc } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
} from '@tanstack/react-table';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AdminStatusBadge } from '@/components/admin';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ChildComboItems from '../ChildComboItems';
import { getColorHex } from '../combo-utils';
import { VariantActionDropdown } from './VariantActionDropdown';
import { EmptyResults } from './StatsAndFeedback';
import type { Combo } from '../../../types';

interface VariantTabsViewProps {
    childCombos: Combo[];
    onAddVariant?: () => void;
    onEditVariant?: (v: Combo) => void;
    onDeleteVariant?: (v: Combo) => void;
}

export function VariantTabsView({
    childCombos,
    onAddVariant,
    onEditVariant,
    onDeleteVariant,
}: VariantTabsViewProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [activeTab, setActiveTab] = React.useState(childCombos[0]?.id);

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

    if (childCombos.length === 0) return <EmptyResults />;

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex">
            {/* ── LEFT SIDEBAR ── */}
            <div className="w-[300px] border-r border-gray-100 bg-gray-50/30 flex flex-col">
                <div className="p-3 border-b border-gray-100 bg-white/50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Variants ({rows.length})
                        </span>
                        <span className="text-[9px] text-emerald-600 font-bold">● {rows.filter(r => r.original.status === 'Published').length} Published</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 w-7 p-0 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-all"
                            title="Add New Variant"
                            onClick={onAddVariant}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-4 bg-gray-200 mx-1" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[9px] font-black uppercase text-gray-400 hover:text-primary-600">
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
                                            ? 'border-primary-500/20 bg-white shadow-lg shadow-primary-500/5 ring-1 ring-primary-500/5'
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
                                                    ${isActive ? 'text-primary-600' : 'text-gray-700'}`}>
                                                    {child.name}
                                                </span>
                                            </div>
                                            <AdminStatusBadge 
                                                status={child.status} 
                                                className="h-4 px-1.5" 
                                            />
                                        </div>
                                        <div className="flex items-center justify-between w-full mt-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-[9px] text-gray-400 bg-gray-100/50 px-1 rounded truncate max-w-[80px]">
                                                    {child.sku}
                                                </span>
                                                {isWarning && <span className="text-[8px] text-red-500 font-black animate-bounce">! STOCK</span>}
                                            </div>
                                            <span className={`text-[10px] font-black ${isActive ? 'text-primary-600' : 'text-gray-800'}`}>
                                                {(child.salePrice || child.basePrice).toLocaleString('en-US')}₫
                                            </span>
                                        </div>
                                    </div>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary-500 rounded-r-full animate-in slide-in-from-left-full duration-300" />
                                    )}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </div>
            </div>

            {/* ── RIGHT CONTENT PANEL ── */}
            <div className="flex-1 bg-white flex flex-col min-h-[500px]">
                {childCombos.map(child => (
                    <TabsContent
                        key={child.id}
                        value={child.id}
                        className="m-0 border-0 outline-none flex-1 data-[state=inactive]:hidden animate-in fade-in slide-in-from-right-2 duration-300"
                    >
                        {/* Variant Detail Header */}
                        <div className="px-8 py-5 bg-gradient-to-r from-primary-50/10 to-white border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white border-2 border-primary-50 flex items-center justify-center shadow-sm">
                                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: getColorHex(child.color) }} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight">{child.name}</h3>
                                        <AdminStatusBadge status={child.status} />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 italic">Variant SKU: {child.sku}</p>
                                    {child.description && (
                                        <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 max-w-xl leading-relaxed">
                                            {child.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Current Value</p>
                                    <div className="text-lg font-black text-primary-600">{(child.salePrice || child.basePrice).toLocaleString('en-US')}₫</div>
                                </div>
                                <Separator orientation="vertical" className="h-10 bg-gray-100" />
                                <VariantActionDropdown
                                    variant={child}
                                    onEdit={onEditVariant}
                                    onDelete={onDeleteVariant}
                                />
                            </div>
                        </div>

                        {/* Constituent Items Configuration */}
                        <div className="p-8 bg-white/50">
                            <div className="mb-4 flex items-center justify-between">
                                <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Constituent Items Configuration</h5>
                                <span className="text-[10px] text-primary-500 font-bold bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
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
