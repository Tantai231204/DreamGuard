import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Package, Power, Loader2, Check,
    Upload, ImagePlus, X, Settings2, ChevronDown
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useProductTypes } from '@/hooks/queries/useProductType';
import type { ServicePackage } from '@/api/services/servicePackageService';

export interface PackageFormData {
    packageName: string;
    description: string;
    serviceContent: string;
    suitableFor: string;
    benefits: string;
    duration: number;
    status: 'Active' | 'Inactive';
    file?: File;
}

const packageStyles = {
    standard: {
        accent: 'bg-slate-800',
        bg: 'bg-slate-50/40',
        border: 'border-slate-800/20',
        iconBg: 'bg-slate-50',
        icon: 'text-slate-800',
        shadow: 'shadow-slate-800/10',
        gradient: 'from-slate-700 to-slate-900',
    },
    medium: { // Vừa
        accent: 'bg-blue-500',
        bg: 'bg-blue-50/40',
        border: 'border-blue-500/30',
        iconBg: 'bg-blue-50',
        icon: 'text-blue-600',
        shadow: 'shadow-blue-500/10',
        gradient: 'from-blue-500 to-primary-600',
    },
    premium: {
        accent: 'bg-amber-500', // Gold
        bg: 'bg-amber-50/40',
        border: 'border-amber-500/30',
        iconBg: 'bg-amber-50',
        icon: 'text-amber-600',
        shadow: 'shadow-amber-500/10',
        gradient: 'from-amber-400 to-orange-500',
    },
    default: {
        accent: 'bg-[#4988c4]',
        bg: 'bg-blue-50/30',
        border: 'border-blue-500/20',
        iconBg: 'bg-blue-50',
        icon: 'text-[#4988c4]',
        shadow: 'shadow-[#4988c4]/10',
        gradient: 'from-zinc-700 to-zinc-900',
    }
};

interface ServicePackageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pkg: ServicePackage | null;
    onSubmit: (data: PackageFormData) => void;
    isLoading: boolean;
}

