import { memo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CarouselNavProps {
    onPrev: () => void
    onNext: () => void
    onTo: (index: number) => void
    current: number
    total: number
}

export const CarouselNav = memo(({ onPrev, onNext, current, total, onTo }: CarouselNavProps) => (
    <div className="absolute bottom-12 left-0 right-0 z-30 pointer-events-none">
        <div className="container mx-auto max-w-7xl px-8 flex items-center justify-between">
            {/* Dots - Sharp & Modern */}
            <div className="flex items-center gap-4 pointer-events-auto">
                {Array.from({ length: total }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onTo(i)}
                        className="group relative py-3"
                        aria-label={`Go to slide ${i + 1}`}
                    >
                        <div className={cn(
                            "h-1.5 transition-all duration-700 rounded-full",
                            current === i 
                                ? "w-16 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                                : "w-6 bg-white/20 group-hover:bg-white/40"
                        )} />
                    </button>
                ))}
            </div>

            {/* Arrows - Tactical & Interactive */}
            <div className="flex items-center gap-4 pointer-events-auto">
                <button
                    onClick={onPrev}
                    aria-label="Previous slide"
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all duration-500 hover:bg-white hover:text-[#1e3a5f] hover:scale-110 active:scale-90 hover:shadow-2xl group"
                >
                    <ChevronLeft className="w-6 h-6 transition-transform duration-300 group-hover:-translate-x-1" />
                </button>
                <button
                    onClick={onNext}
                    aria-label="Next slide"
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all duration-500 hover:bg-white hover:text-[#4988c4] hover:scale-110 active:scale-90 hover:shadow-2xl group"
                >
                    <ChevronRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    </div>
))
