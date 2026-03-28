import { useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import { downloadCSV } from '@/lib/export';
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
} from '@/hooks/queries/useProduct';
import {
  useCreateCombo,
  useUpdateCombo,
  useDeleteCombo,
  useUpdateComboItems,
  useUploadComboImage,
} from '@/hooks/queries/useCombo';
import type { CreateProductRequest, UpdateProductRequest, VariantSubmitData, Product, Combo, AdminProductState } from '../types';
import type { CreateComboRequest } from '@/api/services/comboService';
import type { Table } from '@tanstack/react-table';

interface MutationProps {
  state: AdminProductState;
}

export function useAdminProductMutations({ state }: MutationProps) {
  const toast = useToast();

  const {
    editingVariant, setVariantDialogOpen, editingProduct, setDialogOpen,
    setCreatedProductId, setCreatedProductName, setSuccessDialogOpen,
    uploadProductIdRef, editingCombo, setComboDialogOpen, setComboIsCurrentUpload,
    setImageUploadOpen, setBulkDeleteData, bulkDeleteData
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
  const deleteComboMutation = useDeleteCombo();
  const updateComboItemsMutation = useUpdateComboItems();
  const uploadComboImageMutation = useUploadComboImage();

  const handleVariantSubmit = useCallback(async (formData: VariantSubmitData) => {
    const { status, stockStatus: _stockStatus, isNew, color, hexColor, colorHex, ...coreBody } = formData;
    void _stockStatus;

    const syncCustomizations = async (
      vid: string,
      customs: { customizeTypeId: string; overridePrice: number | null }[],
      current?: (import('@/api').VariantCustomizeTypeResponse | import('@/api/types/product.types').CustomizeOptionResponse)[]
    ) => {
      if (!formData.isCustomizable) return;
      const currentIds = new Set(current?.map(c => c.customizeTypeId) || []);
      const targetIds = new Set(customs.map(c => c.customizeTypeId));

      for (const cid of currentIds) {
        if (!targetIds.has(cid)) {
          try { await removeCustomMutation.mutateAsync({ variantId: vid, customizeTypeId: cid }); } catch (e) { console.error(e); }
        }
      }
      for (const item of customs) {
        try {
          if (!currentIds.has(item.customizeTypeId)) {
            await assignCustomMutation.mutateAsync({ variantId: vid, data: { customizeTypeId: item.customizeTypeId } });
          }
          const existing = current?.find(c => c.customizeTypeId === item.customizeTypeId);
          if (item.overridePrice !== (existing?.overridePrice ?? null)) {
            await updateCustomPriceMutation.mutateAsync({
              variantId: vid, customizeTypeId: item.customizeTypeId, data: { overridePrice: item.overridePrice ?? 0 }
            });
          }
        } catch (e) { console.error(e); }
      }
    };

    try {
      if (editingVariant) {
        await updateVariantMutation.mutateAsync({
          id: editingVariant.id,
          data: { ...coreBody, isNew, color, hexColor, colorHex, isCustomizable: formData.isCustomizable, customizeLabel: formData.customizeLabel },
        });
        if (formData.pendingCustoms) {
          const currentCustoms = (editingVariant.customizeTypes || editingVariant.customizeOptions);
          await syncCustomizations(editingVariant.id, formData.pendingCustoms, currentCustoms);
        }
        if (status !== editingVariant.status) {
          await updateVariantStatusMutation.mutateAsync({ variantId: editingVariant.id, status });
        }
        setVariantDialogOpen(false);
        toast.success("Variant updated", "Changes saved.");
      } else {
        const hasCustomizeTypes = formData.customizeTypeIds && formData.customizeTypeIds.length > 0;
        if (hasCustomizeTypes) {
          await createVariantWithCustomizeMutation.mutateAsync({
            sku: formData.sku, basePrice: formData.baseprice, salePrice: formData.saleprice,
            weight: formData.weight, attributes: formData.attributes, productId: formData.productid,
            isNew: formData.isNew, color: formData.color, hexColor: formData.hexColor, colorHex: formData.colorHex,
            isCustomizable: formData.isCustomizable, customizeLabel: formData.customizeLabel,
            customizeTypeIds: formData.customizeTypeIds || []
          });
        } else {
          const newVariant = await createVariantMutation.mutateAsync({
            ...coreBody, isNew, color, hexColor, colorHex, isCustomizable: formData.isCustomizable, customizeLabel: formData.customizeLabel
          });
          if (formData.pendingCustoms?.length && newVariant?.id && formData.isCustomizable) {
            await syncCustomizations(newVariant.id, formData.pendingCustoms, []);
          }
        }
        setVariantDialogOpen(false);
        toast.success("Variant created", "Success.");
      }
    } catch (error: unknown) {
      const msg = (error as Error)?.message || "Error occurred.";
      toast.error("Submission Failed", msg);
    }
  }, [editingVariant, setVariantDialogOpen, updateVariantMutation, updateVariantStatusMutation, createVariantMutation, createVariantWithCustomizeMutation, assignCustomMutation, updateCustomPriceMutation, removeCustomMutation, toast]);

  const handleSubmit = useCallback(async (data: CreateProductRequest) => {
    if (editingProduct) {
      try {
        const updatePayload: UpdateProductRequest = {
          id: editingProduct.id, name: data.name, slug: data.slug, summary: data.summary,
          description: data.description, material: data.material, ageGroup: data.ageGroup || null,
          warrantyPolicyDay: data.warrantyPolicyDay ? Number(data.warrantyPolicyDay) : null,
          returnPolicyDay: data.returnPolicyDay ? Number(data.returnPolicyDay) : null,
          cateId: data.cateId ? Number(data.cateId) : null,
        };
        await updateMutation.mutateAsync(updatePayload);
        if (data.status !== editingProduct.status) {
          await updateProductStatusMutation.mutateAsync({ productId: editingProduct.id, status: data.status });
        }
        setDialogOpen(false);
        toast.success('Product updated', 'Success.');
      } catch (error) { console.error(error); }
    } else {
      try {
        const response = await createMutation.mutateAsync(data);
        setDialogOpen(false);
        toast.success('Product created', 'Success.');
        const productId = response?.id;
        if (uploadProductIdRef) uploadProductIdRef.current = productId ?? '';
        setCreatedProductId(productId ?? '');
        setCreatedProductName(response?.name || data.name);
        setSuccessDialogOpen(true);
      } catch (error) { console.error(error); }
    }
  }, [editingProduct, updateMutation, updateProductStatusMutation, createMutation, setDialogOpen, setCreatedProductId, setCreatedProductName, setSuccessDialogOpen, uploadProductIdRef, toast]);

  const handleComboSubmit = useCallback(async (data: CreateComboRequest) => {
    if (editingCombo) {
      try {
        const { items, ...infoData } = data;
        await Promise.all([
          updateComboMutation.mutateAsync({ id: editingCombo.id, data: infoData }),
          items?.length ? updateComboItemsMutation.mutateAsync({ id: editingCombo.id, items }) : Promise.resolve()
        ]);
        setComboDialogOpen(false);
        toast.success('Combo updated', 'Success.');
      } catch { toast.error('Update failed', 'Error.'); }
    } else {
      createComboMutation.mutate(data, {
        onSuccess: (res) => {
          if (uploadProductIdRef) uploadProductIdRef.current = res?.id ?? '';
          setCreatedProductId(res?.id ?? '');
          setCreatedProductName(res?.name || data.name);
          setComboDialogOpen(false);
          setSuccessDialogOpen(true);
          setComboIsCurrentUpload(true);
        },
      });
    }
  }, [editingCombo, updateComboMutation, updateComboItemsMutation, createComboMutation, setComboDialogOpen, setCreatedProductId, setCreatedProductName, setSuccessDialogOpen, setComboIsCurrentUpload, uploadProductIdRef, toast]);

  const handleUploadImages = useCallback(async (productId: string, files: File[]) => {
    const id = productId || uploadProductIdRef?.current;
    if (!id || files.length === 0) return;
    try {
      if (state.comboIsCurrentUpload) {
        await uploadComboImageMutation.mutateAsync({ comboId: id, files });
      } else {
        await uploadImagesMutation.mutateAsync({ productId: id, files });
      }
      setImageUploadOpen(false);
      toast.success('Images uploaded', 'Success.');
    } catch (error) { console.error(error); }
  }, [uploadProductIdRef, state.comboIsCurrentUpload, uploadComboImageMutation, uploadImagesMutation, setImageUploadOpen, toast]);

  const handleExport = useCallback((tab: string, products: Product[], combos: Combo[]) => {
    if (tab === 'single') {
      const exportData = products.map((p) => ({
        ID: p.id, Name: p.name, Category: p.categoryName, MinPrice: p.minPrice, MaxPrice: p.maxPrice, Status: p.status, Variants: p.variantCount
      }));
      downloadCSV(exportData, 'Products');
    } else {
      const exportData = combos.map((c) => ({
        ID: c.id, Name: c.name, BasePrice: c.basePrice, SalePrice: c.salePrice, Status: c.status, Type: c.type
      }));
      downloadCSV(exportData, 'Combos');
    }
  }, []);

  const handleBulkDelete = useCallback((table: Table<Product | Combo>, tab: string) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const ids = selectedRows.map((r) => r.original.id);
    if (ids.length === 0) return;
    setBulkDeleteData({ ids, type: tab as 'single' | 'combo' });
  }, [setBulkDeleteData]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (!bulkDeleteData) return;
    const { ids, type } = bulkDeleteData;
    const deleteFn = type === 'single' ? deleteMutation.mutateAsync : deleteComboMutation.mutateAsync;
    try {
      await Promise.all(ids.map(id => deleteFn(id)));
      toast.success('Items deactivated', `${ids.length} item(s) processed.`);
      setBulkDeleteData(null);
    } catch { toast.error('Bulk Action Failed', 'Error occurred.'); }
  }, [bulkDeleteData, deleteMutation, deleteComboMutation, setBulkDeleteData, toast]);

  return {
    handleVariantSubmit, handleSubmit, handleComboSubmit, handleUploadImages,
    handleExport, handleBulkDelete, handleConfirmBulkDelete,
    // Mutations for loading states
    createMutation, updateMutation, updateProductStatusMutation, deleteMutation, uploadImagesMutation,
    createVariantMutation, createVariantWithCustomizeMutation, updateVariantMutation, deleteVariantMutation, updateVariantStatusMutation,
    createComboMutation, updateComboMutation, deleteComboMutation, updateComboItemsMutation, uploadComboImageMutation,
    // Direct actions
    handleConfirmDelete: (id: string) => deleteMutation.mutate(id),
    handleConfirmDeleteVariant: (id: string) => deleteVariantMutation.mutate(id),
    handleConfirmDeleteCombo: (id: string) => deleteComboMutation.mutate(id),
  };
}
