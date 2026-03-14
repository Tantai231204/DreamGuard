import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FolderTree, Baby, Shirt, ChevronDown } from 'lucide-react';
import { AGE_GROUPS } from '../../types';
import type { CategoryResponse } from '@/api';
import SectionHeading from '../shared/SectionHeading';
import MaterialCombobox from '../shared/MaterialCombobox';
import { SELECT_CLS } from './constants';
import type { FlatCategory } from './useCategoryTree';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
                        <SelectContent className="rounded-xl shadow-xl">
                            {flatCategories.map((cat, index) => (
                                <SelectItem
                                    key={cat.cateId ?? `cat-${index}`}
                                    value={String(cat.cateId)}
                                    className="rounded-lg hover:bg-primary-50 hover:text-primary-900"
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
                    <Label htmlFor="p-age" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Baby className="h-3.5 w-3.5 text-gray-400" /> Age Group (months)
                    </Label>
                    <div className="relative flex">
                        <input
                            id="p-age"
                            type="number"
                            placeholder="6"
                            value={ageGroup}
                            onChange={(e) => onAgeGroupChange(e.target.value)}
                            disabled={isLoading}
                            className={cn(
                                "flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 pr-24",
                                "font-medium text-slate-900"
                            )}
                            min={0}
                        />
                        <div className="absolute right-0 top-0 h-full flex items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase mr-8 pointer-events-none tracking-wider">
                                mo
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="h-full px-2 hover:bg-slate-100 border-l border-slate-200 transition-colors rounded-r-xl"
                                        disabled={isLoading}
                                    >
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl">
                                    {Object.entries(AGE_GROUPS).map(([val, label]) => (
                                        <DropdownMenuItem
                                            key={val}
                                            onClick={() => onAgeGroupChange(val)}
                                            className="cursor-pointer text-xs font-medium py-2"
                                        >
                                            {label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
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
                        <SelectContent className="rounded-xl shadow-xl">
                            {childCategories.map((subCat) => (
                                <SelectItem
                                    key={subCat.cateId}
                                    value={String(subCat.cateId)}
                                    className="rounded-lg hover:bg-primary-50 hover:text-primary-900"
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
