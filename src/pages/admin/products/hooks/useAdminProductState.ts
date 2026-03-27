import { useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SortingState, ColumnFiltersState, RowSelectionState, ExpandedState, PaginationState } from '@tanstack/react-table';
import { useAdminProducts } from '@/hooks/queries/useProduct';
import { useAdminCombos } from '@/hooks/queries/useCombo';
import { mapCombosToSubRows } from '../components/combo';
import type { ComboDialogMode } from '../components/combo-dialog';
import type { Product, Combo, ProductVariant, AdminProductState } from '../types';

export function useAdminProductState(): AdminProductState {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tabs
  const activeTab = (searchParams.get('tab') as 'single' | 'combo') || 'single';
  const setActiveTab = (tab: 'single' | 'combo') => {
    setSearchParams((prev) => {
      prev.set('tab', tab);
      prev.set('page', '1');
      return prev;
    });
  };

  // ── TABLE STATE: PRODUCTS ─────────────────────────────
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });

  // ── TABLE STATE: COMBOS ──────────────────────────────
  const [comboSorting, setComboSorting] = useState<SortingState>([]);
  const [comboGlobalFilter, setComboGlobalFilter] = useState('');
  const [comboRowSelection, setComboRowSelection] = useState<RowSelectionState>({});
  const [comboExpanded, setComboExpanded] = useState<ExpandedState>({});
  const [comboPagination, setComboPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });

  // ── API DATA ─────────────────────────────────────────
  const { data: productData, isLoading: isLoadingProducts, refetch: refetchProducts } = useAdminProducts({
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    name: globalFilter,
  });

  const { data: rawComboData, isLoading: isLoadingCombos, refetch: refetchCombos } = useAdminCombos({
    pageNumber: comboPagination.pageIndex + 1,
    pageSize: comboPagination.pageSize,
    name: comboGlobalFilter,
  });

  const combos = useMemo(() => 
    rawComboData?.items ? mapCombosToSubRows(rawComboData.items as Combo[]) : []
  , [rawComboData]);

  // ── DIALOG STATES ────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantProductId, setVariantProductId] = useState('');
  const [variantProductName, setVariantProductName] = useState('');
  const [variantProductSlug, setVariantProductSlug] = useState('');
  const [variantCount, setVariantCount] = useState(0);

  const [comboDialogOpen, setComboDialogOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [comboDialogMode, setComboDialogMode] = useState<ComboDialogMode | null>(null);
  const [comboDialogKey, setComboDialogKey] = useState(0);
  const [comboDefaultParentId, setComboDefaultParentId] = useState<string | undefined>();

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdProductId, setCreatedProductId] = useState('');
  const [createdProductName, setCreatedProductName] = useState('');

  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [uploadProductId, setUploadProductId] = useState('');
  const [uploadProductName, setUploadProductName] = useState('');
  const [comboIsCurrentUpload, setComboIsCurrentUpload] = useState(false);
  const uploadProductIdRef = useRef<string>('');

  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleteCombo, setDeleteCombo] = useState<Combo | null>(null);
  const [deleteVariant, setDeleteVariant] = useState<ProductVariant | null>(null);
  const [bulkDeleteData, setBulkDeleteData] = useState<{ ids: string[], type: 'single' | 'combo' } | null>(null);

  const handleAddImagesFromSuccess = useCallback(() => {
    setUploadProductId(createdProductId);
    setUploadProductName(createdProductName);
    setSuccessDialogOpen(false);
    setImageUploadOpen(true);
  }, [createdProductId, createdProductName]);

  const handleSkipImages = useCallback(() => {
    setSuccessDialogOpen(false);
  }, []);

  return {
    activeTab, setActiveTab,
    // Tables
    sorting, setSorting, globalFilter, setGlobalFilter, columnFilters, setColumnFilters,
    rowSelection, setRowSelection, expanded, setExpanded, pagination, setPagination,
    comboSorting, setComboSorting, comboGlobalFilter, setComboGlobalFilter,
    comboRowSelection, setComboRowSelection, comboExpanded, setComboExpanded,
    comboPagination, setComboPagination,
    // Data
    products: (productData?.items as Product[]) || [], 
    productPageData: productData ? { totalPages: productData.totalPages, totalCount: productData.totalCount } : undefined,
    isLoadingProducts, refetchProducts,
    combos, 
    comboPageData: rawComboData ? { totalPages: rawComboData.totalPages, totalCount: rawComboData.totalCount } : undefined,
    isLoadingCombos, refetchCombos,
    // Dialog control
    dialogOpen, setDialogOpen, editingProduct, setEditingProduct,
    variantDialogOpen, setVariantDialogOpen, editingVariant, setEditingVariant,
    variantProductId, setVariantProductId, variantProductName, setVariantProductName,
    variantProductSlug, setVariantProductSlug, variantCount, setVariantCount,
    comboDialogOpen, setComboDialogOpen, editingCombo, setEditingCombo, 
    comboDialogMode, setComboDialogMode, comboDialogKey, setComboDialogKey,
    comboDefaultParentId, setComboDefaultParentId,
    successDialogOpen, setSuccessDialogOpen, createdProductId, setCreatedProductId,
    createdProductName, setCreatedProductName,
    imageUploadOpen, setImageUploadOpen, uploadProductId, setUploadProductId,
    uploadProductName, setUploadProductName, comboIsCurrentUpload, setComboIsCurrentUpload,
    uploadProductIdRef,
    deleteProduct, setDeleteProduct, deleteCombo, setDeleteCombo,
    deleteVariant, setDeleteVariant, bulkDeleteData, setBulkDeleteData,
    handleAddImagesFromSuccess, handleSkipImages
  } as AdminProductState;
}
