import { AnimatePresence, motion } from "framer-motion"
import { useHeroCarousel } from "./useHeroCarousel"
import { SLIDES } from "./constants"
import { SlideContent } from "./SlideContent"
import { SlideImage } from "./SlideImage"
import { LightSweep } from "./LightSweep"
import { CarouselNav } from "./CarouselNav"

export default function HeroCarousel() {
    const {
        emblaRef,
        selectedIndex,
        sweepKey,
        scrollPrev,
        scrollNext,
        scrollTo
    } = useHeroCarousel()

    const currentSlide = SLIDES[selectedIndex]

    return (
        <section className="relative w-full h-[85vh] min-h-[700px] overflow-hidden bg-[#1e3a5f]" aria-roledescription="carousel">
            {/* Background Gradient Layer */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="absolute inset-0 z-0"
                    style={{ background: `linear-gradient(135deg, ${currentSlide.bgFrom} 0%, ${currentSlide.bgTo} 100%)` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
                </motion.div>
            </AnimatePresence>

            {/* Transition Effect - Light sweep optimized */}
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

            {/* Decorative Side Elements - Optimized Floating */}
            <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 -right-6 w-12 h-64 bg-white/5 rounded-l-full border border-white/5 hidden xl:block z-0" 
            />
        </section>
    )
}
