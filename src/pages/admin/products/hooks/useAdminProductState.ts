import { useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SortingState, ColumnFiltersState, RowSelectionState, ExpandedState, PaginationState } from '@tanstack/react-table';
import { useAdminProducts, useAdminProductTemplates } from '@/hooks/queries/useProduct';
import { useAdminCombos } from '@/hooks/queries/useCombo';
import { useAdminCertificates } from '@/hooks/queries/useCertificate';
import { useCategories } from '@/hooks/queries/useCategory';
import { useDebounce } from '@/hooks/useDebounce';
import { mapCombosToSubRows } from '../components/combo';
import type { ComboDialogMode } from '../components/combo-dialog';
import type { Product, Combo, ProductVariant, AdminProductState, Certificate, StatusChangeData } from '../types';
import { useAuthStore } from '@/store/authStore';
import { isAdminOrManager } from '@/lib/role';

export function useAdminProductState(): AdminProductState {
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useAuthStore((s) => s.role);

  // Categories
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  // Tabs
  const activeTab = (searchParams.get('tab') as 'single' | 'combo' | 'certificate' | 'customize') || 'single';
  const setActiveTab = (tab: 'single' | 'combo' | 'certificate' | 'customize') => {
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
  const [globalFilter, setInternalGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });

  const setGlobalFilter = useCallback((val: string) => {
    setInternalGlobalFilter(val);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    setSearchParams(prev => {
      prev.set('page', '1');
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  // ── TABLE STATE: COMBOS ──────────────────────────────
  const [comboSorting, setComboSorting] = useState<SortingState>([]);
  const [comboGlobalFilter, setInternalComboGlobalFilter] = useState('');
  const [comboRowSelection, setComboRowSelection] = useState<RowSelectionState>({});
  const [comboExpanded, setComboExpanded] = useState<ExpandedState>({});
  const [comboPagination, setComboPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });

  const setComboGlobalFilter = useCallback((val: string) => {
    setInternalComboGlobalFilter(val);
    setComboPagination(prev => ({ ...prev, pageIndex: 0 }));
    setSearchParams(prev => {
      prev.set('page', '1');
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  // ── TABLE STATE: CERTIFICATES ────────────────────────
  const [certSorting, setCertSorting] = useState<SortingState>([]);
  const [certGlobalFilter, setInternalCertGlobalFilter] = useState('');
  const [certPagination, setCertPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });
  const [certRowSelection, setCertRowSelection] = useState<RowSelectionState>({});

  const setCertGlobalFilter = useCallback((val: string) => {
    setInternalCertGlobalFilter(val);
    setCertPagination(prev => ({ ...prev, pageIndex: 0 }));
    setSearchParams(prev => {
      prev.set('page', '1');
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  // ── DEBOUNCED FILTERS ────────────────────────────────
  const debouncedGlobalFilter = useDebounce(globalFilter, 500);
  const debouncedComboGlobalFilter = useDebounce(comboGlobalFilter, 500);
  const debouncedCertGlobalFilter = useDebounce(certGlobalFilter, 500);

  // ── API DATA ─────────────────────────────────────────
  const { data: productData, isLoading: isLoadingProducts, refetch: refetchProducts } = useAdminProducts({
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    name: debouncedGlobalFilter,
  });

  const { data: templateData, isLoading: isLoadingTemplates, refetch: refetchTemplates } = useAdminProductTemplates();

  const { data: rawComboData, isLoading: isLoadingCombos, refetch: refetchCombos } = useAdminCombos({
    pageNumber: comboPagination.pageIndex + 1,
    pageSize: comboPagination.pageSize,
    name: debouncedComboGlobalFilter,
  });

  // ── DIALOG STATES ────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: rawCertData, isLoading: isLoadingCerts, refetch: refetchCerts } = useAdminCertificates({
    pageNumber: certPagination.pageIndex + 1,
    pageSize: certPagination.pageSize,
    name: debouncedCertGlobalFilter,
  }, {
    enabled: (activeTab === 'certificate' || dialogOpen) && isAdminOrManager(role)
  });

  const combos = useMemo(() =>
    rawComboData?.items ? mapCombosToSubRows(rawComboData.items as Combo[]) : []
    , [rawComboData]);

  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantProductId, setVariantProductId] = useState('');
  const [variantProductName, setVariantProductName] = useState('');
  const [variantProductSlug, setVariantProductSlug] = useState('');
  const [variantProductType, setVariantProductType] = useState<import("@/api/types/product.types").FullyCustomizedProductType | undefined>();
  const [variantCount, setVariantCount] = useState(0);

  const [comboDialogOpen, setComboDialogOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [comboDialogMode, setComboDialogMode] = useState<ComboDialogMode | null>(null);
  const [comboDialogKey, setComboDialogKey] = useState(0);
  const [comboDefaultParentId, setComboDefaultParentId] = useState<string | undefined>();

  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [deleteCert, setDeleteCert] = useState<Certificate | null>(null);

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
  const [bulkDeleteData, setBulkDeleteData] = useState<{ ids: string[], type: 'single' | 'combo' | 'certificate' } | null>(null);
  const [statusChangeData, setStatusChangeData] = useState<StatusChangeData | null>(null);

  const handleAddImagesFromSuccess = useCallback(() => {
    setUploadProductId(createdProductId);
    setUploadProductName(createdProductName);
    setSuccessDialogOpen(false);
    setImageUploadOpen(true);
  }, [createdProductId, createdProductName]);

  const handleSkipImages = useCallback(() => {
    setSuccessDialogOpen(false);
  }, []);

  const products = useMemo(() => {
    const all = (productData?.items as Product[]) || [];
    // Filter out templates from the main list for the "Regular" tab
    return all.filter(p => !p.fullyCustomizedProductType || p.fullyCustomizedProductType === 'None');
  }, [productData]);

  const templates = useMemo(() => (templateData as Product[]) || [], [templateData]);

  const takenCustomTypes = useMemo(() => {
    return templates.map((p: Product) => p.fullyCustomizedProductType as string);
  }, [templates]);

  return {
    activeTab, setActiveTab,
    // Tables
    sorting, setSorting, globalFilter, setGlobalFilter, columnFilters, setColumnFilters,
    rowSelection, setRowSelection, expanded, setExpanded, pagination, setPagination,
    comboSorting, setComboSorting, comboGlobalFilter, setComboGlobalFilter,
    comboRowSelection, setComboRowSelection, comboExpanded, setComboExpanded,
    comboPagination, setComboPagination,
    certSorting, setCertSorting, certGlobalFilter, setCertGlobalFilter,
    certPagination, setCertPagination,
    certRowSelection, setCertRowSelection,
    // Data
    products,
    productPageData: productData ? { totalPages: productData.totalPages, totalCount: productData.totalCount } : undefined,
    isLoadingProducts, refetchProducts,
    templates,
    isLoadingTemplates, refetchTemplates,
    combos,
    comboPageData: rawComboData ? { totalPages: rawComboData.totalPages, totalCount: rawComboData.totalCount } : undefined,
    isLoadingCombos, refetchCombos,
    certificates: (rawCertData?.items as Certificate[]) || [],
    certPageData: rawCertData ? { totalPages: rawCertData.totalPages, totalCount: rawCertData.totalCount } : undefined,
    isLoadingCerts, refetchCerts,
    // Dialog control
    dialogOpen, setDialogOpen, editingProduct, setEditingProduct,
    variantDialogOpen, setVariantDialogOpen, editingVariant, setEditingVariant,
    variantProductId, setVariantProductId, variantProductName, setVariantProductName,
    variantProductSlug, setVariantProductSlug, variantCount, setVariantCount,
    variantProductType, setVariantProductType,
    comboDialogOpen, setComboDialogOpen, editingCombo, setEditingCombo,
    comboDialogMode, setComboDialogMode, comboDialogKey, setComboDialogKey,
    comboDefaultParentId, setComboDefaultParentId,
    certDialogOpen, setCertDialogOpen, editingCert, setEditingCert, deleteCert, setDeleteCert,
    successDialogOpen, setSuccessDialogOpen, createdProductId, setCreatedProductId,
    createdProductName, setCreatedProductName,
    takenCustomTypes,
    imageUploadOpen, setImageUploadOpen, uploadProductId, setUploadProductId,
    uploadProductName, setUploadProductName, comboIsCurrentUpload, setComboIsCurrentUpload,
    uploadProductIdRef,
    deleteProduct, setDeleteProduct, deleteCombo, setDeleteCombo,
    deleteVariant, setDeleteVariant, bulkDeleteData, setBulkDeleteData,
    statusChangeData, setStatusChangeData,
    handleAddImagesFromSuccess, handleSkipImages,
    categories: categories || [], isLoadingCategories
  } as AdminProductState;
}
