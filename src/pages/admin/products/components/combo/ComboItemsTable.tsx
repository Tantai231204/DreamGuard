import React from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useComboDetail } from '@/hooks/queries/useCombo';

// Shared Sub-components & Utilities
import LeafItemsView from './LeafItemsView';
import { toComboItems } from './combo-utils';

// Refactored sub-components
import { ViewModeToggle } from './items-table/ViewModeToggle';
import { VariantTabsView } from './items-table/VariantTabsView';
import { VariantListView } from './items-table/VariantListView';
import { StatsGroup, DiscountBadge, LoadingSkeleton, ErrorState } from './items-table/StatsAndFeedback';

import type { ComboItem, Combo } from '../../types';

/* ──────────────────────────────────────────────────────────
   Main ComboItemsTable Orchestrator
────────────────────────────────────────────────────────── */

interface ComboItemsTableProps {
    comboId: string;
    items?: ComboItem[] | null;
    childCombos?: Combo[] | null;
    comboName: string;
    discount: number;
    onAddVariant?: (parent: Combo) => void;
    onEditVariant?: (variant: Combo) => void;
    onDeleteVariant?: (variant: Combo) => void;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    Published: { label: 'Published', className: 'bg-green-50 text-green-700 border-green-200' },
    Active: { label: 'Active', className: 'bg-green-50 text-green-700 border-green-200' },
    Draft: { label: 'Draft', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    Hidden: { label: 'Hidden', className: 'bg-gray-50 text-gray-500 border-gray-200' },
    OutOfStock: { label: 'Out of Stock', className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function ComboItemsTable({
    comboId,
    items: fallbackItems = [],
    childCombos: initialChildCombos = [],
    comboName,
    discount,
    onAddVariant,
    onEditVariant,
    onDeleteVariant,
}: ComboItemsTableProps) {
    const { data: detail, isLoading, isError } = useComboDetail(comboId);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [viewMode, setViewMode] = React.useState<'list' | 'tabs'>('tabs');

    /* ── Decide: parent with children, or leaf with own items ── */
    const childCombosFromStore = detail?.childCombos ?? [];
    const rawChildCombos: Combo[] = (childCombosFromStore.length > 0
        ? (childCombosFromStore as unknown as Combo[])
        : (initialChildCombos ?? [])) as Combo[];

    const childCombosFiltered = rawChildCombos.filter(c =>
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

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
                        <VariantTabsView
                            childCombos={childCombosFiltered}
                            onAddVariant={() => onAddVariant?.(detail as Combo)}
                            onEditVariant={onEditVariant}
                            onDeleteVariant={onDeleteVariant}
                            statusMap={STATUS_MAP}
                        />
                    ) : (
                        <VariantListView
                            childCombos={childCombosFiltered}
                            onEditVariant={onEditVariant}
                            onDeleteVariant={onDeleteVariant}
                            statusMap={STATUS_MAP}
                        />
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
