import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { INPUT_CLS } from './constants';
import AdminRichEditor from '@/components/admin/AdminRichEditor';

interface GeneralSectionProps {
    name: string;
    slug: string;
    summary: string;
    description: string;
    isLoading: boolean;
    onNameChange: (value: string) => void;
    onSlugChange: (value: string) => void;
    onSummaryChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    errors?: import('react-hook-form').FieldErrors<import('./productSchema').ProductFormValues>;
    
}

import { Type, Link2, FileText, AlignLeft, AlertCircle } from 'lucide-react';

const FieldError = ({ error }: { error?: { message?: string } }) => {
    if (!error) return null;
    return (
        <p className="text-[10px] text-rose-500 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1 flex items-center gap-1 px-1">
            <AlertCircle className="h-3 w-3" />
            {error.message}
        </p>
    );
};

const GeneralSection = memo(function GeneralSection({
    name, slug, summary, description,
    isLoading,
    onNameChange, onSlugChange, onSummaryChange, onDescriptionChange,
    errors,
    }: GeneralSectionProps) {
    const errorClasses = "border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20";

    return (
        <section className="space-y-7 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <div>
                <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-slate-400 flex items-center gap-1.5 mb-2.5">
                    IDENTITY & VISIBILITY
                </Label>
                <div className="h-px w-full bg-slate-100" />
            </div>

            <div className="grid grid-cols-12 gap-x-6 gap-y-7">
                {/* Product Name */}
                <div className="col-span-12 space-y-2.5">
                    <Label htmlFor="name" className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2 ml-1">
                        <Type className="h-3.5 w-3.5" /> PRODUCT NAME <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        placeholder="e.g. Cloud Mattress Premium"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        disabled={isLoading}
                        className={cn(INPUT_CLS, "h-12 text-[15px] font-semibold tracking-tight shadow-sm border-slate-200", errors?.name && errorClasses)}
                        autoFocus
                    />
                    <FieldError error={errors?.name} />
                </div>

                {/* URL Slug */}
                <div className="col-span-12 space-y-2.5">
                    <Label htmlFor="slug" className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2 ml-1">
                        <Link2 className="h-3.5 w-3.5" /> URL PATH <span className="text-rose-500">*</span>
                    </Label>
                    <div className="group relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[13px] font-medium select-none group-focus-within:text-slate-400 transition-colors flex items-center gap-0.5">
                            <span>/products/</span>
                            <span className="h-3 w-px bg-slate-200 mx-1 opacity-50" />
                        </div>
                        <Input
                            id="slug"
                            placeholder="cloud-mattress-premium"
                            value={slug}
                            onChange={(e) => onSlugChange(e.target.value)}
                            disabled={isLoading}
                            className={cn(
                                INPUT_CLS, 
                                'pl-24 font-mono text-[13px] tracking-tight font-medium text-primary-600 bg-slate-50/20 border-slate-200 shadow-inner h-11',
                                errors?.slug && errorClasses
                            )}
                        />
                    </div>
                    <FieldError error={errors?.slug} />
                </div>
            </div>

            <div className="space-y-6 pt-2">
                <div className="space-y-2.5">
                    <Label htmlFor="summary" className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2 ml-1">
                        <FileText className="h-3.5 w-3.5" /> BRIEF SUMMARY <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="summary"
                        placeholder="Brief highlights of this mattress (e.g. Cool cooling foam, 10-year warranty)"
                        value={summary}
                        onChange={(e) => onSummaryChange(e.target.value)}
                        disabled={isLoading}
                        className={cn(INPUT_CLS, "h-12 italic text-slate-500 text-[14px] font-medium border-slate-200 shadow-sm", errors?.summary && errorClasses)}
                    />
                    <FieldError error={errors?.summary} />
                </div>

                <div className="col-span-12 space-y-3">
                    <Label htmlFor="description" className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2 ml-1">
                        <AlignLeft className="h-3.5 w-3.5" /> FULL DESCRIPTION <span className="text-rose-500">*</span>
                    </Label>
                    <AdminRichEditor
                        value={description}
                        onChange={onDescriptionChange}
                        disabled={isLoading}
                        placeholder="Explain the build quality, material density, comfort levels, and shipping info..."
                    />
                    <FieldError error={errors?.description} />
                </div>
            </div>
        </section>
    );
});

export default GeneralSection;
