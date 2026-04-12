import { memo, useCallback } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import type { ComboFormValues } from '../index';
import type { Path, PathValue } from 'react-hook-form';
import type { ComboFormFieldsProps } from '../combo-form.types';
import ComboItemsPanel from '../ComboItemsPanel';
import LeftPanel from './LeftPanel';
import { PricingStrip } from '../sections';

const LEFT_PANEL_WIDTH = '440px';

const VariantLayout = memo(function VariantLayout({
    register, errors, isLoading, comboParents, watchValues,
    setField, handleNameChange, isEdit,
    isLoadingVariants, variantOptions,
}: ComboFormFieldsProps) {
    const handleSyncPrice = useCallback(() => {
        const total = (watchValues.items ?? []).reduce(
            (sum, i) => sum + (i.salePrice ?? 0) * (i.quantity ?? 1),
            0,
        );
        setField(
            'salePrice' as Path<ComboFormValues>,
            total as PathValue<ComboFormValues, 'salePrice'>,
        );
    }, [watchValues.items, setField]);

    return (
        <TabsContent value="unified" className="mt-0 outline-none h-full overflow-hidden">
            <div
                className="grid h-full w-full overflow-hidden"
                style={{ gridTemplateColumns: `${LEFT_PANEL_WIDTH} 1fr` }}
            >
                <LeftPanel
                    register={register}
                    errors={errors}
                    isLoading={isLoading}
                    comboParents={comboParents}
                    watchValues={watchValues}
                    setField={setField}
                    onNameChange={handleNameChange}
                    isEdit={isEdit}
                />

                <div className="flex flex-col bg-slate-50/60 min-h-0">
                    <PricingStrip
                        marketValue={watchValues.basePrice}
                        salePrice={watchValues.salePrice}
                        isLoading={isLoading}
                        setField={setField}
                        onSync={handleSyncPrice}
                    />

                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ComboItemsPanel
                            items={watchValues.items || []}
                            onChange={newItems =>
                                setField(
                                    'items' as Path<ComboFormValues>,
                                    newItems as PathValue<ComboFormValues, 'items'>,
                                )
                            }
                            onSyncPrice={total =>
                                setField(
                                    'salePrice' as Path<ComboFormValues>,
                                    total as PathValue<ComboFormValues, 'salePrice'>,
                                )
                            }
                            variantOptions={variantOptions}
                            isLoadingVariants={isLoadingVariants}
                            disabled={isLoading}
                            comboPriceOverride={watchValues.salePrice}
                        />
                    </div>
                </div>
            </div>
        </TabsContent>
    );
});

export default VariantLayout;
