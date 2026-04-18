import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { bestSellingProducts } from "../data";

export const BestSellingProducts = () => {
    const maxSales = useMemo(() => 
        Math.max(...bestSellingProducts.map(p => p.sales)), 
    []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 h-full flex flex-col group overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors duration-500" />
            
            <div className="relative z-10 flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Market Leaders</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Top velocity products</p>
                </div>
                <Link
                    to="/admin/products"
                    className="h-10 w-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 text-[#4988c4] hover:bg-white hover:shadow-sm transition-all"
                >
                    <ArrowRight className="h-5 w-5" />
                </Link>
            </div>

            <div className="space-y-6 flex-1 relative z-10">
                {bestSellingProducts.map((product, index) => {
                    const progress = (product.sales / maxSales) * 100;

                    return (
                        <div key={product.id} className="group/item cursor-default">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="h-12 w-12 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-500 shadow-sm">
                                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="text-[12px] font-black text-slate-800 truncate leading-none uppercase tracking-tight">
                                            {product.name}
                                        </h4>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                            {product.growth}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {product.sales} Sold
                                        </span>
                                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-black text-indigo-600">
                                            {product.revenue}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ delay: 0.6 + index * 0.1, duration: 1.2, ease: "circOut" }}
                                    className={`h-full rounded-full ${product.color} opacity-90`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
               <div className="bg-indigo-50/50 rounded-2xl p-4 flex items-center gap-4 border border-indigo-100/50">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                     <TrendingUp size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Growth Engine</p>
                     <p className="text-[9px] text-indigo-600 font-bold leading-tight mt-0.5">Top 5 products generate 62% of monthly revenue.</p>
                  </div>
               </div>
            </div>
        </motion.div>
    );
};
