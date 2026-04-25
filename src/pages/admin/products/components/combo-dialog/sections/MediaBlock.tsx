import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useUploadComboImage, useDeleteComboImage } from '@/hooks/queries/useCombo';
import { ImageUploadDialog } from '../../dialogs';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const uploadMutation = useUploadComboImage();
    const deleteMutation = useDeleteComboImage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMediaLoading = uploadMutation.isPending || deleteMutation.isPending;

    const handleDelete = useCallback(() => {
        if (!watchValues.imagePublicId) return;
        setShowDeleteConfirm(true);
    }, [watchValues.imagePublicId]);

    const confirmDelete = useCallback(async () => {
        if (!watchValues.imagePublicId) return;
        await deleteMutation.mutateAsync(watchValues.imagePublicId);
        setField('imageUrl' as Path<ComboFormValues>, '' as PathValue<ComboFormValues, 'imageUrl'>);
        setField('imagePublicId' as Path<ComboFormValues>, '' as PathValue<ComboFormValues, 'imagePublicId'>);
        setShowDeleteConfirm(false);
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
        <div className="space-y-4">
            <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5">
                {isMediaLoading && (
                    <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Processing</span>
                        </div>
                    </div>
                )}

                {/* Main Preview Area */}
                <div className="aspect-[16/9] w-full flex items-center justify-center relative overflow-hidden">
                    {hasImage ? (
                        <>
                            <img
                                src={previewUrl!}
                                alt="Combo Preview"
                                className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-10">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <ImageIcon className="h-7 w-7 text-slate-300" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Media Uploaded</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Recommended: 1200×800px</p>
                            </div>
                        </div>
                    )}

                    {/* Quick Action Overlay */}
                    {hasImage && !isMediaLoading && (
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl shadow-lg border-2 border-white/20 backdrop-blur-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                onClick={hasPendingFile
                                    ? () => setField('imageFile' as Path<ComboFormValues>, undefined as PathValue<ComboFormValues, 'imageFile'>)
                                    : handleDelete
                                }
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Info Bar */}
                <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                hasPendingFile ? "bg-amber-400" : hasImage ? "bg-emerald-400" : "bg-slate-300"
                            )} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                {hasPendingFile ? "Pending local sync" : (watchValues.imagePublicId || (hasImage ? "Active Asset" : "Standby"))}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <Button
                            type="button"
                            onClick={handleUploadClick}
                            disabled={isMediaLoading}
                            className="h-9 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                            variant="default"
                        >
                            <Upload className="h-3.5 w-3.5 mr-2" />
                            <span className="text-[11px] font-black uppercase tracking-widest">
                                {hasImage ? 'Change Image' : 'Select File'}
                            </span>
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

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Delete Media Asset?"
                description="Are you sure you want to permanently delete this combo image from the server? This action cannot be undone."
                onConfirm={confirmDelete}
                confirmText="Delete Image"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
});

export default MediaBlock;
