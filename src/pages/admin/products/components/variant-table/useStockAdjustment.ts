// src/pages/admin/products/components/useStockAdjustment.ts
import { useState } from 'react';
import { useAddStock, useReduceStock, useAddDefectStock, useReduceDefectStock } from '@/hooks/queries/useProduct';
import { useToast } from '@/hooks/useToast';

export interface StockDialogState {
  isOpen: boolean;
  type: 'add' | 'reduce' | 'add-defect' | 'reduce-defect';
  variantId: string;
  sku: string;
  currentStock: number;
}

export function useStockAdjustment() {
  const toast = useToast();
  const addStockMutation = useAddStock();
  const reduceStockMutation = useReduceStock();

  const addDefectMutation = useAddDefectStock();
  const reduceDefectMutation = useReduceDefectStock();

  const [stockDialog, setStockDialog] = useState<StockDialogState>({
    isOpen: false,
    type: 'add',
    variantId: '',
    sku: '',
    currentStock: 0,
  });
  const [stockQuantity, setStockQuantity] = useState<number>(1);

  const openDialog = (
    type: 'add' | 'reduce' | 'add-defect' | 'reduce-defect',
    variantId: string,
    sku: string,
    currentStock: number
  ) => {
    setStockDialog({ isOpen: true, type, variantId, sku, currentStock });
    setStockQuantity(1);
  };

  const closeDialog = () => {
    setStockDialog((prev) => ({ ...prev, isOpen: false }));
    setStockQuantity(1);
  };

  const submitStockAdjustment = (reason: string) => {
    if (stockQuantity <= 0) {
      toast.error('Invalid quantity', 'Quantity must be greater than 0');
      return;
    }

    if (!reason) {
      toast.error('Accountability Error', 'Please select a valid reason for this adjustment.');
      return;
    }

    let mutation = null;
    let action = '';

    switch (stockDialog.type) {
      case 'add':
        mutation = addStockMutation;
        action = 'Added Stock';
        break;
      case 'reduce':
        mutation = reduceStockMutation;
        action = 'Reduced Stock';
        break;
      case 'add-defect':
        mutation = addDefectMutation;
        action = 'Added Defect';
        break;
      case 'reduce-defect':
        mutation = reduceDefectMutation;
        action = 'Reduced Defect';
        break;
    }

    if (!mutation) return;

    mutation.mutate(
      { productVariantId: stockDialog.variantId, quantity: stockQuantity },
      {
        onSuccess: () => {
          toast.success(
            `${action} Successfully`,
            `Audit log recorded: [${reason}] for ${stockQuantity} units.`
          );
          closeDialog();
        },
      }
    );
  };

  return {
    stockDialog,
    stockQuantity,
    setStockQuantity,
    openDialog,
    closeDialog,
    submitStockAdjustment,
    isSubmitting: addStockMutation.isPending || reduceStockMutation.isPending || addDefectMutation.isPending || reduceDefectMutation.isPending,
  };
}
