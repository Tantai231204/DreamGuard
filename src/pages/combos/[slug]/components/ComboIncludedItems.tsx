import { motion } from "framer-motion";
import { Package } from "lucide-react";
import type { Combo } from "../../types";

interface Props {
    combo: Combo;
}

export const ComboIncludedItems = ({ combo }: Props) => {
    const items = combo.productItems || [];

    if (items.length === 0) return null;

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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
                        >
                            <div className="relative mb-6">
                                <div className="absolute -left-2 -top-2 w-8 h-8 bg-slate-950 text-white rounded-full flex items-center justify-center text-[11px] font-black z-10 shadow-lg border-4 border-white">
                                    {idx + 1}
                                </div>
                                <div className="aspect-square rounded-3xl bg-slate-50 overflow-hidden flex items-center justify-center p-6 border border-slate-100 group-hover:scale-95 transition-transform duration-500">
                                     {item.imageUrl ? (
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.productName} 
                                            className="w-full h-full object-contain group-hover:rotate-6 transition-transform duration-500"
                                        />
                                     ) : (
                                        <Package className="w-10 h-10 text-slate-200" />
                                     )}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2 min-h-[3rem]">
                                    {item.productName}
                                </h4>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Included Qty</span>
                                    <span className="text-base font-black text-[#4988c4]">
                                        x{item.quantity}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
