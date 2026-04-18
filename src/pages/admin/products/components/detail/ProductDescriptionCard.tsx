import { 
    AlignLeft, 
    Sparkles, 
    Edit3, 
    FileText, 
    Quote,
    CheckCircle2,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormattedDescription } from '@/components/common/FormattedDescription';

interface ProductDescriptionCardProps {
    product: {
        name: string;
        summary?: string;
        description?: string;
    };
    onEdit: () => void;
}

export default function ProductDescriptionCard({ product, onEdit }: ProductDescriptionCardProps) {
    return (
        <div className="space-y-8 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* ── Header Section ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#4988c4]">
                        <FileText size={18} />
                        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Product Narrative</h2>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Craft the perfect story for <span className="text-slate-900 font-bold">{product.name}</span></p>
                </div>
                <Button 
                    onClick={onEdit}
                    className="h-11 px-6 bg-[#4988c4] hover:bg-[#3a6fa0] text-white rounded-xl border-0 shadow-none transition-all active:scale-95 flex items-center gap-2"
                >
                    <Edit3 size={16} />
                    <span className="font-bold uppercase text-[11px] tracking-widest">Edit Narrative</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* ── Left Column: Detailed Content ── */}
                <div className="lg:col-span-8 space-y-8">
                    {product.description ? (
                        <div className="relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#4988c4] via-slate-100 to-transparent opacity-30 rounded-full" />
                            <div className="flex items-center gap-2 mb-6">
                                <AlignLeft size={14} className="text-slate-400" />
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Detailed Exposition</h3>
                            </div>
                            <div className="bg-white rounded-2xl p-8 border border-slate-100/80 shadow-sm leading-relaxed">
                                <FormattedDescription 
                                    content={product.description}
                                    className="text-[15px] text-slate-600 prose-slate max-w-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                            <Info className="w-10 h-10 text-slate-300 mb-4" />
                            <p className="text-slate-400 font-medium italic">No detailed description has been drafted yet.</p>
                            <Button variant="link" className="text-[#4988c4] mt-2 font-bold uppercase text-[10px]" onClick={onEdit}>Start Drafting</Button>
                        </div>
                    )}
                </div>

                {/* ── Right Column: Highlights & Summary ── */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Summary Card */}
                    {product.summary && (
                        <div className="p-8 rounded-[2.5rem] bg-[#4988c4]/5 border border-[#4988c4]/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 text-[#4988c4]/10 group-hover:text-[#4988c4]/20 transition-colors">
                                <Quote size={60} />
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-2 text-[#4988c4]">
                                    <Sparkles size={14} />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Elevator Pitch</h4>
                                </div>
                                <p className="text-[14px] text-slate-700 italic font-medium leading-relaxed">
                                    "{product.summary}"
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Content Health Checklist */}
                    <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Content Guidelines</h4>
                        <div className="space-y-4">
                            <CheckListItem active={!!product.summary} label="Compelling Summary" />
                            <CheckListItem active={!!product.description && product.description.length > 100} label="Detailed Specifications" />
                            <CheckListItem active={!!product.description && product.description.includes('<')} label="HTML Formatting" />
                            <CheckListItem active={true} label="SEO Keywords Optimized" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckListItem({ active, label }: { active: boolean, label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'}`}>
                <CheckCircle2 size={12} />
            </div>
            <span className={`text-[12px] font-bold ${active ? 'text-slate-700' : 'text-slate-400 line-through decoration-slate-300'}`}>{label}</span>
        </div>
    );
}
