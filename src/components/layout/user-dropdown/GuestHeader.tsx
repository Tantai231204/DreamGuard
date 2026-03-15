import { Sparkles, Star } from "lucide-react"
import { motion } from "framer-motion"

export function GuestHeader() {
    return (
        <motion.div 
            whileHover="hover"
            className="p-6 text-center border-b border-dashed border-[#4988c4]/10 bg-gradient-to-b from-slate-50/50 to-white relative overflow-hidden group/header cursor-pointer"
        >
            {/* Ambient Background Glows */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#4988c4]/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#4988c4]/5 rounded-full blur-2xl" />

            <div className="flex justify-center relative">
                {/* Main Interactive Icon Container */}
                <motion.div 
                    variants={{
                        hover: { scale: 1.08, rotate: 12 }
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                    className="h-11 w-11 flex items-center justify-center rounded-2xl border border-dashed border-[#4988c4]/40 bg-[#4988c4]/5 text-[#4988c4] shadow-sm shadow-[#4988c4]/5"
                >
                    <Sparkles className="h-5 w-5" />
                </motion.div>

                {/* Micro Animated Decorative Sparkles */}
                <motion.div
                    variants={{
                        hover: { opacity: 0.8, scale: 1.2, x: 18, y: -8, rotate: 45 }
                    }}
                    initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="absolute top-0 right-1/3 text-[#4988c4]/40"
                >
                    <Star className="h-3 w-3 fill-[#4988c4]/20" />
                </motion.div>

                <motion.div
                    variants={{
                        hover: { opacity: 0.8, scale: 1.1, x: -16, y: 12, rotate: -45 }
                    }}
                    initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.05 }}
                    className="absolute bottom-0 left-1/3 text-[#4988c4]/40"
                >
                    <Sparkles className="h-2.5 w-2.5" />
                </motion.div>
            </div>

            <h3 className="mt-4 font-black text-slate-800 leading-none tracking-tight">
                Welcome to <span className="text-[#4988c4] group-hover/header:text-[#4988c4]/80 transition-colors">DreamGuard</span>
            </h3>
            <p className="text-[11px] font-medium text-slate-400 mt-1 leading-relaxed">
                Sign in for the best experience
            </p>
        </motion.div>
    )
}
