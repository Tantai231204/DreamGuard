import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useState, useMemo, useRef, memo } from "react"
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react"
import Autoplay from 'embla-carousel-autoplay'
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

/* ================= TYPES & CONFIG ================= */

interface SlideData {
    tag: string
    title: string
    highlight: string
    description: string
    image: string
    cta: string
    bgFrom: string
    bgTo: string
}

const SLIDES: SlideData[] = [
    {
        tag: "Premium Bedding",
        title: "Celestial Dreams for",
        highlight: "Your Little One",
        description: "Crafted with 100% organic cotton and celestial love to ensure the deepest sleep for your baby.",
        image: "https://i.pinimg.com/736x/8a/6f/c5/8a6fc5992477605477627ab85b592643.jpg",
        cta: "Explore Collection",
        bgFrom: "#1e3a5f",
        bgTo: "#4988c4"
    },
    {
        tag: "Safety First",
        title: "Breathable Care in",
        highlight: "Every Fiber",
        description: "Our engineered bamboo fabric provides 3x more airflow than traditional cotton blankets.",
        image: "https://i.pinimg.com/736x/87/dc/87/87dc87d26f322c96355eb8230c877079.jpg",
        cta: "Shop Essentials",
        bgFrom: "#3a73a8",
        bgTo: "#5bc4dc"
    },
    {
        tag: "Eco-Friendly",
        title: "Nature's Embrace for",
        highlight: "Sweetest Sleep",
        description: "Hypoallergenic materials sourced responsibly to protect both your baby and our planet.",
        image: "https://i.pinimg.com/1200x/4d/d5/3a/4dd53acde9ca605a135c9f2be3f55b53.jpg",
        cta: "Join Green Movement",
        bgFrom: "#4988c4",
        bgTo: "#74a4b0"
    },
]

const MOTION_CONFIG = {
    ease: [0.16, 1, 0.3, 1] as const,
    contentDelay: 0.55,
    sCurvePath: 'M 0,50 C 20,15 35,15 50,50 C 65,85 80,85 100,50',
}

/* ================= ANIMATION VARIANTS ================= */

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

/* ================= SUB-COMPONENTS ================= */

const SlideContent = memo(({ slide, active }: { slide: SlideData, active: boolean }) => (
    <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
            {active && (
                <motion.div
                    key={slide.tag}
                    variants={containerVariants}
                    initial="exit"
                    animate="enter"
                    exit="exit"
                    className="space-y-6"
                >
                    {/* Tag */}
                    <motion.div
                        variants={itemVariants(0)}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/10"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/80">{slide.tag}</span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        variants={itemVariants(0.08)}
                        initial="hidden"
                        animate="visible"
                        className="text-4xl md:text-6xl font-extrabold text-white leading-[1.15] tracking-tight"
                    >
                        {slide.title}
                        <motion.span
                            variants={itemVariants(0.18)}
                            initial="hidden"
                            animate="visible"
                            className="block text-white/80 font-light italic mt-1"
                        >
                            {slide.highlight}
                        </motion.span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        variants={itemVariants(0.2)}
                        initial="hidden"
                        animate="visible"
                        className="text-base md:text-lg text-white/60 font-normal leading-relaxed max-w-md"
                    >
                        {slide.description}
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        variants={itemVariants(0.28)}
                        initial="hidden"
                        animate="visible"
                        className="pt-6 flex flex-wrap gap-4"
                    >
                        <button className="group flex items-center gap-3 px-8 py-3.5 bg-white rounded-full transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)] active:scale-95 shadow-lg">
                            <span className="text-sm font-bold text-[var(--color-primary)]">
                                {slide.cta}
                            </span>
                            <ArrowRight className="w-4 h-4 text-[var(--color-primary)] transition-transform duration-300 group-hover:translate-x-1" />
                        </button>

                        <button className="px-8 py-3.5 text-sm font-semibold text-white/90 border border-white/25 rounded-full transition-all duration-300 hover:bg-white/10 hover:border-white/40">
                            View Pricing
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
))

const SlideImage = memo(({ slide, active }: { slide: SlideData, active: boolean }) => (
    <div className="relative h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
            {active && (
                <motion.div
                    key={slide.image}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.3 } }}
                    transition={{
                        duration: 0.7,
                        delay: MOTION_CONFIG.contentDelay + 0.05,
                        ease: MOTION_CONFIG.ease,
                    }}
                    className="relative w-full max-w-lg aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] border-[6px] border-white/15"
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
))

/* ================= LIGHT SWEEP — S-CURVE ================= */

const SPARKLES = [
    { x: '12%', y: '44%', s: 3.5 },
    { x: '28%', y: '38%', s: 5 },
    { x: '50%', y: '50%', s: 4.5 },
    { x: '72%', y: '62%', s: 5.5 },
    { x: '88%', y: '56%', s: 4 },
]

const LightSweep = memo(({ sweepKey }: { sweepKey: number }) => (
    <AnimatePresence>
        {sweepKey > 0 && (
            <motion.div
                key={sweepKey}
                className="absolute inset-0 z-20 pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {/* ── S-Curve glow layer ── */}
                <motion.div
                    className="absolute inset-x-0"
                    style={{ top: '35%', height: '30%' }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{
                        opacity: [0, 0.7, 0.7, 0],
                        scaleX: [0, 1, 1, 1],
                    }}
                    transition={{
                        duration: 1.3,
                        ease: 'easeInOut',
                        times: [0, 0.22, 0.58, 1],
                    }}
                >
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full blur-[12px]">
                        <path
                            d={MOTION_CONFIG.sCurvePath}
                            fill="none"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                    </svg>
                </motion.div>

                {/* ── S-Curve main line ── */}
                <motion.div
                    className="absolute inset-x-0"
                    style={{ top: '35%', height: '30%' }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        scaleX: [0, 1, 1, 1],
                    }}
                    transition={{
                        duration: 1.2,
                        ease: [0.22, 1, 0.36, 1],
                        times: [0, 0.25, 0.65, 1],
                    }}
                >
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        <path
                            d={MOTION_CONFIG.sCurvePath}
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            className="blur-[4px]"
                        />
                        <path
                            d={MOTION_CONFIG.sCurvePath}
                            fill="none"
                            stroke="rgba(255,255,255,0.95)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                        />
                    </svg>
                </motion.div>

                {/* ── Sparkles along the path ── */}
                {SPARKLES.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]"
                        style={{
                            width: `${p.s}px`,
                            height: `${p.s}px`,
                            left: p.x,
                            top: p.y,
                            translateX: '-50%',
                            translateY: '-50%',
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 0.2 + (i * 0.06),
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    />
                ))}
            </motion.div>
        )}
    </AnimatePresence>
))

