import { memo, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { INPUT_CLS } from '../index';
import type { ComboFormValues } from '../index';
import type { FieldErrors, UseFormRegister, Path, PathValue } from 'react-hook-form';
import type { VariantOption } from '@/hooks/queries/useProduct';
import type { SetFieldFn } from '../combo-form.types';
import ColorPicker from '../../variant-dialog/ColorPicker';
import VirtualVariantSelect from '../VirtualVariantSelect';
import { ErrorMsg, SectionDivider, Field } from '../primitives';
import { StatusSelect, AgeGroupSelect, DescriptionField } from '../sections';

interface LeftPanelProps {
    register: UseFormRegister<ComboFormValues>;
    errors: FieldErrors<ComboFormValues>;
    isLoading: boolean;
    comboParents: { id: string; label: string; imageUrl?: string; sku?: string }[];
    watchValues: Partial<ComboFormValues>;
    setField: SetFieldFn;
    onNameChange: (v: string) => void;
    comboId?: string;
    isEdit: boolean;
}

const LeftPanel = memo(function LeftPanel({
    register,
    errors,
    isLoading,
    comboParents,
    watchValues,
    setField,
    onNameChange,
    isEdit,
}: LeftPanelProps) {
    const transformedParents = useMemo<VariantOption[]>(
        () =>
            comboParents.map(p => ({
                variantId: p.id,
                productId: p.id,
                productName: p.label,
                imageUrl: p.imageUrl,
                sku: p.sku || '',
                basePrice: 0,
                salePrice: 0,
                stockQuantity: 0,
                stockStatus: 'InStock',
                status: 'Published' as const,
                label: p.label,
            })),
        [comboParents],
    );

    const handleStatusChange = useCallback(
        (v: string) => setField('status' as Path<ComboFormValues>, v as PathValue<ComboFormValues, 'status'>),
        [setField],
    );
    const handleAgeGroupChange = useCallback(
        (v: string) => setField('ageGroup' as Path<ComboFormValues>, Number(v) as PathValue<ComboFormValues, 'ageGroup'>),
        [setField],
    );
    const handleColorChange = useCallback(
        (_name: string, code: string) => setField('color' as Path<ComboFormValues>, code as PathValue<ComboFormValues, 'color'>),
        [setField],
    );
    const handleParentChange = useCallback(
        (vid: string) => setField('comboParentId' as Path<ComboFormValues>, vid as PathValue<ComboFormValues, 'comboParentId'>),
        [setField],
    );

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-white border-r border-slate-100">
            <div className="flex-1 p-5 space-y-6">

                {/* ── Identity ── */}
                <section>
                    <SectionDivider label="Identity" />
                    <div className="space-y-3">
                        <Field label="Variant name" required>
                            <Input
                                {...register('name')}
                                placeholder="e.g. XL / Rose Gold"
                                onChange={e => onNameChange(e.target.value)}
                                disabled={isLoading}
                                className={cn(INPUT_CLS, 'bg-white', errors.name && 'border-red-400')}
                            />
                            <ErrorMsg error={errors.name} />
                        </Field>

                        <Field label="URL slug" hint="Auto-generated">
                            <Input
                                {...register('slug')}
                                disabled
                                className={cn(INPUT_CLS, 'bg-slate-50 font-mono text-[11px] text-slate-400 cursor-not-allowed')}
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Parent combo" required>
                                <VirtualVariantSelect
                                    value={String(watchValues.comboParentId || '')}
                                    onChange={handleParentChange}
                                    variantOptions={transformedParents}
                                    isLoading={isLoading}
                                    placeholder="Select parent…"
                                    disabled={isLoading || isEdit}
                                />
                                <ErrorMsg error={errors.comboParentId} />
                            </Field>

                            <StatusSelect
                                value={String(watchValues.status || 'Draft')}
                                onChange={handleStatusChange}
                                error={errors.status}
                                disabled={isLoading}
                                readOnly={!isEdit}
                            />
                        </div>

                        <AgeGroupSelect
                            value={String(watchValues.ageGroup || '')}
                            onChange={handleAgeGroupChange}
                            error={errors.ageGroup}
                            disabled={isLoading}
                        />

                        <DescriptionField
                            register={register}
                            charCount={watchValues.description?.length ?? 0}
                            error={errors.description}
                            disabled={isLoading}
                            placeholder="Briefly describe this variant…"
                        />
                    </div>
                </section>

                {/* ── Appearance ── */}
                <section>
                    <SectionDivider label="Appearance" />
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Color theme">
                            <ColorPicker
                                color=""
                                colorCode={watchValues.color || ''}
                                onColorChange={handleColorChange}
                                disabled={isLoading}
                            />
                        </Field>
                        <Field label="Size / dimension">
                            <Input
                                {...register('size')}
                                placeholder="e.g. 50×60 cm"
                                disabled={isLoading}
                                className={cn(INPUT_CLS, 'bg-white')}
                            />
                        </Field>
                    </div>
                </section>
            </div>
        </div>
    );
});

export default LeftPanel;
