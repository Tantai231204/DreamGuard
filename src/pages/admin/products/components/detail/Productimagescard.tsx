import { useState, useCallback } from 'react';
import { ImagePlus, Plus, Trash2, ZoomIn, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Asset {
    id: string;
    url: string;
}

interface ProductImagesCardProps {
    assets: Asset[];
    productName: string;
    onOpenLightbox: (index: number) => void;
    onOpenUploadDialog?: () => void;
    onDeleteImage?: (assetId: string) => Promise<void>;
    isDeleting?: boolean;
    deletingAssetId?: string | null;
}

export default function ProductImagesCard({
    assets,
    productName,
    onOpenLightbox,
    onOpenUploadDialog,
    onDeleteImage,
    isDeleting = false,
    deletingAssetId = null,
}: ProductImagesCardProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const handleDelete = useCallback(
        async (assetId: string, e: React.MouseEvent) => {
            e.stopPropagation();
            if (onDeleteImage) await onDeleteImage(assetId);
        },
        [onDeleteImage],
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Camera size={14} className="text-white" />
                    </div>
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Visual Assets</h3>
                </div>
                <div className="px-4 py-2 rounded-full bg-blue-50 border border-blue-100/50">
                    <span className="text-[9px] font-black text-[var(--color-primary)] uppercase tracking-widest">
                        {assets.length} / 10 Storage
                    </span>
                </div>
            </div>

            {assets.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 rounded-[2rem] bg-white shadow-xl shadow-slate-200 flex items-center justify-center mb-8"
                    >
                        <ImagePlus size={32} className="text-slate-200" />
                    </motion.div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-2">Vault is Empty</h4>
                    <p className="text-xs text-slate-400 font-medium mb-10">Initialize your product gallery.</p>
                    {onOpenUploadDialog && (
                        <Button
                            onClick={onOpenUploadDialog}
                            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-10 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all"
                        >
                            <Plus size={16} className="mr-2" />
                            Upload Media
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                    {assets.map((asset, index) => (
                        <div
                            key={asset.id}
                            className="relative aspect-square group cursor-pointer overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-500"
                            onMouseEnter={() => setHoveredId(asset.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => onOpenLightbox(index)}
                        >
                            <img
                                src={asset.url}
                                alt={`${productName} - ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />

                            {index === 0 && (
                                <div className="absolute top-4 left-4 px-2.5 py-1 bg-[var(--color-primary)] text-white text-[7px] font-black uppercase tracking-[0.1em] rounded-md shadow-lg shadow-blue-500/30 z-10">
                                    Principal
                                </div>
                            )}

                            <AnimatePresence>
                                {hoveredId === asset.id && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center gap-4"
                                    >
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onOpenLightbox(index); }}
                                            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white flex items-center justify-center transition-all hover:scale-110 hover:bg-white active:scale-95"
                                        >
                                            <ZoomIn size={16} className="text-[var(--color-primary)]" />
                                        </button>
                                        {onDeleteImage && (
                                            <button
                                                onClick={(e) => handleDelete(asset.id, e)}
                                                disabled={isDeleting && deletingAssetId === asset.id}
                                                className="w-10 h-10 bg-slate-900/90 backdrop-blur-md text-white rounded-xl shadow-xl flex items-center justify-center transition-all hover:scale-110 hover:bg-slate-900 active:scale-95 disabled:opacity-50"
                                            >
                                                {isDeleting && deletingAssetId === asset.id ? (
                                                    <Loader2 size={16} className="animate-spin text-white" />
                                                ) : (
                                                    <Trash2 size={16} className="text-white" />
                                                )}
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}

                    {onOpenUploadDialog && (
                        <button
                            onClick={onOpenUploadDialog}
                            className="aspect-square flex flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-200 hover:border-[var(--color-primary)] hover:bg-blue-50/30 transition-all duration-300 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-[var(--color-primary)] group-hover:scale-110">
                                <Plus size={20} className="text-slate-400 transition-colors group-hover:text-white" />
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[var(--color-primary)]">Add Asset</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
