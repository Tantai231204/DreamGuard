/**
 * Shared type definitions for ComboFormFields and its sub-components.
 * Centralized here to avoid circular imports and keep each file focused.
 */
import type { FieldErrors, UseFormRegister, Path, PathValue } from 'react-hook-form';
import type { ComboDialogMode, ComboFormValues } from './index';
import type { VariantOption } from '@/hooks/queries/useProduct';

// ── Generic field setter ─────────────────────────────────
export type SetFieldFn = <K extends Path<ComboFormValues>>(
    field: K,
    value: PathValue<ComboFormValues, K>,
) => void;

// ── Top-level form props (passed from ComboDialog → Router) ──
export interface ComboFormFieldsProps {
    register: UseFormRegister<ComboFormValues>;
    errors: FieldErrors<ComboFormValues>;
    comboParents: { id: string; label: string; imageUrl?: string; sku?: string }[];
    variantOptions: VariantOption[];
    handleNameChange: (v: string) => void;
    setField: SetFieldFn;
    isEdit: boolean;
    mode: ComboDialogMode;
    isLoading: boolean;
    isLoadingVariants: boolean;
    watchValues: Partial<ComboFormValues>;
    comboId?: string;
    parentPriceRange?: string | null;
}
