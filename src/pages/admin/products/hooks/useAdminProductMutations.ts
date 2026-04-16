import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import variantService from "@/api/services/variantService";
import { useToast } from "@/hooks/useToast";
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
  useCreateFullyCustomize,
  useUpdateFullyCustomize,
  useDeleteFullyCustomize,
  productKeys,
  variantKeys,
} from "@/hooks/queries/useProduct";
import type { UpdateVariantRequest } from "@/api";
import {
  useCreateCombo,
  useUpdateCombo,
  useUpdateComboItems,
  useUpdateComboStatus,
  useUploadComboImage,
  useDeleteCombo,
} from "@/hooks/queries/useCombo";
import {
  useCreateCertificate,
  useUpdateCertificate,
  useDeleteCertificate,
} from "@/hooks/queries/useCertificate";
import type {
  CreateProductRequest,
  VariantSubmitData,
  AdminProductState,
  CreateCertificateRequest,
  StatusChangeData,
  Product,
  Combo,
  Certificate,
} from "../types";
import type { CreateComboRequest } from "@/api";

interface MutationProps {
  state: AdminProductState;
}

export function useAdminProductMutations({ state }: MutationProps) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    editingVariant,
    editingProduct,
    setDialogOpen,
    setEditingProduct,
    setCreatedProductId,
    setCreatedProductName,
    setSuccessDialogOpen,
    uploadProductIdRef,
    editingCert,
    setEditingCert,
    setCertDialogOpen,
    setImageUploadOpen,
    setStatusChangeData,
    statusChangeData,
    setEditingCombo,
    setComboDialogOpen,
    editingCombo,
    setDeleteProduct,
    setDeleteCombo,
    setDeleteCert,
    setDeleteVariant,
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

  const createTemplateMutation = useCreateFullyCustomize();
  const updateTemplateMutation = useUpdateFullyCustomize();
  const deleteTemplateMutation = useDeleteFullyCustomize();

  /** ── Senior Utility: Sync customizations with absolute delta detection ── */
  const syncCustomizations = useCallback(
    async (
      vid: string,
      targetCustoms: VariantSubmitData["pendingCustoms"],
      localCurrent: {
        customizeTypeId: string;
        overridePrice?: number | null;
        overrideMultiplier?: number | null;
      }[] = [],
    ) => {
      if (!targetCustoms) return;

      let serverItems: {
        customizeTypeId: string;
        overridePrice?: number | null;
        overrideMultiplier?: number | null;
      }[] = [];
      try {
        const current = await variantService.getCustomizeTypes(vid);
        serverItems = current && current.length > 0 ? current : localCurrent;
      } catch {
        serverItems = localCurrent;
      }

      const serverIds = new Set(
        serverItems
          .map((c) => String(c.customizeTypeId || "").toLowerCase())
          .filter(Boolean),
      );
      const targetIds = new Set(
        targetCustoms
          .map((c) => String(c.customizeTypeId || "").toLowerCase())
          .filter(Boolean),
      );

      const toRemove = serverItems.filter((s) => {
        const sid = String(s.customizeTypeId || "").toLowerCase();
        return sid && !targetIds.has(sid);
      });

      const toAssign = targetCustoms.filter((t) => {
        const tid = String(t.customizeTypeId || "").toLowerCase();
        return tid && !serverIds.has(tid);
      });

      const toUpdate = targetCustoms.filter((t) => {
        const tid = String(t.customizeTypeId || "").toLowerCase();
        if (!tid) return false;

        const existing = serverItems.find(
          (s) => String(s.customizeTypeId || "").toLowerCase() === tid,
        );
        if (!existing) return false;

        const oldP =
          existing.overridePrice == null
            ? null
            : Number(existing.overridePrice);
        const newP = t.overridePrice == null ? null : Number(t.overridePrice);

        const rawOldM = (existing as { overrideMultiplier?: number | null })
          .overrideMultiplier;
        const oldM = rawOldM == null ? null : Number(rawOldM);
        const newM =
          t.overrideMultiplier == null ? null : Number(t.overrideMultiplier);

        const priceDiff = newP !== oldP;
        const multDiff = newM !== oldM;

        return priceDiff || multDiff;
      });

      for (const item of toRemove) {
        await removeCustomMutation.mutateAsync({
          variantId: vid,
          customizeTypeId: item.customizeTypeId,
        });
      }

      for (const item of toAssign) {
        try {
          await assignCustomMutation.mutateAsync({
            variantId: vid,
            data: {
              customizeTypeId: item.customizeTypeId,
              overridePrice: item.overridePrice ?? undefined,
              overrideMultiplier: item.overrideMultiplier ?? undefined,
            },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!msg.toLowerCase().includes("already assigned")) throw err;
        }
      }

      for (const item of toUpdate) {
        await updateCustomPriceMutation.mutateAsync({
          variantId: vid,
          customizeTypeId: item.customizeTypeId,
          data: {
            overridePrice: item.overridePrice ?? 0,
            overrideMultiplier: item.overrideMultiplier ?? undefined,
          },
        });
      }
    },
    [assignCustomMutation, updateCustomPriceMutation, removeCustomMutation],
  );

  const handleVariantSubmit = useCallback(
    async (formData: VariantSubmitData) => {
      const vid = editingVariant?.id;

      if (vid && editingVariant) {
        try {
          const coreData: UpdateVariantRequest = {
            sku: formData.sku || "",
            basePrice: formData.baseprice,
            salePrice: formData.saleprice,
            weight: formData.weight || 0,
            attributes: formData.attributes || null,
            productId: formData.productid,
            isCustomizable: !!formData.isCustomizable,
            customizeLabel: formData.customizeLabel || "",
          };

          await updateVariantMutation.mutateAsync({ id: vid, data: coreData });

          const currentStock = editingVariant.stockQuantity || 0;
          const targetStock = formData.stockQuantity || 0;
          const diff = targetStock - currentStock;
          if (diff > 0) {
            await addStockMutation.mutateAsync({
              productVariantId: vid,
              quantity: diff,
            });
          } else if (diff < 0) {
            await reduceStockMutation.mutateAsync({
              productVariantId: vid,
              quantity: Math.abs(diff),
            });
          }

          const targetCustoms = formData.isCustomizable
            ? formData.pendingCustoms || []
            : [];
          const currentCustoms = [
            ...(editingVariant.customizeTypes || []),
            ...(editingVariant.customizeOptions || []),
            ...(editingVariant.customizeOptionGroups?.flatMap(
              (g) => g.options || [],
            ) || []),
          ];

          if (formData.isCustomizable || currentCustoms.length > 0) {
            await syncCustomizations(vid, targetCustoms, currentCustoms);
          }

          if (formData.status !== editingVariant.status) {
            await updateVariantStatusMutation.mutateAsync({
              variantId: vid,
              status: formData.status,
            });
          }

          await Promise.all([
            queryClient.invalidateQueries({ queryKey: productKeys.all }),
            queryClient.invalidateQueries({
              queryKey: variantKeys.adminByProduct(state.variantProductId),
            }),
            queryClient.invalidateQueries({
              queryKey: variantKeys.detail(vid),
            }),
            queryClient.invalidateQueries({
              queryKey: variantKeys.customizeTypes(vid),
            }),
          ]);

          state.setVariantDialogOpen(false);
          toast.success("Variant Updated", "Changes and inventory synced.");
        } catch (error: unknown) {
          console.error("❌ [FATAL SYNC ERROR]:", error);
          queryClient.invalidateQueries({
            queryKey: variantKeys.adminByProduct(state.variantProductId),
          });
          toast.error(
            "Update Failed",
            "Some changes might not have been saved.",
          );
        }
      } else {
        try {
          const variantData = {
            sku: formData.sku || "",
            basePrice: formData.baseprice,
            salePrice: formData.saleprice,
            weight: formData.weight || 0,
            attributes: formData.attributes || null,
            productId: formData.productid,
            isNew: !!formData.isNew,
            color: formData.color || undefined,
            hexColor: formData.colorHex || undefined,
            isCustomizable: !!formData.isCustomizable,
            customizeLabel: formData.customizeLabel || "",
          };

          const hasCustoms = !!(
            formData.pendingCustoms && formData.pendingCustoms.length > 0
          );
          let newVariantId = "";

          if (hasCustoms && formData.isCustomizable) {
            const res = await createVariantWithCustomizeMutation.mutateAsync({
              sku: variantData.sku,
              basePrice: variantData.basePrice,
              salePrice: variantData.salePrice,
              weight: variantData.weight,
              attributes: variantData.attributes,
              productId: variantData.productId,
              isNew: variantData.isNew,
              color: variantData.color,
              hexColor: variantData.hexColor,
              isCustomizable: variantData.isCustomizable,
              customizeLabel: variantData.customizeLabel,
              customizeTypeIds:
                formData.pendingCustoms?.map((p) => p.customizeTypeId) || [],
            });
            newVariantId = res.id;
            await syncCustomizations(
              newVariantId,
              formData.pendingCustoms || [],
            );
          } else {
            const res = await createVariantMutation.mutateAsync({
              sku: variantData.sku,
              basePrice: variantData.basePrice,
              salePrice: variantData.salePrice,
              weight: variantData.weight,
              attributes: variantData.attributes,
              productId: variantData.productId,
              isNew: variantData.isNew,
              color: variantData.color,
              hexColor: variantData.hexColor,
              isCustomizable: variantData.isCustomizable,
              customizeLabel: variantData.customizeLabel,
            });
            newVariantId = res.id;
          }

          const initialStock = Number(formData.stockQuantity) || 0;
          if (initialStock > 0 && newVariantId) {
            await addStockMutation.mutateAsync({
              productVariantId: newVariantId,
              quantity: initialStock,
            });
          }

          await queryClient.invalidateQueries({
            queryKey: variantKeys.adminByProduct(formData.productid),
          });
          state.setVariantDialogOpen(false);
          toast.success(
            "Variant Created",
            "New variant and initial stock added.",
          );
        } catch (error: unknown) {
          console.error("Variant Submission Error:", error);
          toast.error(
            "Submission Failed",
            "Please check variant data and try again.",
          );
        }
      }
    },
    [
      editingVariant,
      state,
      toast,
      queryClient,
      updateVariantMutation,
      addStockMutation,
      reduceStockMutation,
      syncCustomizations,
      updateVariantStatusMutation,
      createVariantMutation,
      createVariantWithCustomizeMutation,
    ],
  );

  const handleSubmit = useCallback(
    async (data: CreateProductRequest) => {
      const isTemplate =
        data.fullyCustomizedProductType &&
        data.fullyCustomizedProductType !== "None";

      if (!editingProduct) {
        try {
          let response;
          if (isTemplate) {
            response = await createTemplateMutation.mutateAsync({
              name: data.name,
              slug: data.slug,
              summary: data.summary,
              description: data.description,
              fullyCustomizedProductType: data.fullyCustomizedProductType!,
              sku: data.sku || "",
              basePrice: data.basePrice || 0,
              salePrice: data.salePrice || 0,
              weight: data.weight || 0,
              warrantyPolicyDay: data.warrantyPolicyDay || 0,
              returnPolicyDay: data.returnPolicyDay || 0,
              ageGroup: data.ageGroup,
              cateId: data.cateId,
              status: data.status,
            });
          } else {
            response = await createMutation.mutateAsync(data);
          }

          setDialogOpen(false);
          toast.success(
            isTemplate ? "Template created" : "Product created",
            "Success.",
          );
          const productId = response?.id;
          if (uploadProductIdRef) uploadProductIdRef.current = productId ?? "";
          setCreatedProductId(productId ?? "");
          setCreatedProductName(response?.name || data.name);
          setSuccessDialogOpen(true);
        } catch (error: unknown) {
          console.error("Submission Error:", error);
        }
        return;
      }

      try {
        const targetCertArray = Array.from(new Set(data.CertificateIds || []));

        if (isTemplate) {
          await updateTemplateMutation.mutateAsync({
            id: editingProduct.id,
            data: {
              name: data.name,
              slug: data.slug,
              summary: data.summary,
              description: data.description,
              fullyCustomizedProductType: data.fullyCustomizedProductType!,
              sku: data.sku || "",
              basePrice: data.basePrice || 0,
              salePrice: data.salePrice || 0,
              weight: data.weight || 0,
              warrantyPolicyDay: data.warrantyPolicyDay || 0,
              returnPolicyDay: data.returnPolicyDay || 0,
              ageGroup: data.ageGroup,
              cateId: data.cateId,
              status: data.status,
            },
          });
        } else {
          await updateMutation.mutateAsync({
            id: editingProduct.id,
            name: data.name ?? editingProduct.name,
            slug: data.slug ?? editingProduct.slug,
            summary: data.summary ?? editingProduct.summary,
            description: data.description ?? editingProduct.description,
            material: data.material ?? editingProduct.material ?? undefined,
            ageGroup:
              data.ageGroup ??
              (editingProduct.ageGroup != null
                ? String(editingProduct.ageGroup)
                : null),
            warrantyPolicyDay:
              data.warrantyPolicyDay !== undefined &&
                data.warrantyPolicyDay !== null
                ? Number(data.warrantyPolicyDay)
                : null,
            returnPolicyDay:
              data.returnPolicyDay !== undefined &&
                data.returnPolicyDay !== null
                ? Number(data.returnPolicyDay)
                : null,
            cateId: data.cateId ? Number(data.cateId) : null,
            CertificateIds: targetCertArray,
            status: data.status,
            isTradeInEligible: data.isTradeInEligible,
            minTradeInPrice: data.minTradeInPrice,
            depositAmount: data.depositAmount,
          });
        }
        setDialogOpen(false);
        setEditingProduct(null);
        toast.success(
          isTemplate ? "Template Updated" : "Product Updated",
          "Synced successfully.",
        );
      } catch (error: unknown) {
        console.error("Update Error:", error);
      }
    },
    [
      editingProduct,
      updateMutation,
      createMutation,
      updateTemplateMutation,
      createTemplateMutation,
      setDialogOpen,
      setEditingProduct,
      setCreatedProductId,
      setCreatedProductName,
      setSuccessDialogOpen,
      uploadProductIdRef,
      toast,
    ],
  );

  const handleComboSubmit = useCallback(
    async (data: CreateComboRequest) => {
      try {
        if (editingCombo) {
          await updateComboMutation.mutateAsync({ id: editingCombo.id, data });
          if (data.status && data.status !== editingCombo.status) {
            await updateComboStatusMutation.mutateAsync({
              id: editingCombo.id,
              status: data.status,
            });
          }
          toast.success("Combo synchronized successfully", "All changes saved.");
        } else {
          await createComboMutation.mutateAsync(data);
          toast.success("Combo created", "Success.");
        }
        setComboDialogOpen(false);
        setEditingCombo(null);
      } catch (error) {
        console.error(error);
      }
    },
    [
      editingCombo,
      updateComboMutation,
      createComboMutation,
      updateComboStatusMutation,
      setComboDialogOpen,
      setEditingCombo,
      toast,
    ],
  );

  const handleCertSubmit = useCallback(
    async (data: CreateCertificateRequest) => {
      try {
        if (editingCert) {
          await updateCertMutation.mutateAsync({ id: editingCert.id, data });
          toast.success("Certificate updated", "Changes saved.");
        } else {
          await createCertMutation.mutateAsync(data);
          toast.success("Certificate created", "Success.");
        }
        setCertDialogOpen(false);
        setEditingCert(null);
      } catch (error) {
        console.error(error);
      }
    },
    [
      editingCert,
      updateCertMutation,
      createCertMutation,
      setCertDialogOpen,
      setEditingCert,
      toast,
    ],
  );

  const handleUploadImages = useCallback(
    async (productId: string, files: File[]) => {
      try {
        await uploadImagesMutation.mutateAsync({ productId, files });
        setImageUploadOpen(false);
        toast.success("Images uploaded", "Success.");
      } catch (error) {
        console.error(error);
      }
    },
    [uploadImagesMutation, setImageUploadOpen, toast],
  );

  const handleStatusChangeRequest = useCallback(
    (data: StatusChangeData) => {
      setStatusChangeData(data);
    },
    [setStatusChangeData],
  );

  const handleConfirmStatusChange = useCallback(async () => {
    if (!statusChangeData) return;

    try {
      if (statusChangeData.type === "product") {
        await updateProductStatusMutation.mutateAsync({
          productId: statusChangeData.id,
          status: statusChangeData.newStatus,
        });
      } else if (statusChangeData.type === "combo") {
        await updateComboStatusMutation.mutateAsync({
          id: statusChangeData.id,
          status: statusChangeData.newStatus,
        });
      } else if (statusChangeData.type === "variant") {
        await updateVariantStatusMutation.mutateAsync({
          variantId: statusChangeData.id,
          status: statusChangeData.newStatus,
        });
      }
      setStatusChangeData(null);
    } catch (error) {
      console.error(error);
      setStatusChangeData(null);
    }
  }, [
    statusChangeData,
    updateProductStatusMutation,
    updateComboStatusMutation,
    updateVariantStatusMutation,
    setStatusChangeData,
  ]);

  const handleConfirmDelete = useCallback(
    (id: string) => {
      const isTemplate =
        state.deleteProduct?.fullyCustomizedProductType &&
        state.deleteProduct.fullyCustomizedProductType !== "None";
      if (isTemplate) {
        deleteTemplateMutation.mutate(id, {
          onSuccess: () => setDeleteProduct(null),
        });
      } else {
        deleteMutation.mutate(id, { onSuccess: () => setDeleteProduct(null) });
      }
    },
    [
      deleteMutation,
      deleteTemplateMutation,
      setDeleteProduct,
      state.deleteProduct,
    ],
  );

  const handleConfirmDeleteCombo = useCallback(
    (id: string) => {
      deleteComboMutation.mutate(id, { onSuccess: () => setDeleteCombo(null) });
    },
    [deleteComboMutation, setDeleteCombo],
  );

  const handleConfirmDeleteCert = useCallback(
    (id: string) => {
      deleteCertMutation.mutate(id, { onSuccess: () => setDeleteCert(null) });
    },
    [deleteCertMutation, setDeleteCert],
  );

  const handleConfirmDeleteVariant = useCallback(
    (id: string) => {
      updateVariantStatusMutation.mutate(
        { variantId: id, status: "Hidden" },
        { onSuccess: () => setDeleteVariant(null) },
      );
    },
    [updateVariantStatusMutation, setDeleteVariant],
  );

  const handleDeleteVariant = useCallback(
    (id: string) => {
      deleteVariantMutation.mutate(id);
    },
    [deleteVariantMutation],
  );

  const handleDeleteCert = useCallback(
    (id: string) => {
      deleteCertMutation.mutate(id);
    },
    [deleteCertMutation],
  );

  const handleConfirmBulkDelete = useCallback(async () => { }, []);

  const handleExport = useCallback(() => { }, []);

  const handleBulkDelete = useCallback(
    (
      table: import("@tanstack/react-table").Table<
        Product | Combo | Certificate
      >,
      tab: "single" | "combo" | "certificate",
    ) => {
      const selectedRows = table.getSelectedRowModel().rows;
      const ids = selectedRows.map((r) => (r.original as { id: string }).id);
      state.setBulkDeleteData({ ids, type: tab });
    },
    [state],
  );

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
  } as unknown as import("../types").AdminProductMutations;
}
