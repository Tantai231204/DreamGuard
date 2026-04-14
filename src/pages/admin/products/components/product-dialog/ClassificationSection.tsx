import { memo, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
    FolderTree, Baby, Shirt, ChevronDown, ShieldCheck,
    Search, X, Plus, Leaf, ShieldAlert, Award, Globe
} from 'lucide-react';
import { AGE_GROUPS } from '../../types';
import type { CategoryResponse } from '@/api';
import SectionHeading from '../shared/SectionHeading';
import { SELECT_CLS } from './constants';
import type { FlatCategory } from './useCategoryTree';

interface ClassificationSectionProps {
    cateId: string;
    ageGroup: string;
    subCateId: string;
    material: string;
    certificateIds: string[];
    flatCategories: FlatCategory[];
    childCategories: CategoryResponse[];
    allCertificates: import('../../types').Certificate[];
    isLoading: boolean;
    onCateChange: (value: string) => void;
    onAgeGroupChange: (value: string) => void;
    onSubCateIdChange: (value: string) => void;
    onMaterialChange: (value: string) => void;
    onCertificatesChange: (value: string[]) => void;
    takenCustomTypes?: string[];
}

/**
 * Mapping of common certificate names to icons for that premium look
 */
const getCertIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('gots') || n.includes('organic')) return <Leaf className="h-5 w-5 text-emerald-500" />;
    if (n.includes('oeko') || n.includes('standard')) return <Award className="h-5 w-5 text-blue-500" />;
    if (n.includes('ce') || n.includes('eu')) return <Globe className="h-5 w-5 text-purple-500" />;
    if (n.includes('cpsc') || n.includes('safety')) return <ShieldAlert className="h-5 w-5 text-amber-500" />;
    return <ShieldCheck className="h-5 w-5 text-primary-500" />;
};

const getCertColors = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('gots') || n.includes('organic')) return "border-emerald-100 bg-emerald-50/30";
    if (n.includes('oeko')) return "border-blue-100 bg-blue-50/30";
    if (n.includes('ce')) return "border-purple-100 bg-purple-50/30";
    if (n.includes('cpsc')) return "border-amber-100 bg-amber-50/30";
    return "border-primary-100 bg-primary-50/30";
};

/**
 * Custom Combobox-style selector for Certificates
 */
