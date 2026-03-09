import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  type Table,
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
import { ProductActions, ProductTableContent, ProductTabs, useProductColumns } from './components/product-table';
import ProductDialog from './components/product-dialog';
import { VariantDialog } from './components/variant-dialog';
import type { VariantFormData } from './components/variant-dialog/VariantDialog';
import { DeleteProductDialog, ImageUploadDialog, ProductCreationSuccess } from './components/dialogs';
import { useComboColumns, mapCombosToSubRows } from './components/combo';
import { ComboDialog, type ComboDialogMode } from './components/combo-dialog';
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useUpdateProductStatus,
  useDeleteProduct,
  useUploadProductImages,
  useCreateVariant,
  useUpdateVariant,
  useUpdateVariantStatus,
  useDeleteVariant,
} from '@/hooks/queries/useProduct';
import {
  useAdminCombos,
  useCreateCombo,
  useUpdateCombo,
  useDeleteCombo,
  useUpdateComboItems,
  useUploadComboImage,
} from '@/hooks/queries/useCombo';
import { useCategories } from '@/hooks/queries/useCategory';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductVariant,
  Combo,
  ProductStatus,
  VariantStatus,
} from './types';
export default function ProductsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'single' | 'combo'>('single');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  // Combo table state (separate from product)
  const [comboPagination, setComboPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [comboGlobalFilter, setComboGlobalFilter] = useState('');
  const [comboSorting, setComboSorting] = useState<SortingState>([]);
  const [comboRowSelection, setComboRowSelection] = useState<RowSelectionState>({});
  const [comboExpanded, setComboExpanded] = useState<ExpandedState>({});

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // Combo dialog state
  const [deleteCombo, setDeleteCombo] = useState<Combo | null>(null);
  const [comboDialogOpen, setComboDialogOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [comboDialogMode, setComboDialogMode] = useState<ComboDialogMode | undefined>(undefined);
  const [comboDialogKey, setComboDialogKey] = useState(0);
  const [comboDefaultParentId, setComboDefaultParentId] = useState<string | undefined>(undefined);

  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<string>('');
  const [createdProductName, setCreatedProductName] = useState<string>('');

  // Image upload dialog state
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [uploadProductId, setUploadProductId] = useState<string>('');
  const [uploadProductName, setUploadProductName] = useState<string>('');
  const [comboIsCurrentUpload, setComboIsCurrentUpload] = useState(false);
  // Use ref to always have the latest product ID (avoids stale closure)
  const uploadProductIdRef = useRef<string>('');

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
        status: (item.status as ProductStatus) || 'Draft',
        ageGroup: item.ageGroup !== null ? String(item.ageGroup) : null,
        variants: item.variants?.map((v) => ({
          ...v,
          status: (v.status as VariantStatus) || 'Published',
        })),
      })),
    [pageData?.items]
  );
  // Combo API queries
  const { data: comboPageData, isLoading: isLoadingCombos } = useAdminCombos({
    pageNumber: comboPagination.pageIndex + 1,
    pageSize: comboPagination.pageSize,
    name: comboGlobalFilter || undefined,
  });

  // Map API combo response to local Combo type, grouped as parent → children
  // Then convert `children` → `subRows` so TanStack Table can natively expand them
  const combos: Combo[] = useMemo(() => {
    const rawItems = comboPageData?.items ?? [];

    const mapItem = (item: import('@/api/services/comboService').ComboResponse, parentId?: string): Combo => ({
      ...item,
      type: 'combo' as const,
      baseSalePrice: item.salePrice,
      status: (item.status as ProductStatus) || 'Draft',
      comboParentId: item.comboParentId || parentId,
      color: item.color,
      size: item.size,
      childCombos: item.childCombos?.map((child: import('@/api/services/comboService').ComboResponse) => mapItem(child, item.id)) ?? [],
    });

    const allMapped = rawItems.map(item => mapItem(item));

    // 1. Map for quick lookup
    const idMap = new Map<string, Combo>();
    allMapped.forEach(c => idMap.set(c.id, c));

    // 2. Identify all IDs that are already nested as children somewhere in this result set
    const childIdsNested = new Set<string>();
    const collectNestedIds = (items: Combo[]) => {
      items.forEach(c => {
        c.childCombos?.forEach((child: Combo) => {
          childIdsNested.add(child.id);
          if (child.childCombos?.length) collectNestedIds(child.childCombos);
        });
      });
    };
    collectNestedIds(allMapped);

    // 3. Build hierarchy: Move orphans to their parents if the parent is present in the list
    const finalRootItems: Combo[] = [];
    allMapped.forEach(c => {
      // If this item is already nested inside another item in the list, skip it as a root item
      if (childIdsNested.has(c.id)) return;

      // If it's a variant but its parent is also in the list, try to attach it 
      // (This handles cases where the API returns a flat list with duplicates)
      if (c.comboParentId) {
        const parent = idMap.get(c.comboParentId);
        if (parent) {
          const alreadyExists = parent.childCombos?.some(child => child.id === c.id);
          if (!alreadyExists) {
            parent.childCombos = [...(parent.childCombos || []), c];
          }
          return; // Don't add to root
        }
      }

      finalRootItems.push(c);
    });

    return mapCombosToSubRows(finalRootItems);
  }, [comboPageData?.items]);

  const { data: categories = [] } = useCategories();

  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const updateProductStatusMutation = useUpdateProductStatus();
  const deleteMutation = useDeleteProduct();
  const uploadImagesMutation = useUploadProductImages();

  // Variant Mutations
  const createVariantMutation = useCreateVariant();
  const updateVariantMutation = useUpdateVariant();
  const deleteVariantMutation = useDeleteVariant();

  // Combo Mutations
  const createComboMutation = useCreateCombo();
  const updateComboMutation = useUpdateCombo();
  const deleteComboMutation = useDeleteCombo();
  const updateComboItemsMutation = useUpdateComboItems();
  const uploadComboImageMutation = useUploadComboImage();

  // Handlers
  const handleAdd = useCallback(() => {
    setComboIsCurrentUpload(activeTab === 'combo');
    if (activeTab === 'combo') {
      setEditingCombo(null);
      setComboDialogMode(undefined); // show mode selection screen
      setComboDefaultParentId(undefined);
      setComboDialogKey((k) => k + 1);
      setComboDialogOpen(true);
    } else {
      setEditingProduct(null);
      setDialogOpen(true);
    }
  }, [activeTab]);

  const handleEdit = useCallback((product: Product) => {
    setComboIsCurrentUpload(false);
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

  const updateVariantStatusMutation = useUpdateVariantStatus();

  const handleVariantSubmit = useCallback(
    async (formData: VariantFormData & { status: VariantStatus; stockStatus: string }) => {
      // Destructure to separate core data from status fields
      const { status, ...bodyData } = formData;

      try {
        if (editingVariant) {
          // 1. Update core info (sku, prices, weight, attributes, productid)
          await updateVariantMutation.mutateAsync({ id: editingVariant.id, data: bodyData });

          // 2. Parallel status updates if changed
          const statusPromises: Promise<unknown>[] = [];

          if (status !== editingVariant.status) {
            statusPromises.push(updateVariantStatusMutation.mutateAsync({ variantId: editingVariant.id, status }));
          }

          if (statusPromises.length > 0) {
            await Promise.all(statusPromises);
          }

          setVariantDialogOpen(false);
          toast.success('Variant updated', 'The variant and its status have been updated.');
        } else {
          // 3. Create new variant
          const newVariant = await createVariantMutation.mutateAsync(bodyData);

          // 4. Update status for the newly created variant if it's not default
          // (Assuming create doesn't set status based on screenshots)
          const statusPromises: Promise<unknown>[] = [];
          statusPromises.push(updateVariantStatusMutation.mutateAsync({ variantId: newVariant.id, status }));

          await Promise.all(statusPromises);

          setVariantDialogOpen(false);
          toast.success('Variant created', 'The new variant has been successfully created.');
        }
      } catch (error) {
        console.error('Variant submission failed:', error);
      }
    },
    [editingVariant, createVariantMutation, updateVariantMutation, updateVariantStatusMutation, toast]
  );

  const handleSubmit = useCallback(
    async (data: CreateProductRequest) => {
      if (editingProduct) {
        try {
          // Prepare parallel updates
          const promises: Promise<unknown>[] = [];

          // 1. General info update (matches PUT /api/product body in screenshot)
          const updatePayload: UpdateProductRequest = {
            id: editingProduct.id,
            name: data.name,
            slug: data.slug,
            summary: data.summary,
            description: data.description,
            material: data.material,
            // status is handled by a separate API if changed
            ageGroup: data.ageGroup || null,
            warrantyPolicyDay: data.warrantyPolicyDay ? Number(data.warrantyPolicyDay) : null,
            returnPolicyDay: data.returnPolicyDay ? Number(data.returnPolicyDay) : null,
            cateId: data.cateId ? Number(data.cateId) : null,
          };
          promises.push(updateMutation.mutateAsync(updatePayload));

          // 2. Status update if changed (matches PUT /api/product/{id}?status=Value)
          if (data.status !== editingProduct.status) {
            promises.push(
              updateProductStatusMutation.mutateAsync({
                productId: editingProduct.id,
                status: data.status,
              })
            );
          }

          await Promise.all(promises);

          setDialogOpen(false);
          toast.success('Product updated', 'The product has been successfully updated.');
        } catch (error) {
          console.error('[UpdateProduct] parallel error:', error);
        }
      } else {
        try {
          const response = await createMutation.mutateAsync(data);
          console.log('[CreateProduct] response:', JSON.stringify(response));
          setDialogOpen(false);
          toast.success('Product created', 'The new product has been successfully created.');

          // response.id is resolved by productService (from header or re-fetch by name)
          const productId = response?.id;
          const productName = response?.name || data.name;
          console.log('[CreateProduct] productId:', productId, 'productName:', productName);

          uploadProductIdRef.current = productId ?? '';
          setCreatedProductId(productId ?? '');
          setCreatedProductName(productName);
          setSuccessDialogOpen(true);
        } catch (error) {
          console.error('[CreateProduct] Error:', error);
        }
      }
    },
    [editingProduct, createMutation, updateMutation, updateProductStatusMutation, toast]
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

  const handleUploadImages = useCallback(
    async (productId: string, files: File[]) => {
      // Use ref as fallback in case prop is stale
      const id = productId || uploadProductIdRef.current;
      if (!id || files.length === 0) {
        console.error('[Upload] Aborted — missing id or files', { id, filesCount: files.length });
        return;
      }

      console.log('[Upload] Calling API for product:', id, 'files:', files.length);

      try {
        await uploadImagesMutation.mutateAsync({ productId: id, files });
        setImageUploadOpen(false);
        toast.success('Images uploaded', 'Product images have been successfully uploaded.');
      } catch (error) {
        console.error('[Upload] Error:', error);
      }
    },
    [uploadImagesMutation, toast]
  );

  // Handler for success dialog - Add Images
  const handleAddImagesFromSuccess = useCallback(() => {
    const id = uploadProductIdRef.current || createdProductId;
    console.log('[AddImages] ref:', uploadProductIdRef.current, 'state:', createdProductId, 'using:', id);
    setSuccessDialogOpen(false);
    setUploadProductId(id);
    setUploadProductName(createdProductName);
    setImageUploadOpen(true);
  }, [createdProductId, createdProductName]);

  // Handler for success dialog - Skip
  const handleSkipImages = useCallback(() => {
    setSuccessDialogOpen(false);
    setCreatedProductId('');
    setCreatedProductName('');
  }, []);

  const navigate = useNavigate();
  const handleViewDetail = useCallback((product: Product) => {
    navigate(`/admin/products/${product.id}`);
  }, [navigate]);

  // ── Combo handlers ─────────────────────────────────────
  const handleViewCombo = useCallback((combo: Combo) => {
    navigate(`/admin/products/combo/${combo.id}`);
  }, [navigate]);

  const handleEditCombo = useCallback((combo: Combo) => {
    setComboIsCurrentUpload(true);
    setEditingCombo(combo);
    setComboDialogMode(combo.comboParentId ? 'variant' : 'parent');
    setComboDefaultParentId(undefined);
    setComboDialogKey((k) => k + 1);
    setComboDialogOpen(true);
  }, []);

  const handleAddComboVariant = useCallback((parent: Combo) => {
    setComboIsCurrentUpload(true);
    setEditingCombo(null);
    setComboDialogMode('variant');
    setComboDefaultParentId(parent.id);
    setComboDialogKey((k) => k + 1);
    setComboDialogOpen(true);
  }, []);

  const handleDeleteCombo = useCallback((combo: Combo) => {
    setDeleteCombo(combo);
  }, []);

  const handleConfirmDeleteCombo = useCallback(() => {
    if (!deleteCombo) return;
    deleteComboMutation.mutate(deleteCombo.id, {
      onSuccess: () => {
        setDeleteCombo(null);
        toast.success('Combo deleted', 'The combo has been successfully deleted.');
      },
    });
  }, [deleteCombo, deleteComboMutation, toast]);

  // Combo Handlers
  const handleUploadComboImages = useCallback(
    async (comboId: string, files: File[]) => {
      const id = comboId || uploadProductIdRef.current;
      if (!id || files.length === 0) return;

      try {
        await uploadComboImageMutation.mutateAsync({ comboId: id, files });
        setImageUploadOpen(false);
        toast.success('Images uploaded', 'Combo images have been successfully uploaded.');
      } catch (error) {
        console.error('[UploadCombo] Error:', error);
      }
    },
    [uploadComboImageMutation, toast]
  );

  const handleComboSubmit = useCallback(
    async (data: import('@/api/services/comboService').CreateComboRequest) => {
      if (editingCombo) {
        try {
          // Destructure items from data so we can update info and items separately
          const { items, ...infoData } = data;

          const promises: Promise<unknown>[] = [];

          // 1. Update Combo Info
          promises.push(updateComboMutation.mutateAsync({ id: editingCombo.id, data: infoData }));

          // 2. Update Combo Line Items securely inside a separate endpoint
          if (items && items.length > 0) {
            promises.push(updateComboItemsMutation.mutateAsync({ id: editingCombo.id, items }));
          }

          await Promise.all(promises);

          setComboDialogOpen(false);
          toast.success('Combo updated', 'The combo has been successfully updated.');
        } catch (error) {
          console.error('[UpdateCombo] Update failed', error);
          toast.error('Update failed', 'There was an error updating the combo. Please check the information and try again.');
        }
      } else {
        createComboMutation.mutate(data, {
          onSuccess: (response) => {
            const id = response?.id;
            const name = response?.name || data.name;

            uploadProductIdRef.current = id ?? '';
            setCreatedProductId(id ?? '');
            setCreatedProductName(name);
            setComboDialogOpen(false);
            setSuccessDialogOpen(true);
            setComboIsCurrentUpload(true); // Flag to know if we should use combo upload endpoint
          },
        });
      }
    },
    [editingCombo, createComboMutation, updateComboMutation, updateComboItemsMutation, toast]
  );



  const productColumns = useProductColumns({ onView: handleViewDetail, onEdit: handleEdit, onDelete: handleDelete, onAddVariant: handleAddVariant });
  const comboColumns = useComboColumns({
    onView: handleViewCombo,
    onEdit: handleEditCombo,
    onDelete: handleDeleteCombo,
    onAddVariant: handleAddComboVariant,
  });

  // Stats
  const stats = useMemo(() => {
    const total = pageData?.totalCount ?? 0;
    const published = products.filter((p) => p.status === 'Published').length;
    const outOfStock = products.filter((p) => p.status === 'OutOfStock').length;
    const draft = products.filter((p) => p.status === 'Draft').length;
    const hidden = products.filter((p) => p.status === 'Hidden').length;
    return { total, published, outOfStock, draft, hidden };
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
    data: combos,
    columns: comboColumns,
    pageCount: comboPageData?.totalPages ?? -1,
    state: {
      sorting: comboSorting,
      globalFilter: comboGlobalFilter,
      rowSelection: comboRowSelection,
      expanded: comboExpanded,
      pagination: comboPagination,
    },
    onSortingChange: setComboSorting,
    onGlobalFilterChange: setComboGlobalFilter,
    onRowSelectionChange: setComboRowSelection,
    onExpandedChange: setComboExpanded,
    onPaginationChange: setComboPagination,
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection: true,
    enableExpanding: true,
    // All combos can expand to show their ComboItemsTable
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });


  const activeTable = activeTab === 'single'
    ? productTable
    : (comboTable as unknown as Table<Product>);

  // Loading state
  if (isLoading || isLoadingCombos) {
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
    { label: 'Published', value: stats.published },
    { label: 'Out of Stock', value: stats.outOfStock },
    { label: 'Draft', value: stats.draft },
    { label: 'Hidden', value: stats.hidden },
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
            comboCount={comboPageData?.totalCount ?? 0}
          >
            <div className="flex flex-col h-full overflow-hidden">
              {/* Bulk Actions */}
              <AdminBulkActions
                table={activeTable}
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
                table={activeTable}
                value={activeTab === 'single' ? globalFilter : comboGlobalFilter}
                onChange={activeTab === 'single' ? setGlobalFilter : setComboGlobalFilter}
                placeholder={activeTab === 'single' ? 'Search products by name...' : 'Search combos...'}
                resultCount={activeTab === 'single' ? (pageData?.totalCount ?? 0) : (comboPageData?.totalCount ?? 0)}
                resultLabel={activeTab === 'single' ? 'products' : 'combos'}
              />

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <ProductTableContent
                  table={activeTable}
                  type={activeTab}
                  emptyMessage={activeTab === 'single' ? 'No products found' : 'No combos found'}
                  onAddVariant={handleAddVariantFromTable}
                  onEditVariant={handleEditVariant}
                  onDeleteVariant={handleDeleteVariant}
                  onAddComboVariant={handleAddComboVariant}
                  onEditCombo={handleEditCombo}
                  onDeleteCombo={handleDeleteCombo}
                />
              </div>


              {/* Pagination */}
              <AdminTablePagination
                table={activeTable}
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

      {/* Product Creation Success */}
      <ProductCreationSuccess
        open={successDialogOpen}
        onOpenChange={setSuccessDialogOpen}
        productName={createdProductName}
        onAddImages={handleAddImagesFromSuccess}
        onSkip={handleSkipImages}
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

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        open={imageUploadOpen}
        onOpenChange={setImageUploadOpen}
        productId={uploadProductId}
        productName={uploadProductName}
        onUpload={comboIsCurrentUpload ? handleUploadComboImages : handleUploadImages}
        isUploading={comboIsCurrentUpload ? uploadComboImageMutation.isPending : uploadImagesMutation.isPending}
      />

      {/* Delete Combo Confirmation */}
      <DeleteProductDialog
        open={!!deleteCombo}
        onOpenChange={(open) => { if (!open) setDeleteCombo(null); }}
        productName={deleteCombo?.name ?? ''}
        onConfirm={handleConfirmDeleteCombo}
        isLoading={deleteComboMutation.isPending}
      />

      {/* Combo Create / Edit Dialog */}
      <ComboDialog
        key={comboDialogKey}
        open={comboDialogOpen}
        onOpenChange={(open) => {
          setComboDialogOpen(open);
          if (!open) {
            setComboDialogMode(undefined);
            setComboDefaultParentId(undefined);
          }
        }}
        combo={editingCombo}
        initialMode={comboDialogMode}
        defaultParentId={comboDefaultParentId}
        onSubmit={handleComboSubmit}
        isLoading={createComboMutation.isPending || updateComboMutation.isPending}
      />
    </div>
  );
}
