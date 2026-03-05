import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ChildComboItems from '../ChildComboItems';
import { getColorHex } from '../combo-utils';
import { VariantActionDropdown } from './VariantActionDropdown';
import { EmptyResults } from './StatsAndFeedback';
import type { Combo } from '../../../types';
import type { ComboResponse } from '@/api/services/comboService';

interface VariantListViewProps {
    childCombos: ComboResponse[];
    onEditVariant?: (v: Combo) => void;
    onDeleteVariant?: (v: Combo) => void;
    onDuplicateVariant?: (v: Combo) => void;
    statusMap: Record<string, { label: string; className: string }>;
}

export function VariantListView({
    childCombos,
    onEditVariant,
    onDeleteVariant,
    onDuplicateVariant,
    statusMap,
}: VariantListViewProps) {
    if (childCombos.length === 0) return <EmptyResults />;

    return (
        <div className="divide-y-4 divide-gray-50">
            {childCombos.map((child, idx) => (
                <div key={child.id} className={`p-6 transition-all hover:bg-white ${idx % 2 === 0 ? 'bg-gray-50/20' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-md ring-1 ring-gray-100"
                                style={{ backgroundColor: getColorHex(child.color) }}
                            >
                                <span className="text-[10px] font-black mix-blend-difference text-white">{child.size || 'N/A'}</span>
                            </div>
                            <div>
                                <h5 className="text-sm font-black text-gray-800 leading-none">{child.name}</h5>
                                {child.description && (
                                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 max-w-[400px]">
                                        {child.description}
                                    </p>
                                )}
                                <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-widest">{child.sku}</p>
                            </div>
                            <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusMap[child.status]?.className}`}>
                                {child.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm font-black text-gray-900 leading-none">{(child.salePrice || child.basePrice).toLocaleString('vi-VN')}đ</div>
                                <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-tighter">Base: {child.basePrice.toLocaleString('vi-VN')}đ</p>
                            </div>
                            <Separator orientation="vertical" className="h-8 bg-gray-200" />
                            <VariantActionDropdown
                                variant={child as unknown as Combo}
                                onEdit={onEditVariant}
                                onDelete={onDeleteVariant}
                                onDuplicate={onDuplicateVariant}
                            />
                        </div>
                    </div>
                    <ChildComboItems childId={child.id} childName={child.name} parentChildData={child} isDense />
                </div>
            ))}
        </div>
    );
}