/* ================= NAVIGATION ================= */

interface CarouselNavProps {
    onPrev: () => void
    onNext: () => void
    onTo: (index: number) => void
    current: number
    total: number
}

const CarouselNav = memo(({ onPrev, onNext, current, total, onTo }: CarouselNavProps) => (
    <div className="absolute bottom-12 left-0 right-0 z-30 pointer-events-none">
        <div className="container mx-auto max-w-7xl px-8 flex items-center justify-between">
            {/* Dots */}
            <div className="flex items-center gap-3 pointer-events-auto">
                {Array.from({ length: total }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onTo(i)}
                        className="group relative py-2"
                        aria-label={`Go to slide ${i + 1}`}
                    >
                        <div className={cn(
                            "h-1 transition-all duration-500 rounded-full",
                            current === i ? "w-12 bg-white" : "w-6 bg-white/30 group-hover:bg-white/50"
                        )} />
                    </button>
                ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-3 pointer-events-auto">
                <button
                    onClick={onPrev}
                    aria-label="Previous slide"
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/15 text-white transition-colors duration-300 hover:bg-white hover:text-[#1e3a5f]"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={onNext}
                    aria-label="Next slide"
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/15 text-white transition-colors duration-300 hover:bg-white hover:text-[#4988c4]"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
))

/* ================= MAIN COMPONENT ================= */

export default function HeroCarousel() {
    const autoplayPlugin = useMemo(
        () => Autoplay({ delay: 6000, stopOnInteraction: false }),
        []
    )

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, duration: 30, skipSnaps: false },
        [autoplayPlugin]
    )

    const [selectedIndex, setSelectedIndex] = useState(0)
    const [sweepKey, setSweepKey] = useState(0)
    const prevIndexRef = useRef(0)

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        const newIndex = emblaApi.selectedScrollSnap()
        if (newIndex !== prevIndexRef.current) {
            prevIndexRef.current = newIndex
            setSweepKey(pk => pk + 1)
        }
        setSelectedIndex(newIndex)
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on("select", onSelect)
        emblaApi.on("reInit", onSelect)
        return () => {
            emblaApi.off("select", onSelect)
            emblaApi.off("reInit", onSelect)
        }
    }, [emblaApi, onSelect])

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

    const currentSlide = SLIDES[selectedIndex]

    return (
        <section className="relative w-full h-[85vh] min-h-[700px] overflow-hidden bg-[#1e3a5f]" aria-roledescription="carousel">
            {/* Background Gradient Layer */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="absolute inset-0 z-0"
                    style={{ background: `linear-gradient(135deg, ${currentSlide.bgFrom} 0%, ${currentSlide.bgTo} 100%)` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
                </motion.div>
            </AnimatePresence>

            {/* Transition Effect */}
            <LightSweep sweepKey={sweepKey} />

            {/* Embla Viewport */}
            <div className="embla h-full relative z-10" ref={emblaRef}>
                <div className="embla__container h-full flex">
                    {SLIDES.map((slide, i) => (
                        <div
                            key={i}
                            className="embla__slide flex-[0_0_100%] min-w-0 h-full relative"
                            aria-roledescription="slide"
                            aria-label={`${i + 1} of ${SLIDES.length}`}
                        >
                            <div className="container mx-auto max-w-7xl h-full px-8">
                                <div className="grid lg:grid-cols-2 gap-12 items-center h-full pt-20">
                                    <SlideContent slide={slide} active={i === selectedIndex} />
                                    <div className="hidden lg:block">
                                        <SlideImage slide={slide} active={i === selectedIndex} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Controls */}
            <CarouselNav
                onPrev={scrollPrev}
                onNext={scrollNext}
                onTo={scrollTo}
                current={selectedIndex}
                total={SLIDES.length}
            />

            {/* Decorative Side Element */}
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-64 bg-white/8 rounded-l-full border border-white/10 hidden xl:block z-0" />
        </section>
    )
}
