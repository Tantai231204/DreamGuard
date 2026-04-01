import { memo } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import ProductDialog from './product-dialog';
import VariantDialog from './variant-dialog/VariantDialog';
import { ComboDialog } from './combo-dialog';
import { CertificateDialog } from './certificate/CertificateDialog';
import { ImageUploadDialog, ProductCreationSuccess } from './dialogs';
import { TemplateDialog } from '../../templates/components/TemplateDialog';
import type { AdminProductState, AdminProductMutations } from '../types';

interface ProductDialogsProps {
  state: AdminProductState;
  mutations: AdminProductMutations;
  onRefresh: () => void;
}

/**
 * Senior Optimization: Conditional Mounting
 * Heavy dialogs are only mounted when their 'open' state is true.
 * This prevents unnecessary React fiber initialization for all dialogs on page load.
 */
export const ProductDialogs = memo(({ state, mutations, onRefresh }: ProductDialogsProps) => {
  return (
    <>
      {state.dialogOpen && state.activeTab !== 'customize' && (
        <ProductDialog
          open={state.dialogOpen}
          onOpenChange={state.setDialogOpen}
          product={state.editingProduct}
          onSubmit={mutations.handleSubmit}
          isLoading={mutations.createMutation?.isPending || mutations.updateMutation?.isPending || state.isLoadingCategories}
          categories={state.categories}
          certificates={state.certificates}
          takenCustomTypes={state.takenCustomTypes}
        />
      )}

      {state.dialogOpen && state.activeTab === 'customize' && (
        <TemplateDialog
          open={state.dialogOpen}
          onOpenChange={state.setDialogOpen}
          product={state.editingProduct as import('@/api/types').FullyCustomizedProductResponse}
          onSubmit={mutations.handleSubmit as (data: import('@/api/types').CreateFullyCustomizedProductRequest | import('@/api/types').UpdateFullyCustomizedProductRequest) => Promise<void>}
          isSubmitting={mutations.createMutation?.isPending || mutations.updateMutation?.isPending}
          takenCustomTypes={state.takenCustomTypes}
        />
      )}

      {state.variantDialogOpen && (
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
          productType={state.variantProductType}
        />
      )}

      {state.comboDialogOpen && (
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
      )}

      {state.certDialogOpen && (
        <CertificateDialog
          open={state.certDialogOpen}
          onOpenChange={state.setCertDialogOpen}
          editingCert={state.editingCert}
          onSubmit={mutations.handleCertSubmit}
          isPending={mutations.createCertMutation?.isPending || mutations.updateCertMutation?.isPending}
        />
      )}

      {state.successDialogOpen && (
        <ProductCreationSuccess
          open={state.successDialogOpen}
          onOpenChange={state.setSuccessDialogOpen}
          productName={state.createdProductName}
          onAddImages={state.handleAddImagesFromSuccess}
          onSkip={state.handleSkipImages}
        />
      )}

      {state.imageUploadOpen && (
        <ImageUploadDialog
          open={state.imageUploadOpen}
          onOpenChange={state.setImageUploadOpen}
          productId={state.uploadProductId || state.createdProductId}
          productName={state.uploadProductName || state.createdProductName}
          onUpload={(productId, files) => mutations.handleUploadImages(productId, files)}
          isUploading={mutations.uploadImagesMutation?.isPending || mutations.uploadComboImageMutation?.isPending}
        />
      )}

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
        title="Delete Combo?"
        description={`This action is permanent. Are you sure you want to delete "${state.deleteCombo?.name}"?`}
        onConfirm={() => mutations.handleConfirmDeleteCombo(state.deleteCombo!.id)}
        confirmText="Confirm Deletion"
        variant="danger"
        isLoading={mutations.deleteComboMutation.isPending}
      />

      <ConfirmDialog
        open={!!state.deleteCert}
        onOpenChange={(open) => !open && state.setDeleteCert(null)}
        title="Delete Certificate?"
        description={`This action is permanent. Are you sure you want to delete "${state.deleteCert?.name}"?`}
        onConfirm={() => mutations.handleConfirmDeleteCert(state.deleteCert!.id)}
        confirmText="Confirm Deletion"
        variant="danger"
        isLoading={mutations.deleteCertMutation.isPending}
      />

      <ConfirmDialog
        open={!!state.deleteVariant}
        onOpenChange={(open) => !open && state.setDeleteVariant(null)}
        title="Hide Variant?"
        description={`Set status of SKU: ${state.deleteVariant?.sku} to Hidden?`}
        onConfirm={() => mutations.handleConfirmDeleteVariant(state.deleteVariant!.id)}
        confirmText="Hide SKU"
        variant="danger"
        isLoading={mutations.updateVariantStatusMutation.isPending}
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

      <ConfirmDialog
        open={!!state.statusChangeData}
        onOpenChange={(open) => !open && state.setStatusChangeData(null)}
        title="Confirm Status Change"
        description={
          state.statusChangeData
            ? `Change "${state.statusChangeData.name}" from ${state.statusChangeData.currentStatus} → ${state.statusChangeData.newStatus}? This affects product visibility and availability.`
            : ''
        }
        onConfirm={() => mutations.handleConfirmStatusChange()}
        confirmText="Confirm Change"
        variant="warning"
        isLoading={
          mutations.updateProductStatusMutation.isPending ||
          mutations.updateVariantStatusMutation.isPending ||
          mutations.updateComboStatusMutation.isPending
        }
      />
    </>
  );
});

ProductDialogs.displayName = 'ProductDialogs';
