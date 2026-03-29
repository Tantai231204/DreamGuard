// src/pages/admin/products/components/detail/ProductCertificatesCard.tsx
import { memo } from 'react';
import { Award, ExternalLink, Calendar, FileText, Globe, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Certificate } from '../../types';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProductCertificatesCardProps {
    certificates: Certificate[];
    isLoading: boolean;
}

const ProductCertificatesCard = memo(function ProductCertificatesCard({ 
    certificates, 
    isLoading 
}: ProductCertificatesCardProps) {
    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse p-10">
                {[1, 2].map((i) => (
                    <div key={i} className="h-32 rounded-[2.5rem] bg-slate-50 border border-slate-100" />
                ))}
            </div>
        );
    }

    if (!certificates || certificates.length === 0) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-6 opacity-40">
                <div className="w-16 h-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Award size={24} className="text-slate-300" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">No Certifications</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">This product has no active quality certificates</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700 p-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4988c4] flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Award size={14} className="text-white" />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Quality Certifications</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verified quality and safety standards</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {certificates.map((cert, index) => (
                    <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8">
                             <div className="flex gap-2">
                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-100 bg-emerald-50 text-emerald-600 px-2 py-0 border border-emerald-100/50">
                                    VERIFIED
                                </Badge>
                             </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
                            <div className="w-20 h-20 rounded-[2rem] bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:rotate-12 transition-all duration-500 border border-blue-100/20">
                                <ShieldCheck size={32} className="text-blue-600 group-hover:text-white transition-colors" />
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                                        {cert.name}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization: {cert.organization || 'Verified Institution'}</p>
                                </div>

                                <div className="flex flex-wrap gap-x-8 gap-y-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} className="text-slate-300" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{formatDateTime(cert.createdAt || new Date().toISOString())}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe size={12} className="text-slate-300" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Standard</span>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100/30 group-hover:bg-white group-hover:border-blue-100/50 transition-all duration-500 group-hover:shadow-inner-sm">
                                    <div className="flex items-start gap-4">
                                        <FileText size={14} className="text-slate-300 mt-0.5 shrink-0" />
                                        <p className="text-sm font-medium text-slate-500 leading-relaxed italic line-clamp-2 uppercase tracking-tighter text-[11px]">
                                            "{cert.summary || 'Official recognition of adherence to rigorous quality, performance, and safety benchmarks across the entire production lifecycle.'}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 pt-2 lg:pt-0">
                                <a 
                                    href="#" 
                                    onClick={(e) => e.preventDefault()}
                                    className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-50 hover:bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all active:scale-95 shadow-sm border border-slate-100 hover:border-slate-900"
                                >
                                    View Digital Copy
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
});

export default ProductCertificatesCard;
