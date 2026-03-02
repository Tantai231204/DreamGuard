import { useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type ExpandedState,
  type PaginationState,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import {
  AdminTableSearch,
  AdminTablePagination,
  AdminBulkActions,
} from '@/components/admin';
import { LoadingSpinner } from '@/components/common';
import ProductActions from './components/ProductActions';
import ProductTableContent from './components/ProductTableContent';
import ProductDialog from './components/ProductDialog';
import VariantDialog from './components/VariantDialog';
import DeleteProductDialog from './components/DeleteProductDialog';
import ProductTabs from './components/ProductTabs';
import { useProductColumns } from './components/useProductColumns';
import { useComboColumns } from './components/useComboColumns';
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '@/hooks/queries/useProduct';
import { useCategories } from '@/hooks/queries/useCategory';
import type { Product, CreateProductRequest, ProductVariant, CreateVariantRequest } from './types';
import { INT_TO_STATUS, INT_TO_VARIANT_STATUS } from './types';
import { mockCombos } from './data';

export default function ProductsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'single' | 'combo'>('single');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // Variant dialog state
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantProductId, setVariantProductId] = useState<string>('');
  const [variantProductName, setVariantProductName] = useState<string>('');
  const [variantProductSlug, setVariantProductSlug] = useState<string>('');
  const [variantCount, setVariantCount] = useState<number>(0);

  // API queries — server-side paginated admin endpoint
  const { data: pageData, isLoading } = useAdminProducts({
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    name: globalFilter || undefined,
  });
  // Map API response to local Product type with proper status conversion
  const products: Product[] = useMemo(
    () =>
      (pageData?.items ?? []).map((item) => ({
        ...item,
        status: INT_TO_STATUS[item.status] || 'Active',
        variants: item.variants?.map((v) => ({
          ...v,
          status: INT_TO_VARIANT_STATUS[v.status] || 'Active',
        })),
      })),
    [pageData?.items]
  );
  const { data: categories = [] } = useCategories();

  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  // Variant Mutations
  const createVariantMutation = useCreateVariant();
  const updateVariantMutation = useUpdateVariant();
  const deleteVariantMutation = useDeleteVariant();

  // Handlers
  const handleAdd = useCallback(() => {
    setEditingProduct(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((product: Product) => {
    setDeleteProduct(product);
  }, []);

  // Variant handlers
  const handleAddVariant = useCallback((product: Product) => {
    setEditingVariant(null);
    setVariantProductId(product.id);
    setVariantProductName(product.name);
    setVariantProductSlug(product.slug);
    setVariantCount(product.variantCount ?? product.variants?.length ?? 0);
    setVariantDialogOpen(true);
  }, []);

  const handleAddVariantFromTable = useCallback((productId: string, productName: string, productSlug: string, count: number) => {
    setEditingVariant(null);
    setVariantProductId(productId);
    setVariantProductName(productName);
    setVariantProductSlug(productSlug);
    setVariantCount(count);
    setVariantDialogOpen(true);
  }, []);

  const handleEditVariant = useCallback((variant: ProductVariant) => {
    setEditingVariant(variant);
    setVariantProductId(variant.productId);
    // Find product from products list
    const product = products.find(p => p.id === variant.productId);
    setVariantProductName(product?.name || '');
    setVariantProductSlug(product?.slug || '');
    setVariantCount(product?.variantCount ?? product?.variants?.length ?? 0);
    setVariantDialogOpen(true);
  }, [products]);

  const handleDeleteVariant = useCallback((variant: ProductVariant) => {
    if (!confirm(`Are you sure you want to delete variant "${variant.sku}"?`)) return;
    deleteVariantMutation.mutate(variant.id, {
      onSuccess: () => {
        toast.success('Variant deleted', 'The variant has been successfully deleted.');
      },
    });
  }, [deleteVariantMutation, toast]);

  const handleVariantSubmit = useCallback(
    (data: CreateVariantRequest) => {
      if (editingVariant) {
        // Update existing variant
        const { productId, ...updateData } = data;
        updateVariantMutation.mutate(
          { id: editingVariant.id, data: updateData },
          {
            onSuccess: () => {
              setVariantDialogOpen(false);
              toast.success('Variant updated', 'The variant has been successfully updated.');
            },
          }
        );
      } else {
        // Create new variant
        createVariantMutation.mutate(data, {
          onSuccess: () => {
            setVariantDialogOpen(false);
            toast.success('Variant created', 'The new variant has been successfully created.');
          },
        });
      }
    },
    [editingVariant, createVariantMutation, updateVariantMutation, toast]
  );

  const handleSubmit = useCallback(
    (data: CreateProductRequest) => {
      if (editingProduct) {
        updateMutation.mutate(
          { id: editingProduct.id, data },
          {
            onSuccess: () => {
              setDialogOpen(false);
              toast.success('Product updated', 'The product has been successfully updated.');
            },
          }
        );
      } else {
        createMutation.mutate(data, {
          onSuccess: () => {
            setDialogOpen(false);
            toast.success('Product created', 'The new product has been successfully created.');
          },
        });
      }
    },
    [editingProduct, createMutation, updateMutation, toast]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deleteProduct) return;
    deleteMutation.mutate(deleteProduct.id, {
      onSuccess: () => {
        setDeleteProduct(null);
        toast.success('Product deleted', 'The product has been successfully deleted.');
      },
    });
  }, [deleteProduct, deleteMutation, toast]);

  const productColumns = useProductColumns({ onEdit: handleEdit, onDelete: handleDelete, onAddVariant: handleAddVariant });
  const comboColumns = useComboColumns();

  // Stats
  const stats = useMemo(() => {
    const total = pageData?.totalCount ?? 0;
    const active = products.filter((p) => p.status === 'Active').length;
    const inactive = products.filter((p) => p.status === 'Inactive').length;
    const draft = products.filter((p) => p.status === 'Draft').length;
    return { total, active, inactive, draft };
  }, [pageData?.totalCount, products]);

  const productTable = useReactTable({
    data: products,
    columns: productColumns,
    pageCount: pageData?.totalPages ?? -1,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
      expanded,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection: true,
    enableExpanding: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const comboTable = useReactTable({
    data: mockCombos,
    columns: comboColumns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
      expanded,
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    enableRowSelection: true,
    enableExpanding: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <AdminPageHeader
          title="Products"
          description="Manage your product catalog"
          icon={Package}
          stats={[]}
        />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }



  const headerStats = [
    { label: 'Total', value: stats.total },
    { label: 'Active', value: stats.active },
    { label: 'Inactive', value: stats.inactive },
    { label: 'Draft', value: stats.draft },
  ];

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title="Products"
        description="Manage your product catalog"
        icon={Package}
        stats={headerStats}
      />

      <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col"
        >
          <ProductTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            singleCount={pageData?.totalCount ?? 0}
            comboCount={mockCombos.length}
          >
            <div className="flex flex-col h-full overflow-hidden">
              {/* Bulk Actions */}
              <AdminBulkActions
                table={activeTab === 'single' ? productTable : (comboTable as any)}
                itemLabel={activeTab === 'single' ? 'product' : 'combo'}
                accentColor={activeTab === 'single' ? 'blue' : 'purple'}
                onEdit={() => console.log('Edit selected')}
                onDuplicate={() => console.log('Duplicate selected')}
                onDelete={() => console.log('Delete selected')}
              />

              {/* Actions Toolbar */}
              <ProductActions
                productType={activeTab}
                onAdd={handleAdd}
                onExport={() => console.log('Export')}
                onImport={() => console.log('Import')}
                onFilter={() => console.log('Filter')}
              />

              {/* Search */}
              <AdminTableSearch
                table={activeTab === 'single' ? productTable : (comboTable as any)}
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder={activeTab === 'single' ? 'Search products by name...' : 'Search combos...'}
                resultCount={activeTab === 'single' ? (pageData?.totalCount ?? 0) : mockCombos.length}
                resultLabel={activeTab === 'single' ? 'products' : 'combos'}
              />

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <ProductTableContent
                  table={activeTab === 'single' ? productTable : (comboTable as any)}
                  type={activeTab}
                  emptyMessage={activeTab === 'single' ? 'No products found' : 'No combos found'}
                  onAddVariant={handleAddVariantFromTable}
                  onEditVariant={handleEditVariant}
                  onDeleteVariant={handleDeleteVariant}
                />
              </div>

              {/* Pagination */}
              <AdminTablePagination
                table={activeTab === 'single' ? productTable : (comboTable as any)}
                itemLabel={activeTab === 'single' ? 'products' : 'combos'}
              />
            </div>
          </ProductTabs>
        </motion.div>
      </div>

      {/* Create / Edit Dialog */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        categories={categories}
      />

      {/* Delete Confirmation */}
      <DeleteProductDialog
        open={!!deleteProduct}
        onOpenChange={(open) => { if (!open) setDeleteProduct(null); }}
        productName={deleteProduct?.name ?? ''}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Variant Dialog */}
      <VariantDialog
        open={variantDialogOpen}
        onOpenChange={setVariantDialogOpen}
        variant={editingVariant}
        productId={variantProductId}
        productName={variantProductName}
        productSlug={variantProductSlug}
        variantCount={variantCount}
        onSubmit={handleVariantSubmit}
        isLoading={createVariantMutation.isPending || updateVariantMutation.isPending}
      />
    </div>
  );
}
