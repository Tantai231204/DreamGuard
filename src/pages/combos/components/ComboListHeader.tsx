import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Props {
    totalCount: number;
}

export const ComboListHeader = ({ totalCount }: Props) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 px-1"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4988c4]/10 text-[#4988c4] text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Sparkles className="h-3 w-3" />
                Sweet Bundles Await
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                    Our <br /> Collection
                </h1>
                <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium">
                    <span>Discover</span>
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{totalCount || 0} items found</span>
                </div>
            </div>
        </motion.div>
    );
};
