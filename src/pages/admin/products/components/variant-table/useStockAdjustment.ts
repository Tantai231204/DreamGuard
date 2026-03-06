// src/pages/admin/products/components/useStockAdjustment.ts
import { useState } from 'react';
import { useAddStock, useReduceStock } from '@/hooks/queries/useProduct';
import { useToast } from '@/hooks/useToast';

interface StockDialogState {
  isOpen: boolean;
  type: 'add' | 'reduce';
  variantId: string;
  sku: string;
  currentStock: number;
}

export function useStockAdjustment() {
  const toast = useToast();
  const addStockMutation = useAddStock();
  const reduceStockMutation = useReduceStock();

  const [stockDialog, setStockDialog] = useState<StockDialogState>({
    isOpen: false,
    type: 'add',
    variantId: '',
    sku: '',
    currentStock: 0,
  });
  const [stockQuantity, setStockQuantity] = useState<number>(1);

  const openDialog = (
    type: 'add' | 'reduce',
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

  const submitStockAdjustment = () => {
    if (stockQuantity <= 0) {
      toast.error('Invalid quantity', 'Quantity must be greater than 0');
      return;
    }

    const mutation = stockDialog.type === 'add' ? addStockMutation : reduceStockMutation;

    mutation.mutate(
      { productVariantId: stockDialog.variantId, quantity: stockQuantity },
      {
        onSuccess: () => {
          toast.success(
            stockDialog.type === 'add' ? 'Stock added' : 'Stock reduced',
            `Successfully ${stockDialog.type === 'add' ? 'added' : 'reduced'} ${stockQuantity} units`
          );
          closeDialog();
        },
        // Error is handled by global interceptor - no need for onError
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
    isSubmitting: addStockMutation.isPending || reduceStockMutation.isPending,
  };
}