export default function ServicePackageDialog({
    open,
    onOpenChange,
    pkg,
    onSubmit,
    isLoading
}: ServicePackageDialogProps) {
    const isEdit = !!pkg;
    const { data: productTypesData } = useProductTypes({ pageSize: 100, isActive: true });
    const productTypes = useMemo(() => productTypesData?.items ?? [], [productTypesData]);

    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<PackageFormData>({
        defaultValues: {
            packageName: '',
            description: '',
            serviceContent: '',
            suitableFor: '',
            benefits: '',
            duration: 60,
            status: 'Active',
        }
    });

    const watchedValues = useWatch({ control });
    const statusValue = watchedValues.status ?? 'Active';
    const suitableForValue = watchedValues.suitableFor ?? '';
    const durationValue = watchedValues.duration ?? 60;
    const fileValue = watchedValues.file;

    // Preview
    const packageNameValue = watchedValues.packageName ?? '';
    const contentValue = watchedValues.serviceContent ?? '';
    const benefitsValue = watchedValues.benefits ?? '';

    useEffect(() => {
        if (pkg && open) {
            reset({
                packageName: pkg.packageName,
                description: pkg.description,
                serviceContent: pkg.serviceContent,
                suitableFor: pkg.suitableFor || '',
                benefits: pkg.benefits,
                duration: pkg.duration,
                status: pkg.status,
            });
        } else if (!open) {
            reset({
                packageName: '',
                description: '',
                serviceContent: '',
                suitableFor: '',
                benefits: '',
                duration: 60,
                status: 'Active',
            });
        }
    }, [pkg, reset, open, productTypes]);

    useEffect(() => {
        if (pkg && open && productTypes.length > 0 && !suitableForValue) {
            const matchedType = productTypes.find(t => t.productTypeName === pkg.suitableFor || t.productTypeId === pkg.suitableFor);
            if (matchedType) setValue('suitableFor', matchedType.productTypeId);
        }
    }, [productTypes, pkg, open, setValue, suitableForValue]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setValue('file', file);
    };

    const parsedBenefits = useMemo(() => benefitsValue.split('\n').join(',').split(',').map(b => b.trim()).filter(Boolean), [benefitsValue]);

    // Color mappings for package tiers
    const currentStyle = useMemo(() => {
        const lowerName = packageNameValue.toLowerCase().trim();
        if (lowerName.includes('standard')) return packageStyles.standard;
        if (lowerName.includes('vừa') || lowerName.includes('medium')) return packageStyles.medium;
        if (lowerName.includes('premium')) return packageStyles.premium;
        return packageStyles.default;
    }, [packageNameValue]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1050px] h-[90vh] p-0 overflow-hidden bg-[#fafafa] border-zinc-200 shadow-xl flex flex-col rounded-[24px]">

                {/* Header */}
                <DialogHeader className="px-10 py-6 border-b border-zinc-100 bg-white flex-shrink-0 z-10 relative">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center shadow-sm border border-zinc-100 relative overflow-hidden group">
                            <Package className={`w-5 h-5 text-zinc-700 relative z-10`} />
                        </div>
                        <div>
                            <DialogTitle className="text-[20px] font-bold text-zinc-900 tracking-tight">
                                {isEdit ? 'Update Service Package' : 'Create Service Package'}
                            </DialogTitle>
                            <DialogDescription className="text-[13px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
                                <Settings2 className="w-3.5 h-3.5 text-zinc-400" />
                                {isEdit
                                    ? 'Modify structural details and observe real-time preview.'
                                    : 'Configure a new cleaning tier and establish visual presentation.'
                                }
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Main Content Area */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Left Side: Form */}
                    <form id="service-package-form" onSubmit={handleSubmit(onSubmit)} className="w-[55%] flex flex-col h-full border-r border-zinc-100 bg-white">
                        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8 custom-scrollbar">

                            <div className="space-y-5">
                                <div className="border-b border-zinc-100 pb-2">
                                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">General Information</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-[13px] font-semibold text-zinc-800">
                                            Package Name <span className="text-zinc-500">*</span>
                                        </Label>
                                        <Input
                                            {...register('packageName', { required: 'Package name is required' })}
                                            placeholder="Standard Package..."
                                            className="bg-white border-zinc-200 rounded-lg focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 h-10 text-[14px] placeholder:text-zinc-300 transition-all shadow-none"
                                        />
                                        {errors.packageName && <p className="text-xs text-red-500 font-medium ml-1">{errors.packageName.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[13px] font-semibold text-zinc-800">
                                            Suitable For <span className="text-zinc-500">*</span>
                                        </Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between bg-white border-zinc-200 rounded-lg focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 h-10 text-[14px] font-normal transition-all shadow-none">
                                                    <span className="truncate">
                                                        {suitableForValue ? suitableForValue.split(',').join(', ') : <span className="text-zinc-400">Select Categories...</span>}
                                                    </span>
                                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[280px] p-1 rounded-xl border-zinc-100 shadow-xl max-h-[300px] overflow-y-auto" align="start">
                                                {productTypes.map((type) => {
                                                    const isChecked = suitableForValue.split(',').includes(type.productTypeName);
                                                    return (
                                                        <DropdownMenuCheckboxItem
                                                            key={type.productTypeId}
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => {
                                                                const currentArray = suitableForValue ? suitableForValue.split(',').filter(Boolean) : [];
                                                                let newVal = [];
                                                                if (checked) {
                                                                    newVal = [...currentArray, type.productTypeName];
                                                                } else {
                                                                    newVal = currentArray.filter(v => v !== type.productTypeName);
                                                                }
                                                                setValue('suitableFor', newVal.join(','));
                                                            }}
                                                            onSelect={(e) => e.preventDefault()}
                                                            className="rounded-lg text-sm text-zinc-700"
                                                        >
                                                            {type.productTypeName}
                                                        </DropdownMenuCheckboxItem>
                                                    );
                                                })}
                                                {productTypes.length === 0 && <div className="p-3 text-xs text-zinc-400 italic">No Active Product Types</div>}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[13px] font-semibold text-zinc-800">
                                            Duration <span className="text-zinc-500">*</span>
                                        </Label>
                                        <Select value={String(durationValue)} onValueChange={(v) => setValue('duration', Number(v))}>
                                            <SelectTrigger className="bg-white border-zinc-200 rounded-lg focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 h-10 text-[14px] transition-all shadow-none">
                                                {durationValue ? `${durationValue} mins` : <span className="text-zinc-400">Select...</span>}
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="45">45 minutes</SelectItem>
                                                <SelectItem value="60">1 hour (60m)</SelectItem>
                                                <SelectItem value="90">1.5 hours (90m)</SelectItem>
                                                <SelectItem value="120">2 hours (120m)</SelectItem>
                                                <SelectItem value="180">3 hours (180m)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 pt-2">
                                <div className="border-b border-zinc-100 pb-2">
                                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Details & Assets</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[13px] font-semibold text-zinc-800">
                                            Service Content <span className="text-zinc-500">*</span>
                                        </Label>
                                        <Input
                                            {...register('serviceContent')}
                                            placeholder="A short one-line summary"
                                            className="bg-white border-zinc-200 rounded-lg focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 h-10 text-[14px] placeholder:text-zinc-300 transition-all shadow-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[13px] font-semibold text-zinc-800">
                                            Benefits <span className="text-zinc-500">*</span>
                                        </Label>
                                        <Textarea
                                            {...register('benefits')}
                                            placeholder="List of features, separated by commas..."
                                            className="bg-white border-zinc-200 rounded-lg focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 min-h-[100px] text-[14px] placeholder:text-zinc-300 transition-all resize-none shadow-none p-4"
                                        />
                                    </div>

                                    <div className="space-y-2 pt-1">
                                        <Label className="text-[13px] font-semibold text-zinc-800">
                                            Marketing Cover {!isEdit && <span className="text-zinc-500">*</span>}
                                        </Label>
                                        <div className="border border-zinc-200 bg-[#fafafa] rounded-xl p-3 text-center transition-colors hover:border-zinc-300 cursor-pointer border-dashed overflow-hidden">
                                            {fileValue ? (
                                                <div className="flex items-center justify-between bg-white border border-zinc-100 px-4 py-2.5 rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <ImagePlus className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                                                        <span className="text-[13px] text-zinc-700 truncate font-semibold">{fileValue.name}</span>
                                                    </div>
                                                    <Button size="icon" variant="ghost" type="button" onClick={(e) => { e.preventDefault(); setValue('file', undefined); }} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 ml-2 flex-shrink-0 rounded-full">
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer block py-4">
                                                    <Upload className="mx-auto h-6 w-6 text-zinc-300 mb-2" />
                                                    <span className="text-[13px] font-semibold text-zinc-500 block">Click to upload brand asset</span>
                                                    <span className="text-[11px] text-zinc-400 block mt-1 font-medium">Supported: PNG, JPG up to 5MB</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-zinc-200 bg-[#fcfdfd] p-5 shadow-sm mt-5">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1 flex-1">
                                                <Label className="text-[14px] font-bold text-zinc-900 cursor-pointer flex items-center gap-2">
                                                    <Power className="w-4 h-4 text-zinc-700" />
                                                    Publication Rule
                                                </Label>
                                                <p className="text-[12px] text-zinc-500 font-medium">
                                                    {statusValue === 'Active' ? 'Service is actively distributed' : 'Temporarily suspended'}
                                                </p>
                                            </div>
                                            <Switch
                                                checked={statusValue === 'Active'}
                                                onCheckedChange={(checked) => setValue('status', checked ? 'Active' : 'Inactive')}
                                                disabled={isLoading}
                                                className="data-[state=checked]:bg-[var(--color-primary)] shadow-none border-zinc-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Right Side: Consumer Preview (Minimalist Vercel Styling) */}
                    <div className="w-[45%] bg-[#fafafa] flex flex-col relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 mix-blend-multiply"></div>
                        <div className="flex-1 overflow-y-auto px-10 py-12 flex flex-col items-center custom-scrollbar z-10 w-full font-sans relative">

                            {/* Minimalist Pricing Card Concept */}
                            <div className={`relative w-full max-w-[320px] bg-white rounded-[24px] border-2 transition-all duration-300 flex flex-col overflow-hidden shadow-lg ${currentStyle.shadow || 'shadow-zinc-500/10'} ${currentStyle.border || 'border-zinc-200'} ${currentStyle.bg || 'bg-zinc-50/10'}`}>

                                {/* Top Accent Line */}
                                <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${currentStyle.accent || 'bg-zinc-900'}`} />

                                <div className="p-6 flex flex-col h-full min-h-[440px]">

                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-3 pt-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${currentStyle.accent}`}>
                                            <Check className="w-3 h-3 text-white stroke-[3] opacity-100" />
                                        </div>
                                        <h3 className="text-[16px] font-black text-slate-900 leading-none tracking-tight">
                                            {packageNameValue || 'Standard Plan'}
                                        </h3>
                                    </div>

                                    {/* Price Architecture Placeholder */}
                                    <div className="mb-2">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                                Variable
                                            </span>
                                        </div>
                                    </div>

                                    {/* Subtext */}
                                    <p className="text-[12px] font-medium text-slate-400 leading-relaxed mb-4">
                                        {contentValue || "Essential cleaning standards engineered for baseline domestic configurations."}
                                    </p>

                                    <div className="w-full h-px bg-slate-200/60 mb-4" />

                                    {/* Huge empty space stretching card bottom */}
                                    <div className="flex-1"></div>

                                    {/* Scaled Features List */}
                                    <div className="space-y-3 pb-2">
                                        {parsedBenefits.length > 0 ? parsedBenefits.map((b, i) => (
                                            <div key={i} className="flex items-start gap-2.5 text-[12px] font-semibold text-slate-600 leading-snug">
                                                <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 stroke-[2.5] ${currentStyle.icon}`} />
                                                <span className="leading-tight">
                                                    {b}
                                                </span>
                                            </div>
                                        )) : (
                                            <>
                                                <div className="flex items-start gap-2.5 text-[12px] font-semibold text-slate-600 leading-snug">
                                                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 stroke-[2.5] ${currentStyle.icon}`} />
                                                    <span className="leading-tight">Baseline sanitation</span>
                                                </div>
                                                <div className="flex items-start gap-2.5 text-[12px] font-semibold text-slate-600 leading-snug">
                                                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 stroke-[2.5] ${currentStyle.icon}`} />
                                                    <span className="leading-tight">Spot stain reduction</span>
                                                </div>
                                                <div className="flex items-start gap-2.5 text-[12px] font-semibold text-slate-600 leading-snug">
                                                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 stroke-[2.5] ${currentStyle.icon}`} />
                                                    <span className="leading-tight">Natural preservation</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-5 border-t border-zinc-100 bg-white flex justify-end gap-3 z-10">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="h-10 px-6 font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl hover:text-zinc-900"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="service-package-form"
                        disabled={isLoading}
                        className="h-10 px-8 rounded-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md shadow-blue-500/10 transition-all border-none"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Update Details' : 'Create Entry'}
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
