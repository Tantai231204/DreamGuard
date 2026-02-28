import { memo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
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
    images,
    productName,
    selectedImage,
    onSelectImage,
    isWishlisted,
    onToggleWishlist,
    discount,
    inStock = true
}: ProductImageGalleryProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 3000, stopOnInteraction: true })]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    useEffect(() => {
        if (emblaApi) {
            emblaApi.scrollTo(selectedImage);
        }
    }, [selectedImage, emblaApi]);

    return (
        <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Main Image with Carousel */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 group">
                <div className="aspect-square" ref={emblaRef}>
                    <div className="flex">
                        {images.map((img, index) => (
                            <div key={index} className="flex-[0_0_100%] min-w-0">
                                <AnimatePresence mode="wait">
                                    {selectedImage === index && (
                                        <motion.img
                                            key={img}
                                            src={img}
                                            alt={`${productName} - ${index + 1}`}
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                            className="h-full w-full object-cover"
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={scrollPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                    onClick={scrollNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                >
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>

                {/* Badges */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                    {discount && (
                        <Badge className="bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                            -{discount}%
                        </Badge>
                    )}
                    {inStock && (
                        <Badge className="bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                            In Stock
                        </Badge>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={onToggleWishlist}
                    className={cn(
                        "absolute right-4 top-4 rounded-full bg-white/90 p-2.5 shadow-md backdrop-blur-sm transition-all hover:scale-110",
                        isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
                    )}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                </button>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3">
                {images.map((img, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectImage(index)}
                        className={cn(
                            "relative overflow-hidden rounded-xl border-2 transition-all duration-200",
                            selectedImage === index
                                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                                : "border-gray-200 hover:border-gray-300"
                        )}
                    >
                        <img
                            src={img}
                            alt={`${productName} - ${index + 1}`}
                            className="h-20 w-20 object-cover"
                        />
                    </button>
                ))}
            </div>
        </motion.div>
    );
});

ProductImageGallery.displayName = 'ProductImageGallery';
