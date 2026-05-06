import React from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, XCircle } from "lucide-react";

interface TradeInImmersiveGalleryProps {
    previewIndex: number | null;
    allImages: string[];
    onClose: () => void;
    onPrev: (e: React.MouseEvent) => void;
    onNext: (e: React.MouseEvent) => void;
}

export const TradeInImmersiveGallery = ({ 
    previewIndex, 
    allImages, 
    onClose, 
    onPrev, 
    onNext 
}: TradeInImmersiveGalleryProps) => {
    if (previewIndex === null) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in-95 duration-200 cursor-zoom-out"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <div className="fixed inset-x-4 md:inset-x-12 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-[310] w-[calc(100%-2rem)] md:w-[calc(100%-6rem)]">
                <div className="pointer-events-auto">
                    {previewIndex > 0 && (
                        <button
                            className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/5 hover:bg-white text-white hover:text-primary flex items-center justify-center shadow-2xl transition-all active:scale-90 border border-white/10 hover:border-white group backdrop-blur-md"
                            onClick={onPrev}
                        >
                            <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
                        </button>
                    )}
                </div>
                <div className="pointer-events-auto">
                    {previewIndex < allImages.length - 1 && (
                        <button
                            className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/5 hover:bg-white text-white hover:text-primary flex items-center justify-center shadow-2xl transition-all active:scale-90 border border-white/10 hover:border-white group backdrop-blur-md"
                            onClick={onNext}
                        >
                            <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
                        </button>
                    )}
                </div>
            </div>

            <div
                className="relative max-w-full max-h-full animate-in zoom-in-90 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={allImages[previewIndex]} className="max-w-[95vw] max-h-[90vh] object-contain block shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-xl" alt="Preview" />

                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <div className="px-6 py-2.5 rounded-full bg-white/10 text-white/80 text-[11px] font-black uppercase tracking-[0.3em] backdrop-blur-xl border border-white/10 shadow-2xl">
                        Package Manifest {previewIndex + 1} <span className="mx-2 text-white/20">/</span> {allImages.length}
                    </div>
                </div>

                <button
                    className="fixed top-8 right-8 w-14 h-14 rounded-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-all shadow-2xl active:scale-95 border border-rose-500/20 z-[320] backdrop-blur-md"
                    onClick={onClose}
                >
                    <XCircle className="w-8 h-8" />
                </button>
            </div>
        </div>,
        document.body
    );
};
