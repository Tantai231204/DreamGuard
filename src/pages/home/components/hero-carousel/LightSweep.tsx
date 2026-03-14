import React, { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MOTION_CONFIG } from "./constants"

export const LightSweep = memo(({ sweepKey }: { sweepKey: number }) => {
    return (
        <AnimatePresence>
            {sweepKey > 0 && (
                <motion.div
                    key={sweepKey}
                    className="absolute inset-0 z-20 pointer-events-none"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* ── Outer Glow traveling from left to right ── */}
                    <motion.div
                        className="absolute inset-x-0"
                        style={{ top: '35%', height: '30%' }}
                    >
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full blur-[15px]">
                            <motion.path
                                d={MOTION_CONFIG.sCurvePath}
                                fill="none"
                                stroke="rgba(255,255,255,0.4)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ 
                                    pathLength: [0, 1, 1],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 1.5,
                                    times: [0, 0.6, 1],
                                    ease: "easeInOut"
                                }}
                            />
                        </svg>
                    </motion.div>

                    {/* ── Main Sharp Line traveling from left to right ── */}
                    <motion.div
                        className="absolute inset-x-0"
                        style={{ top: '35%', height: '30%' }}
                    >
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                            {/* Inner Soft Glow */}
                            <motion.path
                                d={MOTION_CONFIG.sCurvePath}
                                fill="none"
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="blur-[4px]"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ 
                                    pathLength: [0, 1, 1],
                                    opacity: [0, 0.8, 0]
                                }}
                                transition={{
                                    duration: 1.4,
                                    times: [0, 0.5, 1],
                                    ease: "easeInOut"
                                }}
                            />
                            {/* Sharp Core */}
                            <motion.path
                                d={MOTION_CONFIG.sCurvePath}
                                fill="none"
                                stroke="rgba(255,255,255,0.95)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ 
                                    pathLength: [0, 1, 1],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 1.2,
                                    times: [0, 0.4, 1],
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                            />
                        </svg>
                    </motion.div>

                    {/* ── Dynamic Light Orbs ── */}
                    {[15, 35, 50, 65, 85].map((x, i) => (
                        <motion.div
                            key={`orb-${i}`}
                            className="absolute rounded-full bg-white blur-[2px] shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                            style={{
                                width: '4px',
                                height: '4px',
                                left: `${x}%`,
                                top: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                                y: [0, (i % 2 === 0 ? -20 : 20), 0]
                            }}
                            transition={{
                                duration: 1,
                                delay: 0.2 + (i * 0.1),
                                ease: "easeOut"
                            }}
                        />
                    ))}

                    {/* ── Magical Light Dust (Sparkles spreading out) ── */}
                    <Stardust sweepKey={sweepKey} />
                </motion.div>
            )}
        </AnimatePresence>
    )
})

/**
 * Sub-component to manage particles with stable random values
 */
const Stardust = memo(({ sweepKey }: { sweepKey: number }) => {
    // Deterministic PRNG to satisfy strict ESLint rules against Math.random()
    const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    const particles = React.useMemo(() => {
        // Reduced to 12 particles for better performance
        return Array.from({ length: 12 }).map((_, i) => {
            const seed = sweepKey * 100 + i;
            return {
                id: i,
                randomX: seededRandom(seed + 1) * 100,
                randomY: 35 + seededRandom(seed + 2) * 30,
                destinationX: (seededRandom(seed + 3) - 0.5) * 100,
                destinationY: (seededRandom(seed + 4) - 0.5) * 100,
                size: 1.5 + seededRandom(seed + 5) * 1.5,
                duration: 1.2 + seededRandom(seed + 6) * 0.8,
                delay: seededRandom(seed + 7) * 0.4
            };
        });
    }, [sweepKey]);

    return (
        <>
            {particles.map((p) => (
                <motion.div
                    key={`dust-${p.id}`}
                    className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        left: `${p.randomX}%`,
                        top: `${p.randomY}%`,
                    }}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{ 
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.2, 0],
                        x: p.destinationX,
                        y: p.destinationY,
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        ease: "easeOut"
                    }}
                />
            ))}
        </>
    );
});
