import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useUploadComboImage, useDeleteComboImage } from '@/hooks/queries/useCombo';
import { ImageUploadDialog } from '../../dialogs';
import type { Path, PathValue } from 'react-hook-form';
import type { ComboFormValues } from '../index';
import type { SetFieldFn } from '../combo-form.types';

interface MediaBlockProps {
    watchValues: Partial<ComboFormValues>;
    comboId?: string;
    setField: SetFieldFn;
}

const MediaBlock = memo(function MediaBlock({ watchValues, comboId, setField }: MediaBlockProps) {
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const uploadMutation = useUploadComboImage();
    const deleteMutation = useDeleteComboImage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMediaLoading = uploadMutation.isPending || deleteMutation.isPending;

    const handleDelete = useCallback(async () => {
        if (!watchValues.imagePublicId) return;
        if (window.confirm('Delete this image?')) {
            await deleteMutation.mutateAsync(watchValues.imagePublicId);
            setField('imageUrl' as Path<ComboFormValues>, '' as PathValue<ComboFormValues, 'imageUrl'>);
            setField('imagePublicId' as Path<ComboFormValues>, '' as PathValue<ComboFormValues, 'imagePublicId'>);
        }
    }, [watchValues.imagePublicId, deleteMutation, setField]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setField('imageFile' as Path<ComboFormValues>, file as PathValue<ComboFormValues, 'imageFile'>);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [setField]);

    const handleUploadClick = useCallback(() => {
        if (comboId) {
            setShowUploadDialog(true);
        } else {
            fileInputRef.current?.click();
        }
    }, [comboId]);

    // Local blob preview — revoked on cleanup to prevent memory leaks
    const previewUrl = useMemo(() => {
        if (watchValues.imageFile instanceof File) {
            return URL.createObjectURL(watchValues.imageFile);
        }
        return watchValues.imageUrl || null;
    }, [watchValues.imageFile, watchValues.imageUrl]);

    useEffect(() => {
        return () => {
            if (previewUrl && watchValues.imageFile instanceof File) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, watchValues.imageFile]);

    const hasImage = !!previewUrl;
    const hasPendingFile = watchValues.imageFile instanceof File;

    return (
        <>
            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white group">
                {isMediaLoading && (
                    <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                )}
                <div className="h-32 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {hasImage ? (
                        <img
                            src={previewUrl!}
                            alt="Combo"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                    )}
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-slate-100">
                    <p className="text-[10px] font-mono text-slate-400 truncate min-w-0">
                        {hasPendingFile
                            ? <span className="text-amber-500 font-semibold">Pending upload</span>
                            : (watchValues.imagePublicId || '—')
                        }
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {(watchValues.imagePublicId || hasPendingFile) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-400 hover:bg-red-50"
                                onClick={hasPendingFile
                                    ? () => setField('imageFile' as Path<ComboFormValues>, undefined as PathValue<ComboFormValues, 'imageFile'>)
                                    : handleDelete
                                }
                                disabled={isMediaLoading}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <Button
                            type="button"
                            size="sm"
                            className="h-7 px-3 text-[11px] font-semibold rounded-md"
                            onClick={handleUploadClick}
                            disabled={isMediaLoading}
                        >
                            <Upload className="h-3 w-3 mr-1.5" />
                            {hasImage ? 'Change' : 'Upload'}
                        </Button>
                    </div>
                </div>
            </div>
            {comboId && showUploadDialog && (
                <ImageUploadDialog
                    open={showUploadDialog}
                    onOpenChange={setShowUploadDialog}
                    productId={comboId}
                    productName={watchValues.name || ''}
                    onUpload={async (cid, files) => {
                        await uploadMutation.mutateAsync({ comboId: cid, files });
                        setShowUploadDialog(false);
                    }}
                    isUploading={uploadMutation.isPending}
                />
            )}
        </>
    );
});

export default MediaBlock;
