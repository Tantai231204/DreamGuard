import { useState, useCallback } from 'react';
import { ImagePlus, Plus, Trash2, ZoomIn, Loader2, Download, Image } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from './Sectionheading';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

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

function ProductImagesCard({
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

    /* ── Empty State ── */
    if (assets.length === 0) {
        return (
            <Card className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                <div className="h-[2px] bg-gradient-to-r from-[var(--color-primary)] via-blue-500 to-blue-600" />
                <div className="p-5">
                    <SectionHeading label="Product Images" />
                    <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-gray-50/80 to-white">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-200 shadow-inner"
                        >
                            <ImagePlus size={28} className="text-[var(--color-primary)]" />
                        </motion.div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">No images yet</p>
                        <p className="text-xs text-gray-400 mb-5 max-w-[200px] text-center">
                            Upload up to 5 product images to showcase your product
                        </p>
                        {onOpenUploadDialog && (
                            <Button
                                onClick={onOpenUploadDialog}
                                className="gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-[var(--color-primary-hover)] hover:to-blue-700 shadow-lg shadow-[var(--color-primary)]/20 px-5"
                            >
                                <Plus size={16} />
                                Upload Images
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        );
    }

    /* ── With Images ── */
    return (
        <Card className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="h-[2px] bg-gradient-to-r from-[var(--color-primary)] via-blue-500 to-blue-600" />
            <div className="p-5">
                <SectionHeading
                    label="Product Images"
                    trailing={
                        <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full tabular-nums">
                            {assets.length} / 5
                        </span>
                    }
                />

                <div className="space-y-3">
                    {/* Main Image */}
                    <div
                        className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                        onMouseEnter={() => setHoveredId(assets[0].id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => onOpenLightbox(0)}
                    >
                        <img
                            src={assets[0].url}
                            alt={`${productName} - Main`}
                            className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                        />

                        {/* Main badge */}
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm border border-white/50 flex items-center gap-1.5">
                            <Image size={11} />
                            Main
                        </span>

                        {/* Hover overlay */}
                        <AnimatePresence>
                            {hoveredId === assets[0].id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-between p-4"
                                >
                                    <TooltipProvider delayDuration={200}>
                                        <div className="flex gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onOpenLightbox(0); }}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 hover:bg-white text-gray-700 shadow-sm transition-all hover:scale-105"
                                                    >
                                                        <ZoomIn size={15} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>View full size</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <a
                                                        href={assets[0].url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 hover:bg-white text-gray-700 shadow-sm transition-all hover:scale-105"
                                                    >
                                                        <Download size={15} />
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent>Open in new tab</TooltipContent>
                                            </Tooltip>
                                        </div>
                                        {onDeleteImage && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={(e) => handleDelete(assets[0].id, e)}
                                                        disabled={isDeleting && deletingAssetId === assets[0].id}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all hover:scale-105 disabled:opacity-50"
                                                    >
                                                        {isDeleting && deletingAssetId === assets[0].id ? (
                                                            <Loader2 size={15} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={15} />
                                                        )}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>Delete image</TooltipContent>
                                            </Tooltip>
                                        )}
                                    </TooltipProvider>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Thumbnail Grid */}
                    {assets.length > 1 && (
                        <div className="grid grid-cols-4 gap-2.5">
                            {assets.slice(1).map((asset, idx) => (
                                <div
                                    key={asset.id}
                                    className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-gray-50 aspect-square"
                                    onMouseEnter={() => setHoveredId(asset.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onClick={() => onOpenLightbox(idx + 1)}
                                >
                                    <img
                                        src={asset.url}
                                        alt={`${productName} ${idx + 2}`}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        loading="lazy"
                                    />

                                    {/* Hover overlay */}
                                    <AnimatePresence>
                                        {hoveredId === asset.id && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.12 }}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1.5"
                                            >
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onOpenLightbox(idx + 1); }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 hover:bg-white text-gray-700 shadow-sm transition-all hover:scale-110"
                                                >
                                                    <ZoomIn size={14} />
                                                </button>
                                                {onDeleteImage && (
                                                    <button
                                                        onClick={(e) => handleDelete(asset.id, e)}
                                                        disabled={isDeleting && deletingAssetId === asset.id}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all hover:scale-110 disabled:opacity-50"
                                                    >
                                                        {isDeleting && deletingAssetId === asset.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add More */}
                    {onOpenUploadDialog && assets.length < 5 && (
                        <button
                            onClick={onOpenUploadDialog}
                            className="w-full py-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] hover:bg-primary-50/30 text-gray-400 hover:text-[var(--color-primary)] text-sm font-medium transition-all"
                        >
                            <Plus size={16} />
                            Add More Images
                            <span className="text-xs text-gray-300 font-normal">({5 - assets.length} remaining)</span>
                        </button>
                    )}

                    {assets.length >= 5 && (
                        <p className="text-center text-[11px] text-gray-400 py-1.5">
                            Maximum 5 images reached
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default ProductImagesCard;
