import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, X, ImagePlus, Loader2, Trash2 } from 'lucide-react';

interface ImageUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: string;
    productName: string;
    onUpload: (productId: string, files: File[]) => Promise<void>;
    isUploading?: boolean;
}

interface FilePreview {
    file: File;
    preview: string;
}

export default function ImageUploadDialog({
    open,
    onOpenChange,
    productId,
    productName,
    onUpload,
    isUploading = false,
}: ImageUploadDialogProps) {
    const [files, setFiles] = useState<FilePreview[]>([]);


    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        // Cho phép nhiều ảnh, không trùng file
        setFiles((prev) => {
            const prevNames = new Set(prev.map(f => f.file.name + f.file.size));
            const newFiles = acceptedFiles.filter(f => !prevNames.has(f.name + f.size));
            return [
                ...prev,
                ...newFiles.map((file) => ({ file, preview: URL.createObjectURL(file) }))
            ];
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        disabled: isUploading,
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: true,
    });

    const removeFile = useCallback((index: number) => {
        setFiles((prev) => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    }, []);

    const clearAll = useCallback(() => {
        files.forEach((f) => URL.revokeObjectURL(f.preview));
        setFiles([]);
    }, [files]);

    const handleSubmit = useCallback(async () => {
        if (files.length === 0 || !productId) {
            return;
        }
        for (let i = 0; i < files.length; i++) {
            await onUpload(productId, [files[i].file]);
            setFiles((prev) => {
                // Xóa preview đã upload
                URL.revokeObjectURL(prev[0].preview);
                return prev.slice(1);
            });
        }
        clearAll();
    }, [files, productId, onUpload, clearAll]);

    const handleClose = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                clearAll();
            }
            onOpenChange(isOpen);
        },
        [clearAll, onOpenChange]
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader className="pb-4 border-b flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                            <ImagePlus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Upload Images
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500">
                                Add photos for "{productName}"
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-5 space-y-5">
                    {/* Drop Zone */}
                    <div
                        {...getRootProps()}
                        className={cn(
                            'border-2 border-dashed rounded-xl p-8 text-center transition-all',
                            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                        )}
                    >
                        <input {...getInputProps()} />
                        <Upload
                            className={cn(
                                'w-10 h-10 mx-auto mb-3',
                                isDragActive ? 'text-blue-500' : 'text-gray-400'
                            )}
                        />
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                        </p>
                        <p className="text-xs text-gray-500">or click to browse • JPG, PNG, WEBP up to 5MB</p>
                    </div>

                    {/* Preview Grid */}
                    {files.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    {files.length} image{files.length !== 1 ? 's' : ''} selected
                                </span>
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                    disabled={isUploading}
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Clear all
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                                    >
                                        {index === 0 && (
                                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-semibold rounded z-10">
                                                Main
                                            </span>
                                        )}
                                        <img
                                            src={file.preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {!isUploading && (
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t gap-3 flex-shrink-0">
                    <Button
                        variant="outline"
                        onClick={() => handleClose(false)}
                        disabled={isUploading}
                        className="flex-1 h-10 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium"
                    >
                        {files.length > 0 ? 'Cancel' : 'Skip'}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isUploading || files.length === 0}
                        className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 font-medium disabled:opacity-50"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            `Upload ${files.length > 0 ? files.length : ''} Image${files.length !== 1 ? 's' : ''}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}