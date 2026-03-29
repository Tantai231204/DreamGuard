import { useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import {
  useCreateProduct,
  useUpdateProduct,
  useUpdateProductStatus,
  useDeleteProduct,
  useUploadProductImages,
  useCreateVariant,
  useCreateVariantWithCustomize,
  useUpdateVariant,
  useDeleteVariant,
  useUpdateVariantStatus,
  useAssignVariantCustomizeType,
  useUpdateVariantCustomizeTypePrice,
  useRemoveVariantCustomizeType,
  useAddStock,
  useReduceStock,
} from '@/hooks/queries/useProduct';
import {
  useCreateCombo,
  useUpdateCombo,
  useUpdateComboItems,
  useUpdateComboStatus,
  useUploadComboImage,
  useDeleteCombo,
} from '@/hooks/queries/useCombo';
import {
  useCreateCertificate,
  useUpdateCertificate,
  useDeleteCertificate,
} from '@/hooks/queries/useCertificate';
import type {
  CreateProductRequest, VariantSubmitData, AdminProductState, CreateCertificateRequest, StatusChangeData,
  Product, Combo, Certificate
} from '../types';
import type { CreateComboRequest } from '@/api';

interface MutationProps {
  state: AdminProductState;
}

export function useAdminProductMutations({ state }: MutationProps) {
  const toast = useToast();

  const {
    editingVariant, setVariantDialogOpen, editingProduct, setDialogOpen, setEditingProduct,
    setCreatedProductId, setCreatedProductName, setSuccessDialogOpen,
    uploadProductIdRef,
    editingCert, setCertDialogOpen,
    setImageUploadOpen, setStatusChangeData, statusChangeData,
    setEditingCombo, setComboDialogOpen, editingCombo, setDeleteProduct, setDeleteCombo, setDeleteCert, setDeleteVariant,
  } = state;

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const updateProductStatusMutation = useUpdateProductStatus();
  const deleteMutation = useDeleteProduct();
  const uploadImagesMutation = useUploadProductImages();

  const createVariantMutation = useCreateVariant();
  const createVariantWithCustomizeMutation = useCreateVariantWithCustomize();
  const updateVariantMutation = useUpdateVariant();
  const deleteVariantMutation = useDeleteVariant();
  const updateVariantStatusMutation = useUpdateVariantStatus();
  const assignCustomMutation = useAssignVariantCustomizeType();
  const updateCustomPriceMutation = useUpdateVariantCustomizeTypePrice();
  const removeCustomMutation = useRemoveVariantCustomizeType();

  const createComboMutation = useCreateCombo();
  const updateComboMutation = useUpdateCombo();
  const updateComboItemsMutation = useUpdateComboItems();
  const updateComboStatusMutation = useUpdateComboStatus();
  const uploadComboImageMutation = useUploadComboImage();
  const deleteComboMutation = useDeleteCombo();

  const createCertMutation = useCreateCertificate();
  const updateCertMutation = useUpdateCertificate();
  const deleteCertMutation = useDeleteCertificate();

  const addStockMutation = useAddStock();
  const reduceStockMutation = useReduceStock();

  /** ── Senior Utility: Sync customizations with existing ones ── */
  const syncCustomizations = useCallback(async (
    vid: string,
    customs: { customizeTypeId: string; overridePrice: number | null }[],
    current?: (import('@/api').VariantCustomizeTypeResponse | import('@/api/types/product.types').CustomizeOptionResponse)[]
  ) => {
    const currentIds = new Set(current?.map(c => c.customizeTypeId) || []);
    const targetIds = new Set(customs.map(c => c.customizeTypeId));

    for (const cid of currentIds) {
      if (!targetIds.has(cid)) {
        await removeCustomMutation.mutateAsync({ variantId: vid, customizeTypeId: cid });
      }
    }

    for (const item of customs) {
      if (!currentIds.has(item.customizeTypeId)) {
        await assignCustomMutation.mutateAsync({ variantId: vid, data: { customizeTypeId: item.customizeTypeId } });
      }

      const existing = current?.find(c => c.customizeTypeId === item.customizeTypeId);
      if (item.overridePrice !== (existing?.overridePrice ?? null)) {
        await updateCustomPriceMutation.mutateAsync({
          variantId: vid,
          customizeTypeId: item.customizeTypeId,
          data: { overridePrice: item.overridePrice ?? 0 }
        });
      }
    }
  }, [assignCustomMutation, updateCustomPriceMutation, removeCustomMutation]);

  const handleVariantSubmit = useCallback(async (formData: VariantSubmitData) => {
    const { status, isNew, color, hexColor, colorHex, ...coreBody } = formData;
    const commonData = {
      ...coreBody,
      isNew: !!isNew,
      color: color || undefined,
      hexColor: hexColor || undefined,
      colorHex: colorHex || undefined,
      isCustomizable: !!formData.isCustomizable,
      customizeLabel: formData.customizeLabel || '',
    };

    try {
      if (editingVariant) {
        await updateVariantMutation.mutateAsync({ id: editingVariant.id, data: commonData });
        const currentStock = editingVariant.stockQuantity || 0;
        const targetStock = formData.stockQuantity || 0;
        const diff = targetStock - currentStock;
        if (diff > 0) await addStockMutation.mutateAsync({ productVariantId: editingVariant.id, quantity: diff });
        else if (diff < 0) await reduceStockMutation.mutateAsync({ productVariantId: editingVariant.id, quantity: Math.abs(diff) });

        if (formData.pendingCustoms && formData.isCustomizable) {
          const currentCustoms = (editingVariant.customizeTypes || editingVariant.customizeOptions);
          await syncCustomizations(editingVariant.id, formData.pendingCustoms, currentCustoms);
        }

        if (status !== editingVariant.status) await updateVariantStatusMutation.mutateAsync({ variantId: editingVariant.id, status });
        toast.success("Variant Updated", "Changes and inventory synced.");
      } else {
        const hasCustoms = !!(formData.pendingCustoms && formData.pendingCustoms.length > 0);
        let newVariantId = "";
        if (hasCustoms && formData.isCustomizable) {
          const res = await createVariantWithCustomizeMutation.mutateAsync({
            ...commonData,
            basePrice: formData.baseprice,
            salePrice: formData.saleprice,
            weight: formData.weight,
            productId: formData.productid,
            customizeTypeIds: formData.pendingCustoms?.map(p => p.customizeTypeId) || []
          });
          newVariantId = res.id;
        } else {
          const res = await createVariantMutation.mutateAsync({
            ...commonData,
            baseprice: formData.baseprice,
            saleprice: formData.saleprice,
            weight: formData.weight,
          });
          newVariantId = res.id;
        }
        const initialStock = Number(formData.stockQuantity) || 0;
        if (initialStock > 0 && newVariantId) await addStockMutation.mutateAsync({ productVariantId: newVariantId, quantity: initialStock });
        toast.success("Variant Created", "New variant and initial stock added.");
      }
      setVariantDialogOpen(false);
    } catch (error: unknown) {
      console.error('Variant Submission Error:', error);
    }
  }, [editingVariant, setVariantDialogOpen, toast, createVariantMutation, updateVariantMutation, createVariantWithCustomizeMutation, updateVariantStatusMutation, addStockMutation, reduceStockMutation, syncCustomizations]);

  const handleSubmit = useCallback(async (data: CreateProductRequest) => {
    if (!editingProduct) {
      try {
        const response = await createMutation.mutateAsync(data);
        setDialogOpen(false);
        toast.success('Product created', 'Success.');
        const productId = response?.id;
        if (uploadProductIdRef) uploadProductIdRef.current = productId ?? '';
        setCreatedProductId(productId ?? '');
        setCreatedProductName(response?.name || data.name);
        setSuccessDialogOpen(true);
      } catch (error: unknown) {
        console.error('Product Creation Error:', error);
      }
      return;
    }

    try {
      const targetCertArray = Array.from(new Set(data.CertificateIds || []));
      await updateMutation.mutateAsync({
        id: editingProduct.id,
        name: data.name ?? editingProduct.name,
        slug: data.slug ?? editingProduct.slug,
        summary: data.summary ?? editingProduct.summary,
        description: data.description ?? editingProduct.description,
        material: data.material ?? editingProduct.material ?? undefined,
        status: data.status ?? editingProduct.status,
        ageGroup: data.ageGroup ?? (editingProduct.ageGroup != null ? String(editingProduct.ageGroup) : null),
        // Robust number conversion (avoids 0 => null bug)
        warrantyPolicyDay: (data.warrantyPolicyDay !== undefined && data.warrantyPolicyDay !== null) ? Number(data.warrantyPolicyDay) : null,
        returnPolicyDay: (data.returnPolicyDay !== undefined && data.returnPolicyDay !== null) ? Number(data.returnPolicyDay) : null,
        cateId: data.cateId ? Number(data.cateId) : null,
        CertificateIds: targetCertArray,
      });
      setDialogOpen(false);
      setEditingProduct(null);
      toast.success('Product Updated', 'Synced successfully.');
    } catch (error: unknown) {
      console.error('Product Update Error:', error);
    }
  }, [editingProduct, updateMutation, createMutation, setDialogOpen, setEditingProduct, setCreatedProductId, setCreatedProductName, setSuccessDialogOpen, uploadProductIdRef, toast]);

  const handleComboSubmit = useCallback(async (data: CreateComboRequest) => {
    try {
      if (editingCombo) {
        await updateComboMutation.mutateAsync({ id: editingCombo.id, data });
        
        // Manual Status Sync: Ensure status is updated even if main PUT ignores it
        if (data.status && data.status !== editingCombo.status) {
          await updateComboStatusMutation.mutateAsync({ 
            id: editingCombo.id, 
            status: data.status 
          });
        }
        
        toast.success('Combo updated', 'Success.');
      } else {
        await createComboMutation.mutateAsync(data);
        toast.success('Combo created', 'Success.');
      }
      setComboDialogOpen(false);
      setEditingCombo(null);
    } catch (error) {
      console.error(error);
    }
  }, [editingCombo, updateComboMutation, createComboMutation, updateComboStatusMutation, setComboDialogOpen, setEditingCombo, toast]);

  const handleCertSubmit = useCallback(async (data: CreateCertificateRequest) => {
    try {
      if (editingCert) {
        await updateCertMutation.mutateAsync({ id: editingCert.id, data });
        toast.success('Certificate updated', 'Changes saved.');
      } else {
        await createCertMutation.mutateAsync(data);
        toast.success('Certificate created', 'Success.');
      }
      setCertDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  }, [editingCert, updateCertMutation, createCertMutation, setCertDialogOpen, toast]);

  const handleUploadImages = useCallback(async (productId: string, files: File[]) => {
    try {
      await uploadImagesMutation.mutateAsync({ productId, files });
      setImageUploadOpen(false);
      toast.success('Images uploaded', 'Success.');
    } catch (error) {
      console.error(error);
    }
  }, [uploadImagesMutation, setImageUploadOpen, toast]);

  const handleStatusChangeRequest = useCallback((data: StatusChangeData) => {
    setStatusChangeData(data);
  }, [setStatusChangeData]);

  const handleConfirmStatusChange = useCallback(async () => {
    if (!statusChangeData) return;
    try {
      if (statusChangeData.type === 'product') {
        await updateProductStatusMutation.mutateAsync({ productId: statusChangeData.id, status: statusChangeData.newStatus });
      } else if (statusChangeData.type === 'combo') {
        await updateComboStatusMutation.mutateAsync({ id: statusChangeData.id, status: statusChangeData.newStatus });
      } else if (statusChangeData.type === 'variant') {
        await updateVariantStatusMutation.mutateAsync({ variantId: statusChangeData.id, status: statusChangeData.newStatus });
      }
      setStatusChangeData(null);
      toast.success('Status updated', 'Success.');
    } catch (error) {
      console.error(error);
    }
  }, [statusChangeData, updateProductStatusMutation, updateComboStatusMutation, updateVariantStatusMutation, setStatusChangeData, toast]);

  const handleConfirmDelete = useCallback((id: string) => {
    deleteMutation.mutate(id, { onSuccess: () => setDeleteProduct(null) });
  }, [deleteMutation, setDeleteProduct]);

  const handleConfirmDeleteCombo = useCallback((id: string) => {
    deleteComboMutation.mutate(id, { onSuccess: () => setDeleteCombo(null) });
  }, [deleteComboMutation, setDeleteCombo]);

  const handleConfirmDeleteCert = useCallback((id: string) => {
    deleteCertMutation.mutate(id, { onSuccess: () => setDeleteCert(null) });
  }, [deleteCertMutation, setDeleteCert]);

  const handleConfirmDeleteVariant = useCallback((id: string) => {
    updateVariantStatusMutation.mutate({ variantId: id, status: 'Hidden' }, { onSuccess: () => setDeleteVariant(null) });
  }, [updateVariantStatusMutation, setDeleteVariant]);

  const handleDeleteVariant = useCallback((id: string) => {
    deleteVariantMutation.mutate(id);
  }, [deleteVariantMutation]);

  const handleDeleteCert = useCallback((id: string) => {
    deleteCertMutation.mutate(id);
  }, [deleteCertMutation]);

  const handleConfirmBulkDelete = useCallback(async () => {
    // Placeholder - will implement if needed
  }, []);

  const handleExport = useCallback((tab: string, products: Product[], combos: Combo[], certificates?: Certificate[]) => {
    console.log(`[Export] tab: ${tab}, products: ${products.length}, combos: ${combos.length}, certs: ${certificates?.length}`);
    // implementation placeholder
  }, []);

  const handleBulkDelete = useCallback((table: import('@tanstack/react-table').Table<Product | Combo | Certificate>, tab: 'single' | 'combo' | 'certificate') => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map(r => (r.original as { id: string }).id);
    state.setBulkDeleteData({ ids, type: tab });
  }, [state]);

  return {
    handleSubmit,
    handleVariantSubmit,
    handleComboSubmit,
    handleCertSubmit,
    handleUploadImages,
    handleStatusChangeRequest,
    handleConfirmStatusChange,
    handleConfirmDelete,
    handleConfirmDeleteVariant,
    handleConfirmDeleteCombo,
    handleConfirmDeleteCert,
    handleDeleteVariant,
    handleDeleteCert,
    handleConfirmBulkDelete,
    handleExport,
    handleBulkDelete,
    createMutation,
    updateMutation,
    updateVariantMutation,
    createVariantMutation,
    createVariantWithCustomizeMutation,
    createComboMutation,
    updateComboMutation,
    updateComboItemsMutation,
    updateComboStatusMutation,
    uploadComboImageMutation,
    createCertMutation,
    updateCertMutation,
    uploadImagesMutation,
    updateProductStatusMutation,
    updateVariantStatusMutation,
    deleteMutation,
    deleteVariantMutation,
    deleteCertMutation,
    deleteComboMutation,
  } as unknown as import('../types').AdminProductMutations;
}

