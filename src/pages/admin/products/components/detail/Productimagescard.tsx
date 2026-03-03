import { useState } from 'react';
import { ImagePlus, Plus, Trash2, ZoomIn, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from './Sectionheading';
import { cn } from '@/lib/utils';

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

    const handleDelete = async (assetId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDeleteImage) {
            await onDeleteImage(assetId);
        }
    };

    return (
        <Card className="p-5 border border-gray-100 rounded-2xl shadow-sm bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <SectionHeading
                    label="Product Images"
                    trailing={
                        assets.length > 0 ? (
                            <span className="text-[11px] font-medium text-gray-400 tabular-nums bg-gray-100 px-2 py-0.5 rounded-full">
                                {assets.length}/5
                            </span>
                        ) : undefined
                    }
                />
            </div>

            {/* Empty State */}
            {assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-inner">
                        <ImagePlus size={28} className="text-blue-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">No images yet</p>
                    <p className="text-xs text-gray-400 mb-4">Upload up to 5 product images</p>
                    {onOpenUploadDialog && (
                        <Button
                            onClick={onOpenUploadDialog}
                            className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
                        >
                            <Plus size={16} />
                            Upload Images
                        </Button>
                    )}
                </div>
            ) : (
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
                            className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            loading="lazy"
                        />
                        {/* Main badge */}
                        <span className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wide rounded-lg shadow">
                            Main
                        </span>
                        {/* Overlay actions */}
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-between p-3 transition-opacity duration-200",
                            hoveredId === assets[0].id ? "opacity-100" : "opacity-0"
                        )}>
                            <button
                                onClick={(e) => { e.stopPropagation(); onOpenLightbox(0); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium rounded-lg shadow transition-colors"
                            >
                                <ZoomIn size={14} />
                                View
                            </button>
                            {onDeleteImage && (
                                <button
                                    onClick={(e) => handleDelete(assets[0].id, e)}
                                    disabled={isDeleting && deletingAssetId === assets[0].id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg shadow transition-colors disabled:opacity-50"
                                >
                                    {isDeleting && deletingAssetId === assets[0].id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={14} />
                                    )}
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Thumbnail Grid */}
                    {assets.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {assets.slice(1).map((asset, idx) => (
                                <div
                                    key={asset.id}
                                    className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                                    onMouseEnter={() => setHoveredId(asset.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onClick={() => onOpenLightbox(idx + 1)}
                                >
                                    <img
                                        src={asset.url}
                                        alt={`${productName} ${idx + 2}`}
                                        className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    {/* Delete overlay for thumbnails */}
                                    {onDeleteImage && (
                                        <div className={cn(
                                            "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-150",
                                            hoveredId === asset.id ? "opacity-100" : "opacity-0"
                                        )}>
                                            <button
                                                onClick={(e) => handleDelete(asset.id, e)}
                                                disabled={isDeleting && deletingAssetId === asset.id}
                                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow transition-colors disabled:opacity-50"
                                            >
                                                {isDeleting && deletingAssetId === asset.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add More Button */}
                    {onOpenUploadDialog && assets.length < 5 && (
                        <button
                            onClick={onOpenUploadDialog}
                            className="w-full py-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 text-gray-500 hover:text-blue-600 text-sm font-medium transition-all"
                        >
                            <Plus size={16} />
                            Add More Images ({5 - assets.length} remaining)
                        </button>
                    )}

                    {/* Max images info */}
                    {assets.length >= 5 && (
                        <p className="text-center text-xs text-gray-400 py-2">
                            Maximum 5 images reached
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
}

export default ProductImagesCard;