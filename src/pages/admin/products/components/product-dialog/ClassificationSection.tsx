import { memo } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FolderTree, Baby, Shirt } from 'lucide-react';
import { AGE_GROUPS } from '../../types';
import type { CategoryResponse } from '@/api';
import SectionHeading from '../shared/SectionHeading';
import MaterialCombobox from '../shared/MaterialCombobox';
import { SELECT_CLS } from './constants';
import type { FlatCategory } from './useCategoryTree';

interface ClassificationSectionProps {
    cateId: string;
    ageGroup: string;
    subCateId: string;
    material: string;
    flatCategories: FlatCategory[];
    childCategories: CategoryResponse[];
    isLoading: boolean;
    onCateChange: (value: string) => void;
    onAgeGroupChange: (value: string) => void;
    onSubCateIdChange: (value: string) => void;
    onMaterialChange: (value: string) => void;
}

const ClassificationSection = memo(function ClassificationSection({
    cateId, ageGroup, subCateId, material,
    flatCategories, childCategories,
    isLoading,
    onCateChange, onAgeGroupChange, onSubCateIdChange, onMaterialChange,
}: ClassificationSectionProps) {
    const hasSubcategories = childCategories.length > 0;

    return (
        <section className="space-y-4">
            <SectionHeading title="Classification" />

            <div className="grid grid-cols-2 gap-5">
                {/* Category */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <FolderTree className="h-3.5 w-3.5 text-gray-400" /> Category
                    </Label>
                    <Select value={cateId} onValueChange={onCateChange} disabled={isLoading}>
                        <SelectTrigger className={SELECT_CLS}>
                            <span className="flex-1">
                                <FolderTree className="h-4 w-4 text-gray-400 shrink-0" />
                                <SelectValue placeholder="Select category" />
                            </span>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-xl z-[200]">
                            {flatCategories.map((cat, index) => (
                                <SelectItem
                                    key={cat.cateId ?? `cat-${index}`}
                                    value={String(cat.cateId)}
                                    className="rounded-lg hover:bg-purple-50 hover:text-purple-900"
                                >
                                    <span style={{ paddingLeft: `${cat.depth * 16}px` }} className="flex items-center gap-1.5">
                                        {cat.depth > 0 && <span className="text-gray-300">└</span>}
                                        {cat.name}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Age Group */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Baby className="h-3.5 w-3.5 text-gray-400" /> Age Group
                    </Label>
                    <Select value={ageGroup} onValueChange={onAgeGroupChange} disabled={isLoading}>
                        <SelectTrigger className={SELECT_CLS}>
                            <span className="flex-1">
                                <Baby className="h-4 w-4 text-gray-400 shrink-0" />
                                <SelectValue placeholder="Select age group" />
                            </span>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-xl z-[200]">
                            {Object.entries(AGE_GROUPS).map(([key, label]) => (
                                <SelectItem key={`age-${key}`} value={key} className="rounded-lg hover:bg-purple-50 hover:text-purple-900">
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Subcategory or Material */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    {hasSubcategories ? (
                        <><FolderTree className="h-3.5 w-3.5 text-gray-400" /> Subcategory</>
                    ) : (
                        <><Shirt className="h-3.5 w-3.5 text-gray-400" /> Material <span className="text-red-500">*</span></>
                    )}
                </Label>
                {hasSubcategories ? (
                    <Select value={subCateId} onValueChange={onSubCateIdChange} disabled={isLoading}>
                        <SelectTrigger className={SELECT_CLS}>
                            <span className="flex-1">
                                <FolderTree className="h-4 w-4 text-gray-400 shrink-0" />
                                <SelectValue placeholder="Select subcategory" />
                            </span>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-xl z-[200]">
                            {childCategories.map((subCat) => (
                                <SelectItem
                                    key={subCat.cateId}
                                    value={String(subCat.cateId)}
                                    className="rounded-lg hover:bg-purple-50 hover:text-purple-900"
                                >
                                    {subCat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <MaterialCombobox value={material} onChange={onMaterialChange} disabled={isLoading} />
                )}
            </div>
        </section>
    );
});

export default ClassificationSection;
