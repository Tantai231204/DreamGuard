import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, Filter, PlayCircle, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from '@/components/common/TableSkeleton';

import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { ProductTabs, useProductColumns } from './components/product-table';
import { useComboColumns } from './components/combo';
import { AdminActions } from '@/components/admin';

// Refactored Hooks & Core Components
import { useAdminProductState } from './hooks/useAdminProductState';
import { useAdminProductMutations } from './hooks/useAdminProductMutations';
import { ProductDialogs } from './components/ProductDialogs';
import { ProductTableSection } from './components/ProductTableSection';
import { ComboTableSection } from './components/ComboTableSection';

import type { Product, Combo } from './types';

export default function ProductsPage() {
  const navigate = useNavigate();

  // 1. Unified State Management
  const state = useAdminProductState();
  const {
    activeTab, setActiveTab, products, combos, productPageData, comboPageData,
    isLoadingProducts, isLoadingCombos
  } = state;

  const pageData = productPageData;

  // 2. Encapsulated Business Logic (Mutations)
  const mutations = useAdminProductMutations({ state });

  // 3. UI Handlers
  const handleAdd = useCallback(() => {
    state.setComboIsCurrentUpload(activeTab === 'combo');
    if (activeTab === 'combo') {
      state.setEditingCombo(null);
      state.setComboDialogMode(null);
      state.setComboDialogKey((k: number) => k + 1);
      state.setComboDialogOpen(true);
    } else {
      state.setEditingProduct(null);
      state.setDialogOpen(true);
    }
  }, [activeTab, state]);

  const handleExport = useCallback(() => {
    if (activeTab === 'single') {
      mutations.handleExport('single', products, []);
    } else {
      mutations.handleExport('combo', [], combos);
    }
  }, [activeTab, products, combos, mutations]);

  // Table Column Definitions
  const productColumns = useProductColumns({
    onView: (p: Product) => navigate(`/admin/products/${p.id}`),
    onEdit: (p: Product) => { state.setEditingProduct(p); state.setDialogOpen(true); },
    onDelete: (p: Product) => state.setDeleteProduct(p),
    onAddVariant: (p: Product) => {
      state.setEditingVariant(null);
      state.setVariantProductId(p.id);
      state.setVariantProductName(p.name);
      state.setVariantProductSlug(p.slug);
      state.setVariantCount(p.variantCount ?? p.variants?.length ?? 0);
      state.setVariantDialogOpen(true);
    }
  });

  const comboColumns = useComboColumns({
    onView: (c: Combo) => navigate(`/admin/products/combo/${c.id}`),
    onEdit: (c: Combo) => {
      state.setEditingCombo(c);
      state.setComboDialogMode(c.comboParentId ? 'variant' : 'parent');
      state.setComboDialogKey((k: number) => k + 1);
      state.setComboDialogOpen(true);
    },
    onDelete: (c: Combo) => state.setDeleteCombo(c),
    onAddVariant: (parent: Combo) => {
      state.setEditingCombo(null);
      state.setComboDialogMode('variant');
      state.setComboDefaultParentId(parent.id);
      state.setComboDialogKey((k: number) => k + 1);
      state.setComboDialogOpen(true);
    }
  });

  // Calculate high-level stats based on ALL data available
  const stats = useMemo(() => {
    // Basic counts
    const singleTotal = pageData?.totalCount ?? products.length;
    const comboTotal = comboPageData?.totalCount ?? combos.length;

    // Status counts from current page (best we have without specialized API)
    const published = products.filter(p => p.status === 'Published').length +
      combos.filter(c => c.status === 'Published').length;
    const outOfStock = products.filter(p => p.status === 'OutOfStock').length;
    const draft = products.filter(p => p.status === 'Draft').length +
      combos.filter(c => c.status === 'Draft').length;

    return {
      total: singleTotal + comboTotal,
      singleTotal,
      comboTotal,
      published,
      outOfStock,
      draft
    };
  }, [pageData, comboPageData, products, combos]);

  // Optimization: Keep header visible while loading table data
  const isSyncing = isLoadingProducts || isLoadingCombos;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Dynamic Header with Stats Only */}
      {/* Dynamic Header with Stats */}
      <AdminPageHeader
        title="Inventory Catalog"
        description="Monitor and optimize your product distribution across single units and combo packages."
        icon={Package}
        stats={[
          { label: 'Total Catalog', value: stats.total, icon: TrendingUp },
          { label: 'Active Items', value: stats.published, icon: PlayCircle },
          { label: 'In Draft', value: stats.draft, icon: Archive },
          { label: 'Out of Stock', value: stats.outOfStock, icon: Filter },
        ]}
      />

      {/* Main Content Area with Modern Gradient BG */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="m-6 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40 flex flex-col h-[calc(100%-3rem)]"
        >
          <div className="p-0 flex-1 flex flex-col min-h-0">
            <ProductTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              singleCount={stats.singleTotal}
              comboCount={stats.comboTotal}
              actions={
                <AdminActions
                  onAdd={handleAdd}
                  addLabel={`Add ${activeTab === 'single' ? 'Product' : 'Combo'}`}
                  onExport={handleExport}
                  onFilter={() => { }}
                  onImport={() => { }}
                />
              }
            >
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
                <AnimatePresence mode="wait">
                  {isSyncing ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 h-full"
                    >
                      <TableSkeleton rows={8} columns={activeTab === 'single' ? 7 : 6} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 flex flex-col min-h-0"
                    >
                      {activeTab === 'single' ? (
                        <ProductTableSection
                          products={products}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          columns={productColumns as any}
                          pageData={pageData}
                          state={state}
                          onSortingChange={state.setSorting}
                          onGlobalFilterChange={state.setGlobalFilter}
                          onColumnFiltersChange={state.setColumnFilters}
                          onRowSelectionChange={state.setRowSelection}
                          onExpandedChange={state.setExpanded}
                          onPaginationChange={state.setPagination}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onBulkDelete={(table) => mutations.handleBulkDelete(table as any, 'single')}
                          onExport={handleExport}
                          hideHeaderActions
                        />
                      ) : (
                        <ComboTableSection
                          combos={combos}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          columns={comboColumns as any}
                          pageData={comboPageData}
                          state={state}
                          onSortingChange={state.setComboSorting}
                          onGlobalFilterChange={state.setComboGlobalFilter}
                          onRowSelectionChange={state.setComboRowSelection}
                          onExpandedChange={state.setComboExpanded}
                          onPaginationChange={state.setComboPagination}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onBulkDelete={(table) => mutations.handleBulkDelete(table as any, 'combo')}
                          onExport={handleExport}
                          hideHeaderActions
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ProductTabs>
          </div>
        </motion.div>
      </div>

      {/* Overlays & Sidebars */}
      <ProductDialogs
        state={state}
        mutations={mutations}
        onRefresh={mutations.handleConfirmBulkDelete}
      />
    </div>
  );
}
