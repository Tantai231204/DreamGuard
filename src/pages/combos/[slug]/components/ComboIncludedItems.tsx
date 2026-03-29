import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Combo, RichComboItem } from "../../types";

interface Props {
    combo: Combo;
    activeCombo?: Combo | null;
    isLoading?: boolean;
    enrichedItems?: RichComboItem[];
}

export const ComboIncludedItems = ({ combo, activeCombo, isLoading, enrichedItems }: Props) => {
    const current = activeCombo || combo;
    // Prefer enrichedItems if passed, otherwise fall back to regular mapping
    const basicItems = (current.items || current.productItems || combo.items || combo.productItems || []) as RichComboItem[];
    const items = enrichedItems && enrichedItems.length > 0 ? enrichedItems : basicItems;

    if (!isLoading && items.length === 0) return null;

    return (
        <section className="py-20 bg-slate-50/50 rounded-[4rem] px-8 border border-slate-100/50 my-16 relative overflow-hidden">
            {/* Decors */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#4988c4]/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-px bg-[#4988c4]/30" />
                            <span className="text-[10px] font-black uppercase text-[#4988c4] tracking-[0.3em]">The Collection</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Complete Bundle Experience</h2>
                        <p className="text-slate-500 mt-2 max-w-xl">Every item in this set has been hand-picked by our specialists to provide the ultimate comfort and quality for your sleep environment.</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-900" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Items Included</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{items.length} Premium Pieces</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-100/80 shadow-sm space-y-6">
                                <Skeleton className="aspect-square w-full rounded-[2rem]" />
                                <div className="space-y-3">
                                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                                </div>
                                <div className="pt-5 border-t border-slate-50">
                                    <Skeleton className="h-4 w-1/3 rounded-lg" />
                                </div>
                            </div>
                        ))
                    ) : (
                        items.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100/80 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-2 transition-all duration-500"
                            >
                                {/* Quantity Badge - Floating */}
                                <div className="absolute top-6 right-6 z-20">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Quantity</span>
                                        <div className="bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-200">
                                            {item.quantity}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative mb-8">
                                    <div className="aspect-square rounded-[2rem] bg-slate-50 overflow-hidden flex items-center justify-center p-8 border border-slate-100 group-hover:bg-indigo-50/30 transition-colors duration-500">
                                         {item.imageUrl ? (
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.productName} 
                                                className="w-full h-full object-contain group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700"
                                            />
                                         ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <Package className="w-12 h-12 text-slate-200 group-hover:text-indigo-200 transition-colors" />
                                                <div className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Premium Item</div>
                                            </div>
                                         )}
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-black text-slate-900 text-xl leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-indigo-700 transition-colors">
                                            {item.productName}
                                        </h4>
                                        {((item.enrichedDetail?.size || item.variantLabel)) && (
                                            <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/50" />
                                                {item.enrichedDetail?.size || item.variantLabel}
                                            </p>
                                        )}
                                    </div>

                                    {/* Enriched Details Section */}
                                    {item.enrichedDetail && (
                                        <div className="bg-slate-50/80 rounded-2xl p-4 space-y-3 border border-slate-100/50 transition-colors group-hover:bg-white group-hover:border-indigo-100 group-hover:shadow-sm">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">SKU</span>
                                                <span className="text-[11px] font-mono font-bold text-slate-600 truncate max-w-[120px]">{item.enrichedDetail.sku}</span>
                                            </div>
                                            {item.enrichedDetail.weight && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Weight</span>
                                                    <span className="text-[11px] font-black text-slate-900">{item.enrichedDetail.weight}kg</span>
                                                </div>
                                            )}
                                            {item.enrichedDetail.stockStatus && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Status</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${item.enrichedDetail.stockStatus === 'InStock' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-wider ${item.enrichedDetail.stockStatus === 'InStock' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {item.enrichedDetail.stockStatus === 'InStock' ? 'Secure' : 'Limitted'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-5 border-t border-slate-50 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Verified System Component</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};
