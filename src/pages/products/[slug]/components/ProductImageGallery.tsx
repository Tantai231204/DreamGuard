import { memo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, Share2, Sparkles } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
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
    selectedImage,
    onSelectImage,
    isWishlisted,
    onToggleWishlist,
    discount,
}: ProductImageGalleryProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false }, [
        Autoplay({ delay: 6000, stopOnInteraction: true })
    ]);

    const scrollPrev = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    useEffect(() => {
        if (emblaApi) emblaApi.scrollTo(selectedImage);
    }, [selectedImage, emblaApi]);

    if (!images.length) return (
        <div className="aspect-square w-full rounded-[3rem] bg-primary-light/10 flex items-center justify-center border-2 border-dashed border-primary-light/40 italic text-primary-light font-black uppercase tracking-widest text-xs">
            No Imagery Found
        </div>
    );

    return (
        <motion.div
            className="flex flex-col gap-8"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Main Stage */}
            <div className="relative aspect-square overflow-hidden rounded-[3rem] bg-white border border-primary-light/40 group shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
                <div className="h-full w-full" ref={emblaRef}>
                    <div className="flex h-full">
                        {images.map((img, index) => (
                            <div key={index} className="flex-[0_0_100%] min-w-0 h-full relative cursor-zoom-in">
                                <motion.img
                                    src={img}
                                    alt={`${productName} - View ${index + 1}`}
                                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary-dark/5 to-transparent pointer-events-none" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Perspective Arrows */}
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button
                        onClick={scrollPrev}
                        className="pointer-events-auto h-14 w-14 rounded-2xl bg-white/95 shadow-2xl border border-primary-light/40 flex items-center justify-center text-primary-dark transition-all hover:scale-110 active:scale-90 backdrop-blur-xl translate-x-[-20%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="h-6 w-6 stroke-[3]" />
                    </button>
                    <button
                        onClick={scrollNext}
                        className="pointer-events-auto h-14 w-14 rounded-2xl bg-white/95 shadow-2xl border border-primary-light/40 flex items-center justify-center text-primary-dark transition-all hover:scale-110 active:scale-90 backdrop-blur-xl translate-x-[20%] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="h-6 w-6 stroke-[3]" />
                    </button>
                </div>

                {/* Curated Overlays */}
                <div className="absolute left-8 top-8 flex flex-col gap-3">
                    {discount && (
                        <Badge className="bg-amber-400 text-white px-4 py-2 text-[10px] font-black tracking-[0.2em] shadow-2xl border-0 rounded-xl">
                            <Sparkles className="h-3 w-3 mr-2 fill-white" />
                            -{discount}% EXCLUSIVE
                        </Badge>
                    )}
                </div>

                <div className="absolute right-8 top-8 flex flex-col gap-4">
                    <button
                        onClick={onToggleWishlist}
                        className={cn(
                            "h-14 w-14 rounded-2xl bg-white/95 shadow-2xl border border-primary-light/40 flex items-center justify-center transition-all hover:scale-110 active:scale-90 backdrop-blur-xl group/fav",
                            isWishlisted ? "text-rose-500" : "text-primary-light hover:text-rose-500"
                        )}
                    >
                        <Heart className={cn("h-6 w-6 transition-transform group-active/fav:scale-125", isWishlisted && "fill-current")} />
                    </button>
                    <button className="h-14 w-14 rounded-2xl bg-white/95 shadow-2xl border border-primary-light/40 flex items-center justify-center text-primary-light hover:text-primary-dark transition-all hover:scale-110 active:scale-90 backdrop-blur-xl">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Cinematic Strip */}
            <div className="flex flex-wrap gap-5 px-2">
                {images.map((img, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectImage(index)}
                        className={cn(
                            "group relative h-24 w-24 overflow-hidden rounded-2xl border-2 transition-all duration-500",
                            selectedImage === index
                                ? "border-primary-dark ring-8 ring-primary-dark/5 scale-105"
                                : "border-transparent bg-primary-light/5 hover:bg-white hover:border-primary-light/40 opacity-60 hover:opacity-100"
                        )}
                    >
                        <img
                            src={img}
                            alt={`Gallery Thumb ${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <AnimatePresence>
                            {selectedImage === index && (
                                <motion.div
                                    layoutId="gallery-active-overlay"
                                    className="absolute inset-0 bg-primary-dark/5 pointer-events-none"
                                />
                            )}
                        </AnimatePresence>
                    </button>
                ))}
            </div>
        </motion.div>
    );
});

ProductImageGallery.displayName = 'ProductImageGallery';
