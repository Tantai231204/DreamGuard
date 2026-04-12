import { memo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TabsContent } from '@/components/ui/tabs';
import { INPUT_CLS } from '../index';
import type { ComboFormValues } from '../index';
import type { Path, PathValue } from 'react-hook-form';
import type { ComboFormFieldsProps } from '../combo-form.types';
import { ErrorMsg, SectionDivider, Field } from '../primitives';
import { StatusSelect, AgeGroupSelect, DescriptionField, MediaBlock } from '../sections';

const ParentLayout = memo(function ParentLayout({
    register, errors, isLoading, watchValues, setField,
    handleNameChange, comboId, isEdit, parentPriceRange,
}: ComboFormFieldsProps) {
    const handleStatusChange = useCallback(
        (v: string) => setField('status' as Path<ComboFormValues>, v as PathValue<ComboFormValues, 'status'>),
        [setField],
    );
    const handleAgeGroupChange = useCallback(
        (v: string) => setField('ageGroup' as Path<ComboFormValues>, Number(v) as PathValue<ComboFormValues, 'ageGroup'>),
        [setField],
    );

    return (
        <div className="animate-in fade-in duration-300">
            <TabsContent value="general" className="mt-0 space-y-5 animate-in fade-in slide-in-from-left-1 duration-200">
                <section className="space-y-3">
                    <SectionDivider label="Identity & attributes" />
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Combo name" required>
                            <Input
                                {...register('name')}
                                placeholder="e.g. Dreamy Night Pack"
                                onChange={e => handleNameChange(e.target.value)}
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <StatusSelect
                            value={String(watchValues.status || 'Draft')}
                            onChange={handleStatusChange}
                            error={errors.status}
                            disabled={isLoading}
                            readOnly={!isEdit}
                        />
                        <AgeGroupSelect
                            value={String(watchValues.ageGroup || '')}
                            onChange={handleAgeGroupChange}
                            error={errors.ageGroup}
                            disabled={isLoading}
                        />
                    </div>

                    {isEdit && parentPriceRange && (
                        <Field label="Dynamic Variant Pricing" hint="Calculated based on existing variants">
                            <div className="flex h-10 w-full items-center pl-3 pr-4 rounded-lg border border-slate-200 bg-slate-50/80 text-sm font-semibold text-slate-700 select-none">
                                <span className="flex-1 opacity-90">{parentPriceRange}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-4 rounded-md bg-white border border-slate-200 px-2 py-0.5 shadow-sm">Auto</span>
                            </div>
                        </Field>
                    )}

                    <DescriptionField
                        register={register}
                        charCount={watchValues.description?.length ?? 0}
                        error={errors.description}
                        disabled={isLoading}
                        placeholder="Provide a summary of this combo…"
                    />
                </section>

                <section className="space-y-3">
                    <SectionDivider label="Media" />
                    <MediaBlock
                        watchValues={watchValues}
                        comboId={comboId}
                        setField={setField}
                    />
                </section>
            </TabsContent>
        </div>
    );
});

export default ParentLayout;
