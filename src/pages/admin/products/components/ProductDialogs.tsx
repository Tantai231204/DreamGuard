import { memo } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import ProductDialog from './product-dialog';
import VariantDialog from './variant-dialog/VariantDialog';
import { ComboDialog } from './combo-dialog';
import { ImageUploadDialog, ProductCreationSuccess } from './dialogs';
import type { AdminProductState, AdminProductMutations } from '../types';

interface ProductDialogsProps {
  state: AdminProductState;
  mutations: AdminProductMutations;
  onRefresh: () => void;
}

export const ProductDialogs = memo(({ state, mutations, onRefresh }: ProductDialogsProps) => {
  return (
    <>
      <ProductDialog
        open={state.dialogOpen}
        onOpenChange={state.setDialogOpen}
        product={state.editingProduct}
        onSubmit={mutations.handleSubmit}
        isLoading={mutations.createMutation?.isPending || mutations.updateMutation?.isPending}
      />

      <VariantDialog
        open={state.variantDialogOpen}
        onOpenChange={state.setVariantDialogOpen}
        variant={state.editingVariant}
        productId={state.variantProductId}
        productName={state.variantProductName}
        productSlug={state.variantProductSlug}
        variantCount={state.variantCount}
        onSubmit={mutations.handleVariantSubmit}
        isLoading={mutations.updateVariantMutation?.isPending || mutations.createVariantMutation?.isPending || mutations.createVariantWithCustomizeMutation?.isPending}
      />

      <ComboDialog
        key={state.comboDialogKey}
        open={state.comboDialogOpen}
        onOpenChange={state.setComboDialogOpen}
        combo={state.editingCombo}
        initialMode={state.comboDialogMode ?? undefined}
        defaultParentId={state.comboDefaultParentId}
        onSubmit={mutations.handleComboSubmit}
        isLoading={mutations.createComboMutation?.isPending || mutations.updateComboMutation?.isPending}
      />

      <ProductCreationSuccess
        open={state.successDialogOpen}
        onOpenChange={state.setSuccessDialogOpen}
        productName={state.createdProductName}
        onAddImages={state.handleAddImagesFromSuccess}
        onSkip={state.handleSkipImages}
      />

      <ImageUploadDialog
        open={state.imageUploadOpen}
        onOpenChange={state.setImageUploadOpen}
        productId={state.uploadProductId || state.createdProductId}
        productName={state.uploadProductName || state.createdProductName}
        onUpload={(productId, files) => mutations.handleUploadImages(productId, files)}
        isUploading={mutations.uploadImagesMutation?.isPending || mutations.uploadComboImageMutation?.isPending}
      />

      <ConfirmDialog
        open={!!state.deleteProduct}
        onOpenChange={(open) => !open && state.setDeleteProduct(null)}
        title="Delete Product?"
        description={`This action is permanent. Are you sure you want to delete "${state.deleteProduct?.name}"?`}
        onConfirm={() => mutations.handleConfirmDelete(state.deleteProduct!.id)}
        confirmText="Confirm Deletion"
        variant="danger"
        isLoading={mutations.deleteMutation.isPending}
      />

      <ConfirmDialog
        open={!!state.deleteCombo}
        onOpenChange={(open) => !open && state.setDeleteCombo(null)}
        title="Deactivate Combo?"
        description={`This will hide the combo "${state.deleteCombo?.name}" from your catalog.`}
        onConfirm={() => mutations.handleConfirmDeleteCombo(state.deleteCombo!.id)}
        confirmText="Deactivate"
        variant="danger"
        isLoading={mutations.deleteComboMutation.isPending}
      />

      <ConfirmDialog
        open={!!state.deleteVariant}
        onOpenChange={(open) => !open && state.setDeleteVariant(null)}
        title="Delete Variant?"
        description={`Remove SKU: ${state.deleteVariant?.sku} permanently?`}
        onConfirm={() => mutations.handleConfirmDeleteVariant(state.deleteVariant!.id)}
        confirmText="Delete SKU"
        variant="danger"
        isLoading={mutations.deleteVariantMutation.isPending}
      />

      <ConfirmDialog
        open={!!state.bulkDeleteData}
        onOpenChange={(open) => !open && state.setBulkDeleteData(null)}
        title="Bulk Action Required"
        description={`You are about to deactivate ${state.bulkDeleteData?.ids.length} selected items. Continue?`}
        onConfirm={() => onRefresh()}
        confirmText="Confirm Bulk"
        variant="danger"
      />
    </>
  );
});

ProductDialogs.displayName = 'ProductDialogs';
