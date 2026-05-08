import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTopSellerProducts } from "@/hooks/queries/useOrder";
import { formatPrice } from "@/lib/utils";

const COLORS = ["bg-[#4988c4]", "bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-rose-500"];

export const BestSellingProducts = () => {
    const { data: topSellers, isLoading } = useTopSellerProducts(5);

    const products = useMemo(() => {
        if (!topSellers) return [];
        return topSellers.map((item, index) => {
            return {
                id: item.product.id,
                name: item.product.name,
                sales: item.totalQuantity,
                revenue: formatPrice(item.product.salePrice * item.totalQuantity),
                image: item.product.imageUrls?.[0] || '/images/placeholder-product.svg',
                color: COLORS[index % COLORS.length]
            };
        });
    }, [topSellers]);

    const maxSales = useMemo(() => 
        products.length > 0 ? Math.max(...products.map(p => p.sales)) : 1, 
    [products]);

    const totalTopSales = useMemo(() => 
        products.reduce((acc, curr) => acc + curr.sales, 0),
    [products]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 h-full flex flex-col group overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-sky-50 transition-colors duration-500" />
            
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
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 text-[#4988c4] animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Analytics...</p>
                    </div>
                ) : products.length > 0 ? (
                    products.map((product, index) => {
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
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {product.sales} Sold
                                            </span>
                                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                                            <span className="text-[10px] font-black text-[#4988c4]">
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
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50 grayscale">
                        <TrendingUp className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Sales Data Available</p>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
               <div className="bg-sky-50/50 rounded-2xl p-4 flex items-center gap-4 border border-sky-100/50">
                  <div className="h-10 w-10 rounded-xl bg-[#4988c4] flex items-center justify-center text-white shadow-lg shadow-sky-200">
                     <TrendingUp size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-sky-900 uppercase tracking-widest">Performance Summary</p>
                     <p className="text-[9px] text-sky-600 font-bold leading-tight mt-0.5">Top 5 products have achieved {totalTopSales} total units sold.</p>
                  </div>
               </div>
            </div>
        </motion.div>
    );
};
