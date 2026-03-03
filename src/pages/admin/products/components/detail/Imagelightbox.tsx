import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Asset {
    id: string;
    url: string;
}

interface ImageLightboxProps {
    images: Asset[];
    currentIndex: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}

function ImageLightbox({ images, currentIndex, onClose, onPrev, onNext }: ImageLightboxProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
            onClick={onClose}
        >
            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white hover:bg-white/15 transition-all"
            >
                <X size={16} />
            </button>

            {/* Counter */}
            {images.length > 1 && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm">
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {/* Prev / Next */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="absolute left-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white hover:bg-white/15 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="absolute right-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white hover:bg-white/15 transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Image */}
            <motion.img
                key={images[currentIndex].id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                src={images[currentIndex].url}
                alt=""
                className="max-h-[85vh] max-w-[88vw] rounded-xl object-contain shadow-2xl ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
            />

            {/* Dot indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-6 flex gap-1.5">
                    {images.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-200 ${
                                i === currentIndex ? 'w-5 bg-white' : 'w-1 bg-white/30'
                            }`}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export default ImageLightbox;