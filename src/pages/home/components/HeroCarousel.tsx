import useEmblaCarousel from "embla-carousel-react"
import { useCallback, useEffect, useState, useMemo } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import Autoplay from 'embla-carousel-autoplay'

const slides = [
    {
        title: "A good night's sleep for",
        subtitle: "your baby",
        description: "every peaceful night",
        image: "/images/chan_ga.jpg",
    },
    {
        title: "Premium comfort for",
        subtitle: "your family",
        description: "restful nights guaranteed",
        image: "/images/chan_ga.jpg",
    },
    {
        title: "Sweet dreams await",
        subtitle: "every night",
        description: "quality you can trust",
        image: "/images/chan_ga.jpg",
    },
]

export default function HeroCarousel() {
    const autoplayPlugin = useMemo(
        () => Autoplay({ delay: 5000, stopOnInteraction: false }),
        []
    )

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            skipSnaps: false,
            duration: 20,
            dragFree: false,
            containScroll: 'trimSnaps',
            align: 'start'
        },
        [autoplayPlugin]
    )
    const [selectedIndex, setSelectedIndex] = useState(0)

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
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

    return (
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#F5F0ED] to-[#E8DDD8]">
            {/* Top Left Decorative Element */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-br-[100px] z-10" />

            <div className="embla" ref={emblaRef}>
                <div className="embla__container flex">
                    {slides.map((s, i) => {
                        const active = i === selectedIndex

                        return (
                            <div
                                key={i}
                                className="embla__slide flex-[0_0_100%] min-w-0 relative"
                            >
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                    style={{
                                        backgroundImage: `url(${s.image})`,
                                    }}
                                >
                                    {/* Dark Overlay */}
                                    <div className="absolute inset-0 bg-black/50" />
                                </div>

                                {/* Content */}
                                <div className="relative container mx-auto max-w-7xl px-4 py-20 md:py-24">
                                    <div className="grid md:grid-cols-2 gap-14 items-center">
                                        {/* TEXT */}
                                        <div
                                            className="space-y-6 transition-all duration-700 ease-out will-change-transform"
                                            style={{
                                                transform: active ? 'translateX(0)' : 'translateX(-50px)',
                                                opacity: active ? 1 : 0,
                                            }}
                                        >
                                            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white"
                                                style={{
                                                    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)'
                                                }}
                                            >
                                                {s.title}
                                                <span className="block mt-2">{s.subtitle}</span>
                                            </h1>

                                            <p className="text-xl font-medium text-white/90"
                                                style={{
                                                    textShadow: '1px 1px 6px rgba(0, 0, 0, 0.5)'
                                                }}
                                            >
                                                {s.description}
                                            </p>

                                            <button className="hero-button mt-6 px-10 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                                Shop now
                                            </button>
                                        </div>

                                        {/* Image Preview Component */}
                                        <div
                                            className="relative transition-all duration-700 ease-out will-change-transform"
                                            style={{
                                                transform: active ? 'translateX(0) scale(1)' : 'translateX(50px) scale(0.9)',
                                                opacity: active ? 1 : 0,
                                            }}
                                        >
                                            <div className="relative w-full max-w-md mx-auto">
                                                {/* Main Preview Card */}
                                                <div className="hero-image-card relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                                                    <img
                                                        src={s.image}
                                                        alt={s.subtitle}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>

                                                {/* Dots Indicator on Image */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/30 backdrop-blur-sm rounded-full px-3 py-2">
                                                    {slides.map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`w-2 h-2 rounded-full transition-all ${idx === i ? 'bg-white w-6' : 'bg-white/50'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Dots Navigation with Nav Buttons */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
                {/* Previous Button */}
                <button
                    onClick={scrollPrev}
                    className="carousel-nav-button h-10 w-10 rounded-full flex items-center justify-center transition-all"
                    aria-label="Previous slide"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="flex gap-3">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => emblaApi?.scrollTo(i)}
                            className="transition-all duration-300"
                            aria-label={`Go to slide ${i + 1}`}
                        >
                            <div
                                className={`carousel-dot rounded-full transition-all duration-300 ${selectedIndex === i ? 'carousel-dot-active' : 'carousel-dot-inactive'
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={scrollNext}
                    className="carousel-nav-button h-10 w-10 rounded-full flex items-center justify-center transition-all"
                    aria-label="Next slide"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
        </section>
    )
}

