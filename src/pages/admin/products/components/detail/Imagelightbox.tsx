import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn } from 'lucide-react';

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
    /* ── Keyboard navigation ── */
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    onPrev();
                    break;
                case 'ArrowRight':
                    onNext();
                    break;
            }
        },
        [onClose, onPrev, onNext],
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    const current = images[currentIndex];
    if (!current) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
            onClick={onClose}
        >
            {/* ── Top bar ── */}
            <div className="absolute top-0 inset-x-0 flex items-center justify-between px-6 py-4 z-10">
                {/* Counter */}
                {images.length > 1 && (
                    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm tabular-nums">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
                {images.length <= 1 && <div />}

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <a
                        href={current.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-all"
                        title="Open in new tab"
                    >
                        <Download size={15} />
                    </a>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-red-500/80 hover:text-white hover:border-red-500/80 transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* ── Navigation Buttons ── */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPrev();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onNext();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                    >
                        <ChevronRight size={22} />
                    </button>
                </>
            )}

            {/* ── Main Image ── */}
            <AnimatePresence mode="wait">
                <motion.img
                    key={current.id}
                    initial={{ scale: 0.92, opacity: 0, y: 8 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    src={current.url}
                    alt=""
                    className="max-h-[80vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
                    onClick={(e) => e.stopPropagation()}
                    draggable={false}
                />
            </AnimatePresence>

            {/* ── Thumbnail Strip ── */}
            {images.length > 1 && (
                <div
                    className="absolute bottom-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/50 p-2 backdrop-blur-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    {images.map((img, i) => (
                        <button
                            key={img.id}
                            onClick={() => {
                                // Navigate to clicked thumbnail
                                const diff = i - currentIndex;
                                if (diff > 0) for (let j = 0; j < diff; j++) onNext();
                                else if (diff < 0) for (let j = 0; j < Math.abs(diff); j++) onPrev();
                            }}
                            className={`relative h-12 w-12 overflow-hidden rounded-xl transition-all duration-200 ${
                                i === currentIndex
                                    ? 'ring-2 ring-white ring-offset-1 ring-offset-black/50 scale-110'
                                    : 'opacity-50 hover:opacity-80 hover:scale-105'
                            }`}
                        >
                            <img
                                src={img.url}
                                alt=""
                                className="h-full w-full object-cover"
                                draggable={false}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* ── Keyboard hint ── */}
            <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-3 text-[10px] text-white/30">
                <span className="flex items-center gap-1">
                    <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">←</kbd>
                    <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">→</kbd>
                    Navigate
                </span>
                <span className="flex items-center gap-1">
                    <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">Esc</kbd>
                    Close
                </span>
            </div>
        </motion.div>
    );
}

export default ImageLightbox;
