import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type SlideData, MOTION_CONFIG } from "./constants"

export const SlideImage = memo(({ slide, active }: { slide: SlideData, active: boolean }) => (
    <div className="relative h-full flex items-center justify-center will-change-transform">
        <AnimatePresence mode="wait">
            {active && (
                <motion.div
                    key={slide.image}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.4 } }}
                    transition={{
                        duration: 0.8,
                        delay: MOTION_CONFIG.contentDelay + 0.1,
                        ease: MOTION_CONFIG.ease,
                    }}
                    className="relative w-full max-w-lg aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border-[8px] border-white/20 isolate"
                >
                    <motion.img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "linear" }} // Continuous slow zoom
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                    
                    {/* Glossy Overlay Sparkle */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
))
