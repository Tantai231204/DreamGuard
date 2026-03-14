import { memo } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import { type SlideData, MOTION_CONFIG } from "./constants"

const containerVariants: Variants = {
    enter: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }
}

const itemVariants = (delay: number): Variants => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: MOTION_CONFIG.contentDelay + delay, ease: MOTION_CONFIG.ease }
    }
})

export const SlideContent = memo(({ slide, active }: { slide: SlideData, active: boolean }) => (
    <div className="relative z-10 w-full max-w-2xl will-change-transform">
        <AnimatePresence mode="wait">
            {active && (
                <motion.div
                    key={slide.tag}
                    variants={containerVariants}
                    initial="exit"
                    animate="enter"
                    exit="exit"
                    className="space-y-6 text-left"
                >
                    {/* Tag - Glassmorphism */}
                    <motion.div
                        variants={itemVariants(0)}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{slide.tag}</span>
                    </motion.div>

                    {/* Title - Superior Typography */}
                    <motion.h1
                        variants={itemVariants(0.08)}
                        initial="hidden"
                        animate="visible"
                        className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight drop-shadow-2xl"
                    >
                        {slide.title}
                        <motion.span
                            variants={itemVariants(0.18)}
                            initial="hidden"
                            animate="visible"
                            className="block text-white/90 font-light italic mt-2 opacity-80"
                        >
                            {slide.highlight}
                        </motion.span>
                    </motion.h1>

                    {/* Description - Better Contrast & Spacing */}
                    <motion.p
                        variants={itemVariants(0.2)}
                        initial="hidden"
                        animate="visible"
                        className="text-lg md:text-xl text-white/70 font-medium leading-relaxed max-w-lg drop-shadow-sm"
                    >
                        {slide.description}
                    </motion.p>

                    {/* Buttons - Premium Feel */}
                    <motion.div
                        variants={itemVariants(0.28)}
                        initial="hidden"
                        animate="visible"
                        className="pt-8 flex flex-wrap gap-5"
                    >
                        <button className="group flex items-center gap-4 px-10 py-4 bg-white rounded-full transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_20px_40px_rgba(255,255,255,0.25)] active:scale-95 shadow-2xl relative overflow-hidden">
                            <span className="text-sm font-black text-[#1e3a5f] uppercase tracking-widest relative z-10">
                                {slide.cta}
                            </span>
                            <ArrowRight className="w-5 h-5 text-[#1e3a5f] transition-transform duration-500 group-hover:translate-x-1.5 relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>

                        <button className="px-10 py-4 text-sm font-black text-white uppercase tracking-widest border-2 border-white/30 rounded-full transition-all duration-500 hover:bg-white/10 hover:border-white/60 backdrop-blur-sm">
                            View Pricing
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
))
