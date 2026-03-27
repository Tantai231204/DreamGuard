import { memo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Share2, Sparkles, ImageOff } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
    productSummary?: string;
    selectedImage: number;
    onSelectImage: (index: number) => void;
    isWishlisted: boolean;
    onToggleWishlist: () => void;
    discount?: number;
    inStock?: boolean;
}

export const ProductImageGallery = memo(({
    images = [],
    productName,
    productSummary,
    selectedImage,
    onSelectImage,
    isWishlisted,
    onToggleWishlist,
    discount,
}: ProductImageGalleryProps) => {
    const hasImages = images && images.length > 0;

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false }, [
        Autoplay({ delay: 6000, stopOnInteraction: true })
    ]);

    const scrollPrev = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: productName,
                text: productSummary,
                url: window.location.href,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    useEffect(() => {
        if (emblaApi && hasImages) emblaApi.scrollTo(selectedImage);
    }, [selectedImage, emblaApi, hasImages]);

    return (
        <motion.div
            className="flex flex-col gap-8"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Main Stage - DASHED BORDER IN THEME BLUE ( #4988c4 ), No Shadow */}
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] lg:rounded-[3rem] bg-white border-2 border-dashed border-[#4988c4]/30 group z-10 transition-colors hover:border-[#4988c4]/60">
                {/* 1. Carousel/Placeholder Layer */}
                {hasImages ? (
                    <div className="h-full w-full z-0" ref={emblaRef}>
                        <div className="flex h-full">
                            {images.map((img, index) => (
                                <div key={index} className="flex-[0_0_100%] min-w-0 h-full relative cursor-zoom-in">
                                    <motion.img
                                        src={img}
                                        alt={`${productName} - View ${index + 1}`}
                                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-4 bg-slate-50/50 italic text-slate-400">
                        <div className="p-8 rounded-full bg-white shadow-sm ring-1 ring-slate-100">
                            <ImageOff className="w-10 h-10 stroke-[1.2] text-slate-200" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">No imagery found</span>
                    </div>
                )}

                {/* 2. Floating Badges Layer - PROMINENT COLOR & MODERN */}
                <div className="absolute left-8 top-10 flex flex-col gap-3 z-20 pointer-events-none">
                    {discount && (
                        <div className="flex items-center gap-2 bg-rose-600 text-white px-4 py-1.5 rounded-xl shadow-[0_8px_30px_rgba(225,29,72,0.3)] animate-in fade-in slide-in-from-left-4 duration-700 pointer-events-auto">
                            <Sparkles className="h-3.5 w-3.5 fill-white text-white" />
                            <span className="text-[11px] font-black uppercase tracking-[0.15em]">-{discount}% OFF</span>
                        </div>
                    )}
                </div>

                {/* 3. Navigation Layer (Middle) */}
                {hasImages && (
                    <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                        <button
                            onClick={scrollPrev}
                            className="pointer-events-auto h-12 w-12 rounded-xl bg-white/95 shadow-xl border border-white/20 flex items-center justify-center text-slate-900 transition-all hover:scale-110 active:scale-95 backdrop-blur-xl translate-x-[-20%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        >
                            <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="pointer-events-auto h-12 w-12 rounded-xl bg-white/95 shadow-xl border border-white/20 flex items-center justify-center text-slate-900 transition-all hover:scale-110 active:scale-95 backdrop-blur-xl translate-x-[20%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="h-5 w-5 stroke-[2.5]" />
                        </button>
                    </div>
                )}

                {/* 4. Floating Action Group (TOP Layer) - REFINED */}
                <div className="absolute right-8 top-10 flex flex-col gap-3 z-30">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleWishlist();
                        }}
                        className={cn(
                            "h-12 w-12 rounded-xl bg-white/95 shadow-[0_15px_45px_-5px_rgba(0,0,0,0.1)] border border-white/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 backdrop-blur-2xl group/fav ring-4 ring-white/10",
                            isWishlisted ? "text-rose-500 scale-105 ring-rose-500/10" : "text-slate-400 hover:text-rose-500"
                        )}
                        aria-label="Add to favorites"
                    >
                        <Heart className={cn("h-5 w-5 transition-transform duration-300 group-hover/fav:scale-110", isWishlisted && "fill-current animate-in zoom-in-75 duration-300")} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="h-12 w-12 rounded-xl bg-white/95 shadow-[0_15px_45px_-5px_rgba(0,0,0,0.1)] border border-white/40 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all duration-300 hover:scale-110 active:scale-90 backdrop-blur-2xl group/share ring-4 ring-white/10"
                        aria-label="Share product"
                    >
                        <Share2 className="h-5 w-5 transition-transform group-hover/share:rotate-12" />
                    </button>
                </div>
            </div>

            {/* Cinematic Strip (Thumbnails) */}
            {hasImages && (
                <div className="flex flex-wrap gap-4 px-1">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => onSelectImage(index)}
                            className={cn(
                                "group relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-all duration-500",
                                selectedImage === index
                                    ? "border-[#4988c4] ring-4 ring-[#4988c4]/10 scale-105 shadow-lg"
                                    : "border-transparent bg-slate-50 hover:bg-white hover:border-slate-200 opacity-70 hover:opacity-100"
                            )}
                        >
                            <img
                                src={img}
                                alt={`Thumb ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <AnimatePresence>
                                {selectedImage === index && (
                                    <motion.div
                                        layoutId="gallery-active-overlay"
                                        className="absolute inset-0 bg-[#4988c4]/5 pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
});

ProductImageGallery.displayName = 'ProductImageGallery';
