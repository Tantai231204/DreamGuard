    import { useState } from 'react';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { SystemConfig } from '@/api/types/systemConfig';
import { useUpdateSystemConfig, useCreateSystemConfig } from '@/hooks/queries/useSystemConfig';
import { toast } from 'sonner';
import { Loader2, PanelTop } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface EditConfigDialogProps {
    config: SystemConfig | 'new' | null;
    onClose: () => void;
}

export function EditConfigDialog({ config, onClose }: EditConfigDialogProps) {
    const isEdit = config !== 'new' && config !== null;
    const [configKey, setConfigKey] = useState(isEdit ? config.configKey : '');
    const [configValue, setConfigValue] = useState(isEdit ? config.configValue : '');
    const [description, setDescription] = useState(isEdit ? config.description : '');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const { mutate: updateConfig, isPending: isUpdating } = useUpdateSystemConfig();
    const { mutate: createConfig, isPending: isCreating } = useCreateSystemConfig();

    const isPending = isUpdating || isCreating;

    const handleClose = () => {
        const hasChanges = isEdit 
            ? configValue !== (config as SystemConfig).configValue || description !== (config as SystemConfig).description
            : configKey !== '' || configValue !== '' || description !== '';
        
        if (hasChanges) setShowCancelConfirm(true);
        else onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!configValue.trim() || !description.trim() || (!isEdit && !configKey.trim())) {
            return;
        }

        const successCallback = () => {
            toast.success(isEdit ? 'Registry synchronized' : 'New key initialized');
            onClose();
        };

        if (isEdit) {
            updateConfig(
                { key: (config as SystemConfig).configKey, data: { configValue, description } },
                { onSuccess: successCallback, onError: () => toast.error('Update failed') }
            );
        } else {
            createConfig(
                { configKey: configKey.trim(), configValue, description },
                { onSuccess: successCallback, onError: () => toast.error('Initialization failed') }
            );
        }
    };

    const isFormValid = configValue.trim() && description.trim() && (isEdit || configKey.trim());
    const inputBaseClass =
        'h-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-[#4988c4] focus:ring-2 focus:ring-[#4988c4]/20 px-5 transition-all';

    return (
        <Dialog open={config !== null} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-[40px] border-none shadow-2xl">
                <div className="flex flex-col bg-white h-full">
                    <header className="px-10 pt-10 pb-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                <PanelTop className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none uppercase">
                                    Registry Intelligence
                                </h2>
                                <span className="text-[10px] font-bold text-gray-400 mt-2 tracking-widest uppercase opacity-60">
                                    {isEdit ? 'Refine operational variable' : 'Identify new system logic'}
                                </span>
                            </div>
                        </div>
                    </header>

                    <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto scrollbar-hide">
                        {!isEdit && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] ml-1">
                                    Registry Key <span className="text-red-500 ml-1">*</span>
                                </label>
                                <Input
                                    value={configKey}
                                    onChange={(e) => setConfigKey(e.target.value.toUpperCase().replace(/\s/g, '_'))}
                                    className={`${inputBaseClass} font-mono font-bold text-sm tracking-widest`}
                                    placeholder="E.G. GLOBAL_REWARD_SCALE"
                                    disabled={isPending}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] ml-1">
                                Logic Value <span className="text-red-500 ml-1">*</span>
                            </label>
                            <Input
                                value={configValue}
                                onChange={(e) => setConfigValue(e.target.value)}
                                className={`${inputBaseClass} font-mono font-bold text-lg`}
                                placeholder="Enter value..."
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] ml-1">
                                Operational Description <span className="text-red-500 ml-1">*</span>
                            </label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[120px] rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-[#4988c4] focus:ring-2 focus:ring-[#4988c4]/20 text-sm font-medium leading-relaxed p-5 resize-none"
                                placeholder="Describe the behavior controlled by this key..."
                                disabled={isPending}
                            />
                        </div>
                    </form>

                    <footer className="px-10 py-6 border-t bg-gray-50 flex items-center gap-4 shrink-0">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isPending}
                            className="flex-1 h-11 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium text-gray-600"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isPending || !isFormValid}
                            className="flex-[2] h-11 rounded-xl font-medium transition-all text-white bg-[#4988c4] hover:bg-[#3a6fa0] shadow-sm disabled:opacity-50 disabled:shadow-none gap-2"
                        >
                            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isEdit ? 'Sync Changes' : 'Initialize'}
                        </Button>
                    </footer>
                </div>
            </DialogContent>

            <ConfirmDialog
                open={showCancelConfirm}
                onOpenChange={setShowCancelConfirm}
                title="Discard Changes?"
                description="Your current registry configuration will be lost."
                confirmText="Confirm Discard"
                onConfirm={() => onClose()}
                variant="warning"
            />
        </Dialog>
    );
}
