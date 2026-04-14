import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Table } from '@tanstack/react-table';
import { Package, TrendingUp, Filter, PlayCircle, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from '@/components/common/TableSkeleton';

import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { ProductTabs, useProductColumns } from './components/product-table';
import { useComboColumns } from './components/combo';
import { useCertificateColumns } from './components/certificate/useCertificateColumns';
import { AdminActions } from '@/components/admin';

// Refactored Hooks & Core Components
import { useAdminProductState } from './hooks/useAdminProductState';
import { useAdminProductMutations } from './hooks/useAdminProductMutations';
import { ProductDialogs } from './components/ProductDialogs';
import { ProductTableSection } from './components/ProductTableSection';
import { ComboTableSection } from './components/ComboTableSection';
import { CertificateTableSection } from './components/CertificateTableSection';
import { UserRole } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';

import type { Product, Combo, Certificate, ProductStatus } from './types';

export default function ProductsPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const canManageCertificates = role !== UserRole.MANAGER;

  // 1. Unified State Management
  const state = useAdminProductState();
  const {
    activeTab, setActiveTab, products, combos, certificates, productPageData, comboPageData, certPageData,
    isLoadingProducts, isLoadingCombos, isLoadingCerts
  } = state;
  const effectiveActiveTab = !canManageCertificates && activeTab === 'certificate' ? 'single' : activeTab;

  useEffect(() => {
    if (!canManageCertificates && activeTab === 'certificate') {
      setActiveTab('single');
    }
  }, [activeTab, canManageCertificates, setActiveTab]);

  const pageData = productPageData;

  // 2. Encapsulated Business Logic (Mutations)
  const mutations = useAdminProductMutations({ state });

  // 3. UI Handlers
  const handleAdd = useCallback(() => {
    if (effectiveActiveTab === 'certificate') {
      state.setEditingCert(null);
      state.setCertDialogOpen(true);
    } else {
      state.setComboIsCurrentUpload(effectiveActiveTab === 'combo');
      if (effectiveActiveTab === 'combo') {
        state.setEditingCombo(null);
        state.setComboDialogMode(null);
        state.setComboDialogKey((k: number = 0) => k + 1);
        state.setComboDialogOpen(true);
      } else {
        state.setEditingProduct(null);
        state.setDialogOpen(true);
      }
    }
  }, [effectiveActiveTab, state]);

  const handleExport = useCallback(() => {
    if (effectiveActiveTab === 'single') {
      mutations.handleExport('single', products, [], []);
    } else if (effectiveActiveTab === 'combo') {
      mutations.handleExport('combo', [], combos, []);
    } else if (effectiveActiveTab === 'certificate') {
      mutations.handleExport('certificate', [], [], certificates);
    }
  }, [effectiveActiveTab, products, combos, certificates, mutations]);

  // Table Column Definitions
  const productColumns = useProductColumns({
    onView: useCallback((p: Product) => navigate(`/admin/products/${p.id}`), [navigate]),
    onEdit: useCallback((p: Product) => { state.setEditingProduct(p); state.setDialogOpen(true); }, [state]),
    onDelete: useCallback((p: Product) => state.setDeleteProduct(p), [state]),
    onAddVariant: useCallback((p: Product) => {
      const isTemplate = !!p.fullyCustomizedProductType && p.fullyCustomizedProductType !== 'None';
      if (isTemplate) return;

      state.setEditingVariant(null);
      state.setVariantProductId(p.id);
      state.setVariantProductName(p.name);
      state.setVariantProductSlug(p.slug);
      state.setVariantProductType(p.fullyCustomizedProductType);
      state.setVariantCount(p.variantCount ?? p.variants?.length ?? 0);
      state.setVariantDialogOpen(true);
    }, [state]),
                    onUpdateStatus: useCallback((id: string, s: string, name?: string, cur?: string) => {
      mutations.handleStatusChangeRequest({
        id,
        name: name || 'Product',
        type: 'product',
        currentStatus: (cur || 'Draft') as ProductStatus,
        newStatus: s as ProductStatus,
      });
    }, [mutations]),
  });

  const handleUpdateStatus = useCallback((id: string, status: string, name?: string, cur?: string) => {
    mutations.handleStatusChangeRequest({
      id,
      name: name || 'Combo',
      type: 'combo',
      currentStatus: (cur || 'Draft') as ProductStatus,
      newStatus: status as ProductStatus,
    });
  }, [mutations]);

  const comboColumns = useComboColumns({
    onView: useCallback((c: Combo) => navigate(`/admin/products/combo/${c.id}`), [navigate]),
    onEdit: useCallback((c: Combo) => {
      state.setEditingCombo(c);
      state.setComboDialogMode(c.comboParentId ? 'variant' : 'parent');
      state.setComboDialogKey((k: number = 0) => k + 1);
      state.setComboDialogOpen(true);
    }, [state]),
    onDelete: useCallback((c: Combo) => state.setDeleteCombo(c), [state]),
    onAddVariant: useCallback((parent: Combo) => {
      state.setEditingCombo(null);
      state.setComboDialogMode('variant');
      state.setComboDefaultParentId(parent.id);
      state.setComboDialogKey((k: number = 0) => k + 1);
      state.setComboDialogOpen(true);
    }, [state]),
    onUpdateStatus: handleUpdateStatus,
  });

  const certificateColumns = useCertificateColumns({
    onEdit: useCallback((c: Certificate) => { state.setEditingCert(c); state.setCertDialogOpen(true); }, [state]),
    onDelete: useCallback((c: Certificate) => state.setDeleteCert(c), [state]),
  });

  // Calculate high-level stats based on ALL data available
  const stats = useMemo(() => {
    // Basic counts
    const singleTotal = pageData?.totalCount ?? products.length;
    const comboTotal = comboPageData?.totalCount ?? combos.length;
    const certTotal = certPageData?.totalCount ?? certificates.length;

    // Status counts from current page (best we have without specialized API)
    const published = products.filter(p => p.status === 'Published').length +
      combos.filter(c => c.status === 'Published').length;
    const outOfStock = products.filter(p => p.status === 'OutOfStock').length;
    const draft = products.filter(p => p.status === 'Draft').length +
      combos.filter(c => c.status === 'Draft').length;

    // Derived Lists
    const regularProducts = products.filter(p => !p.fullyCustomizedProductType || p.fullyCustomizedProductType === 'None');
    const customizableProducts = products.filter(p => p.fullyCustomizedProductType && p.fullyCustomizedProductType !== 'None');

    return {
      total: singleTotal + comboTotal,
      singleTotal: regularProducts.length, // Local count for regularity
      customizeTotal: customizableProducts.length,
      comboTotal,
      certTotal,
      published,
      outOfStock,
      draft,
      regularProducts,
      customizableProducts
    };
  }, [pageData, comboPageData, certPageData, products, combos, certificates]);

  // Optimization: Keep header visible while loading table data
  const isSyncing = isLoadingProducts || isLoadingCombos || isLoadingCerts;

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
              activeTab={effectiveActiveTab}
              onTabChange={setActiveTab}
              singleCount={stats.singleTotal}
              customizeCount={stats.customizeTotal}
              comboCount={stats.comboTotal}
              certCount={stats.certTotal}
              showCertificateTab={canManageCertificates}
              actions={
                <AdminActions
                  onAdd={handleAdd}
                  addLabel={effectiveActiveTab === 'customize' && stats.customizableProducts.length >= 3 && ['Mattresses', 'Pillows', 'Cribs'].every(t => stats.customizableProducts.some(p => p.fullyCustomizedProductType === t)) 
                    ? 'All Templates Created' 
                    : `Add ${effectiveActiveTab === 'single' ? 'Product' : effectiveActiveTab === 'customize' ? 'Template' : effectiveActiveTab === 'combo' ? 'Combo' : 'Certificate'}`}
                  addDisabled={effectiveActiveTab === 'customize' && ['Mattresses', 'Pillows', 'Cribs'].every(t => stats.customizableProducts.some(p => p.fullyCustomizedProductType === t))}
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
                      <TableSkeleton rows={8} columns={effectiveActiveTab === 'single' ? 7 : 6} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={effectiveActiveTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 flex flex-col min-h-0"
                    >
                      {effectiveActiveTab === 'single' ? (
                        <ProductTableSection
                          products={stats.regularProducts}
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
                          onBulkDelete={(table) => mutations.handleBulkDelete(table as unknown as Table<Product | Combo | Certificate>, 'single')}
                          onExport={handleExport}
                          onUpdateStatus={(id, s, name, cur) => {
                            mutations.handleStatusChangeRequest({
                              id,
                              name: name || 'Product',
                              type: 'product',
                              currentStatus: (cur || 'Draft') as ProductStatus,
                              newStatus: s as ProductStatus,
                            });
                          }}
                          hideHeaderActions
                        />
                      ) : effectiveActiveTab === 'customize' ? (
                        <ProductTableSection
                          products={stats.customizableProducts}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          columns={productColumns as any}
                          pageData={undefined} // Template list usually small, no separate pagination needed? 
                          state={state}
                          onSortingChange={state.setSorting}
                          onGlobalFilterChange={state.setGlobalFilter}
                          onColumnFiltersChange={state.setColumnFilters}
                          onRowSelectionChange={state.setRowSelection}
                          onExpandedChange={state.setExpanded}
                          onPaginationChange={state.setPagination}
                          onBulkDelete={(table) => mutations.handleBulkDelete(table as unknown as Table<Product | Combo | Certificate>, 'single')}
                          onExport={handleExport}
                          onUpdateStatus={(id, s, name, cur) => {
                            mutations.handleStatusChangeRequest({
                              id,
                              name: name || 'Customization Template',
                              type: 'product',
                              currentStatus: (cur || 'Draft') as ProductStatus,
                              newStatus: s as ProductStatus,
                            });
                          }}
                          hideHeaderActions
                        />
                      ) : effectiveActiveTab === 'combo' ? (
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
                          onBulkDelete={(table) => mutations.handleBulkDelete(table as unknown as Table<Product | Combo | Certificate>, 'combo')}
                          onExport={handleExport}
                          onUpdateStatus={handleUpdateStatus}
                          hideHeaderActions
                        />
                      ) : (
                        <CertificateTableSection
                          certificates={certificates}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          columns={certificateColumns as any}
                          pageData={certPageData}
                          state={state}
                          onSortingChange={state.setCertSorting}
                          onGlobalFilterChange={state.setCertGlobalFilter}
                          onPaginationChange={state.setCertPagination}
                          onRowSelectionChange={state.setCertRowSelection}
                          onBulkDelete={(table) => mutations.handleBulkDelete(table as unknown as Table<Product | Combo | Certificate>, 'certificate')}
                          onExport={handleExport}
                          onCreate={handleAdd}
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