const CertificateSelector = ({
    allCertificates,
    selectedIds,
    onSelect,
    isLoading
}: {
    allCertificates: import('../../types').Certificate[],
    selectedIds: string[],
    onSelect: (id: string) => void,
    isLoading: boolean
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const availableCerts = useMemo(() => {
        return (allCertificates || []).filter(c =>
            !selectedIds.includes(c.id) &&
            c.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [allCertificates, selectedIds, search]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={isLoading}
                    className="w-full h-[54px] justify-between rounded-xl border-2 border-slate-200/60 bg-slate-50/30 hover:border-blue-400 hover:bg-white shadow-sm transition-all px-4 group data-[state=open]:border-blue-500 data-[state=open]:bg-white data-[state=open]:ring-4 data-[state=open]:ring-blue-500/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 group-data-[state=open]:bg-blue-600 group-data-[state=open]:text-white transition-all shadow-sm">
                            <Plus className="h-4 w-4" />
                        </div>
                        <span className="text-[14px] font-bold text-slate-600 group-data-[state=open]:text-slate-900 transition-colors">
                            Assign compliance certifications...
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 group-data-[state=open]:rotate-180 transition-transform duration-300" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-1.5 rounded-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-200/60 bg-white/95 backdrop-blur-xl overflow-hidden pointer-events-auto z-[9999]"
                align="start"
                sideOffset={12}
            >
                {/* Search Bar */}
                <div className="flex items-center gap-2 px-3 pb-2 pt-1 border-b border-slate-100/80 mb-1">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                        className="flex h-10 w-full bg-transparent text-[13px] font-bold outline-none placeholder:text-slate-400 text-slate-800"
                        placeholder="Search standard (e.g. ISO, CE, OEKO-TEX)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="h-3 w-3 text-slate-400" />
                        </button>
                    )}
                </div>

                <div
                    className="max-h-[300px] overflow-y-auto custom-scrollbar scroll-smooth p-1"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <div className="space-y-1">
                        {availableCerts.length > 0 ? (
                            availableCerts.map((cert) => (
                                <button
                                    key={cert.id}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSelect(cert.id);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                    className="relative flex w-full cursor-pointer items-center justify-between rounded-xl p-2.5 outline-none transition-all group hover:bg-slate-50 focus:bg-slate-50 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3 w-full min-w-0 pr-4">
                                        <div className={cn(
                                            "w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl border shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md",
                                            getCertColors(cert.name)
                                        )}>
                                            {getCertIcon(cert.name)}
                                        </div>
                                        <div className="flex flex-col text-left min-w-0 flex-1">
                                            <span className="font-extrabold text-[13px] text-slate-800 tracking-tight truncate group-hover:text-blue-700 transition-colors">
                                                {cert.name}
                                            </span>
                                            {cert.summary ? (
                                                <span className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                                    {cert.summary}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-300 italic truncate mt-0.5">
                                                    Official compliance standard
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 shadow-sm border border-blue-200">
                                            <Plus className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center text-slate-400 animate-in zoom-in-95">
                                <div className="p-4 rounded-full bg-slate-50 border border-slate-100">
                                    <ShieldCheck className="h-8 w-8 text-slate-300" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-slate-600">
                                        {search ? "No matching standards" : "All standards applied!"}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-400 mt-1">
                                        {search ? "Try a different keyword" : "This product is fully certified"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

const ClassificationSection = memo(function ClassificationSection({
    cateId, ageGroup, subCateId, material, certificateIds,
    flatCategories, childCategories, allCertificates,
    isLoading,
    onCateChange, onAgeGroupChange, onSubCateIdChange, onMaterialChange, onCertificatesChange,
}: ClassificationSectionProps) {
    const hasSubcategories = childCategories.length > 0;

    return (
        <section className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            {/* Classification Attributes */}
            <div className="space-y-6 pt-1">
                <SectionHeading title="Product Details & Classification" />

                <div className="space-y-5">
                    {/* Primary Category */}
                    <div className="space-y-2">
                        <Label className="text-[11px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-1.5 ml-1">
                            <FolderTree className="h-3 w-3" /> Main Category
                        </Label>
                        <Select value={cateId} onValueChange={onCateChange} disabled={isLoading}>
                            <SelectTrigger className={cn(SELECT_CLS, "w-full h-12 shadow-sm")}>
                                <FolderTree className="h-4 w-4 text-gray-400 shrink-0" />
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl max-h-[300px]">
                                {flatCategories.map((cat, index) => (
                                    <SelectItem
                                        key={cat.cateId ?? `cat-${index}`}
                                        value={String(cat.cateId)}
                                        className="rounded-lg hover:bg-primary-50 hover:text-primary-900"
                                    >
                                        <span style={{ paddingLeft: `${cat.depth * 16}px` }} className="flex items-center gap-1.5 font-medium">
                                            {cat.depth > 0 && <span className="text-gray-300">└</span>}
                                            {cat.name}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Material (Unified with Subcategory if possible) */}
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-1.5 ml-1">
                                <Shirt className="h-3 w-3" /> {hasSubcategories ? "Primary Material" : "Core Material"}
                            </Label>
                            {hasSubcategories ? (
                                <Select value={subCateId} onValueChange={onSubCateIdChange} disabled={isLoading}>
                                    <SelectTrigger className={cn(SELECT_CLS, "w-full h-12 shadow-sm border-dashed bg-gray-50/50 hover:bg-white transition-all")}>
                                        <Shirt className="h-4 w-4 text-gray-400 shrink-0" />
                                        <SelectValue placeholder="Select specific material" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className="rounded-xl shadow-2xl border-gray-100 p-0 pointer-events-auto z-[9999]"
                                        sideOffset={6}
                                    >
                                        <div
                                            className="max-h-[300px] overflow-y-auto custom-scrollbar p-1 overscroll-contain"
                                            onWheel={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => e.stopPropagation()}
                                        >
                                            {childCategories.map((subCat) => (
                                                <SelectItem
                                                    key={subCat.cateId}
                                                    value={String(subCat.cateId)}
                                                    className="rounded-lg hover:bg-primary-50 transition-colors"
                                                >
                                                    {subCat.name}
                                                </SelectItem>
                                            ))}
                                        </div>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="e.g. Natural Latex, Cotton"
                                    value={material}
                                    onChange={(e) => onMaterialChange(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(
                                        "flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50",
                                        "font-medium text-slate-900 shadow-sm"
                                    )}
                                />
                            )}
                        </div>                        {/* Age Group */}
                        <div className="space-y-2">
                            <Label htmlFor="p-age" className="text-[11px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-1.5 ml-1">
                                <Baby className="h-3 w-3" /> Target Age
                            </Label>
                            <div className="relative flex group">
                                <input
                                    id="p-age"
                                    type="number"
                                    placeholder="0"
                                    value={ageGroup}
                                    onChange={(e) => onAgeGroupChange(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(
                                        "flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 pr-28",
                                        "font-bold text-slate-900 shadow-sm"
                                    )}
                                    min={0}
                                />
                                <div className="absolute right-0 top-0 h-full flex items-center pointer-events-none text-slate-400 px-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest group-focus-within:text-primary-400 transition-colors mr-10">
                                        Months
                                    </span>
                                </div>
                                <div className="absolute right-0 top-0 h-full flex items-center">
                                    <Popover modal={false}>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="h-full px-2 hover:bg-slate-100 border-l border-slate-100 transition-colors rounded-r-xl"
                                                disabled={isLoading}
                                            >
                                                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            align="end"
                                            className="w-48 rounded-xl shadow-2xl border-gray-100 p-0 pointer-events-auto z-[9999]"
                                            sideOffset={8}
                                        >
                                            <div
                                                className="max-h-[220px] overflow-y-auto custom-scrollbar p-1 overscroll-contain"
                                                onWheel={(e) => e.stopPropagation()}
                                                onTouchStart={(e) => e.stopPropagation()}
                                            >
                                                <div className="space-y-1">
                                                    {Object.entries(AGE_GROUPS).map(([val, label]) => (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => onAgeGroupChange(val)}
                                                            className="flex w-full cursor-pointer items-center rounded-lg py-2.5 px-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 uppercase tracking-tight transition-all text-left"
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compliance Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100/60">
                <div className="flex items-center justify-between mt-1">
                    <SectionHeading title="Compliance & Standards" />
                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 uppercase shadow-sm flex items-center gap-1.5 tracking-tighter">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {certificateIds.length} Selected
                    </span>
                </div>

                <div className="space-y-4">
                    {/* Selector */}
                    <CertificateSelector
                        allCertificates={allCertificates}
                        selectedIds={certificateIds}
                        onSelect={(id) => onCertificatesChange([...certificateIds, id])}
                        isLoading={isLoading}
                    />

                    {/* Selected Premium Cards Scrollable Grid */}
                    {certificateIds.length > 0 && (
                        <div className="max-h-[280px] overflow-y-auto pr-2 -mr-2 custom-scrollbar scroll-smooth overscroll-contain">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1 animate-in fade-in slide-in-from-top-2 duration-500">
                                {certificateIds.map(id => {
                                    const cert = allCertificates.find(c => c.id === id);
                                    if (!cert) return null;
                                    return (
                                        <div
                                            key={id}
                                            className={cn(
                                                "relative flex flex-col p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-1 group overflow-hidden bg-gradient-to-br from-white/60 to-transparent backdrop-blur-sm",
                                                getCertColors(cert.name)
                                            )}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => onCertificatesChange(certificateIds.filter(v => v !== id))}
                                                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 hover:bg-rose-500 hover:text-white text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-sm backdrop-blur-md"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>

                                            <div className="flex items-start gap-3.5">
                                                <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-black/[0.03] group-hover:scale-110 transition-transform duration-300">
                                                    {getCertIcon(cert.name)}
                                                </div>
                                                <div className="flex flex-col gap-1 pr-4 pt-0.5">
                                                    <h4 className="font-extrabold text-[12px] uppercase text-slate-800 tracking-wider leading-tight line-clamp-1 group-hover:text-blue-700 transition-colors">
                                                        {cert.name}
                                                    </h4>
                                                    <p className="text-[11px] font-medium text-slate-500/90 leading-snug line-clamp-2">
                                                        {cert.summary || cert.description || "Certified safe compliance standard for premium quality."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
});

export default ClassificationSection;
