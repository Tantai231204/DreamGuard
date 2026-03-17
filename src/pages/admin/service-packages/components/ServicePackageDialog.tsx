import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
    SelectValue,
} from '@/components/ui/select';
import { Upload, X, Package, Clock, ShieldCheck, CreditCard, Sparkles, Tag } from 'lucide-react';
import { useCategories } from '@/hooks/queries/useCategory';
import type { ServicePackage } from '@/api/services/servicePackageService';

export interface PackageFormData {
    packageName: string;
    description: string;
    serviceContent: string;
    suitableFor: string;
    benefits: string;
    price: number;
    duration: number;
    status: 'Active' | 'Inactive';
    file?: File;
}

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
    const { data: categories = [] } = useCategories();
    
    const { register, handleSubmit, reset, setValue, watch } = useForm<PackageFormData>({
        defaultValues: {
            packageName: '',
            description: '',
            serviceContent: '',
            suitableFor: '',
            benefits: '',
            price: 0,
            duration: 60,
            status: 'Active',
        }
    });

    const statusValue = watch('status');
    const suitableForValue = watch('suitableFor');
    const durationValue = watch('duration');
    const fileValue = watch('file');
    const packageNameValue = watch('packageName');
    const priceValue = watch('price');
    const descriptionValue = watch('description');

    useEffect(() => {
        if (pkg) {
            reset({
                packageName: pkg.packageName,
                description: pkg.description,
                serviceContent: pkg.serviceContent,
                suitableFor: pkg.suitableFor || '',
                benefits: pkg.benefits,
                price: pkg.price,
                duration: pkg.duration,
                status: pkg.status,
            });
        } else {
            reset({
                packageName: '',
                description: '',
                serviceContent: '',
                suitableFor: '',
                benefits: '',
                price: 0,
                duration: 60,
                status: 'Active',
            });
        }
    }, [pkg, reset, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setValue('file', file);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-hidden rounded-3xl p-0 gap-0 border-none shadow-2xl">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full max-h-[90vh]">
                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Panel: Form Input Fields */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-5 bg-white">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    {pkg ? 'Edit Service Package' : 'Create Service Package'}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-700">Package Name</Label>
                                    <Input {...register('packageName', { required: true })} placeholder="E.g. Khử khuẩn nệm nôi Premium" className="rounded-xl border-slate-200 shadow-sm focus-visible:ring-blue-500" />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-700">Description</Label>
                                    <Textarea {...register('description')} placeholder="Introduce cleaning effects..." className="h-20 resize-none rounded-xl border-slate-200 focus-visible:ring-blue-500" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-700 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-slate-400" /> Price (đ)</Label>
                                        <Input type="number" {...register('price', { valueAsNumber: true })} className="rounded-xl border-slate-200 focus-visible:ring-blue-500" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-700 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Duration</Label>
                                        <Select value={String(durationValue)} onValueChange={(v) => setValue('duration', Number(v))}>
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="30">30 mins</SelectItem>
                                                <SelectItem value="45">45 mins</SelectItem>
                                                <SelectItem value="60">60 mins</SelectItem>
                                                <SelectItem value="90">90 mins</SelectItem>
                                                <SelectItem value="120">2 hours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-700 flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5 text-slate-400" /> Suitable For
                                        </Label>
                                        <Select value={suitableForValue} onValueChange={(v) => setValue('suitableFor', v)}>
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="Target..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.cateId} value={c.name}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-700 flex items-center gap-1.5">
                                            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Status
                                        </Label>
                                        <Select value={statusValue} onValueChange={(v: 'Active' | 'Inactive') => setValue('status', v)}>
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="Status..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-700">Service Content</Label>
                                    <Input {...register('serviceContent')} placeholder="UV rays, steaming, set arrangement..." className="rounded-xl border-slate-200" />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-700 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-blue-500" /> Benefits</Label>
                                    <Input {...register('benefits')} placeholder="Softener, UV treatment (comma separated)" className="rounded-xl border-slate-200" />
                                </div>

                                {/* Re-styled Image Upload */}
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-700">Image</Label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                        {fileValue ? (
                                            <div className="flex items-center justify-between bg-blue-50/70 border border-blue-100 px-3 py-2 rounded-lg">
                                                <span className="text-sm font-medium text-blue-800 line-clamp-1">{fileValue.name}</span>
                                                <Button size="icon" variant="ghost" type="button" onClick={() => setValue('file', undefined)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer block">
                                                <Upload className="mx-auto h-7 w-7 text-slate-400 mb-1" />
                                                <span className="text-sm font-medium text-slate-600 block">Click or Drag to upload image</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: Live Card Preview (The REDESIGN) */}
                        <div className="hidden md:flex w-[320px] bg-slate-100 border-l border-slate-200/60 p-6 flex-col justify-center items-center">
                            <div className="text-center mb-4">
                                <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Live Preview</span>
                            </div>
                            
                            <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
                                <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                                    {fileValue ? (
                                        <img src={URL.createObjectURL(fileValue)} alt="preview" className="object-cover w-full h-full" />
                                    ) : pkg?.imageUrl ? (
                                        <img src={pkg.imageUrl} alt="preview" className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Package className="w-10 h-10 text-slate-300" />
                                            <span className="text-xs text-slate-400 mt-1">No cover image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusValue === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                                            {statusValue}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-4 space-y-2">
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                                        {suitableForValue || 'Category'}
                                    </span>
                                    <h4 className="font-bold text-slate-800 line-clamp-1">{packageNameValue || 'Untitled Package'}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 h-8 leading-relaxed">
                                        {descriptionValue || 'No description provided yet.'}
                                    </p>
                                    
                                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            {durationValue} mins
                                        </div>
                                        <span className="font-extrabold text-sm text-blue-700">
                                            {(priceValue || 0).toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-4 p-6 bg-slate-50/50 flex flex-row justify-end gap-2 mt-auto">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="rounded-xl border-slate-200 text-slate-600 font-medium">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold px-5 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                            {isLoading ? 'Saving...' : pkg ? 'Save Changes' : 'Create Package'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
