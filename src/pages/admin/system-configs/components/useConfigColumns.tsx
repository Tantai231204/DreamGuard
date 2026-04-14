import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Clock, Settings2, Trash2, Key, Coins, Percent, Info } from 'lucide-react';
import { AdminRowActions } from '@/components/admin';
import { formatDate } from '@/lib/utils';
import type { SystemConfig } from '@/api/types/systemConfig';

interface useConfigColumnsProps {
    onEdit: (config: SystemConfig) => void;
    onDelete: (config: SystemConfig) => void;
}

// Helper to turn SNAKE_CASE or concatenated strings into Human Readable
const formatKeyName = (key: string) => {
    // 1. First handle underscores
    let formatted = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    // 2. Handle concatenated words without underscores (e.g., Feedbackcoinreward -> Feedback Coin Reward)
    // We look for common keywords and ensure they start with a capital and have a space before them
    const keywords = ['Coin', 'Reward', 'Percent', 'Limit', 'Min', 'Max', 'Value'];
    
    // First, capitalize potential keywords if they are stuck
    keywords.forEach(kw => {
        const regex = new RegExp(`(${kw})`, 'gi');
        formatted = formatted.replace(regex, (match) => ` ${match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()}`);
    });

    // 3. Clean up extra spaces and normalize
    return formatted
        .replace(/([A-Z])/g, ' $1') // Space before capitals
        .replace(/\s+/g, ' ')       // Remove double spaces
        .trim()
        .split(' ')                 // Capitalize every word
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const useConfigColumns = ({ onEdit, onDelete }: useConfigColumnsProps) => {
    const columns = useMemo<ColumnDef<SystemConfig>[]>(
        () => [
            {
                accessorKey: 'configKey',
                header: 'Operational Variable',
                cell: ({ row }) => {
                    const technicalKey = row.original.configKey.toUpperCase();
                    const isCoin = technicalKey.includes('COIN') && !technicalKey.includes('PERCENT');
                    const isPercent = technicalKey.includes('PERCENT');
                    
                    return (
                        <div className="flex items-center gap-4">
                            <div className={`h-11 w-11 rounded-[14px] flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                                isCoin ? 'bg-amber-50 border-amber-100/50' : 
                                isPercent ? 'bg-primary-50 border-primary-100/50' : 
                                'bg-slate-50 border-slate-100'
                            }`}>
                                {isCoin ? <Coins className="h-5 w-5 text-amber-500" /> : 
                                 isPercent ? <Percent className="h-5 w-5 text-primary-500" /> : 
                                 <Key className="h-5 w-5 text-slate-400" />}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-black text-slate-800 tracking-tight text-[14px]">
                                    {formatKeyName(row.original.configKey)}
                                </span>
                                <div className="flex items-center gap-1.5 opacity-40 group cursor-help">
                                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                                        ID: {row.original.configKey}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'configValue',
                header: 'Deployment Value',
                cell: ({ row }) => {
                    const key = row.original.configKey.toUpperCase();
                    const isPercent = key.includes('PERCENT');
                    const isCoin = key.includes('COIN') && !isPercent;
                    
                    if (isPercent) {
                        return (
                            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-primary-50 border border-primary-100/50 text-primary-600 font-mono text-sm font-black">
                                {row.original.configValue}
                                <span className="text-[10px] font-black opacity-40">%</span>
                            </div>
                        );
                    }
                    
                    if (isCoin) {
                        return (
                            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-100/50 text-amber-600 font-mono text-sm font-black">
                                <span className="text-[11px] opacity-30">⌬</span>
                                {row.original.configValue}
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">Coins</span>
                            </div>
                        );
                    }

                    return (
                        <div className="inline-flex items-center px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 font-mono text-sm font-black">
                            {row.original.configValue}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'description',
                header: 'Logic Description',
                cell: ({ row }) => (
                    <div className="flex items-start gap-2.5 group">
                        <div className="mt-1 h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Info className="h-2 w-2 text-slate-400" />
                        </div>
                        <p className="text-[13px] text-slate-500 font-bold leading-relaxed max-w-[340px] italic">
                            "{row.original.description}"
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: 'updatedAt',
                header: 'Sync Status',
                cell: ({ row }) => {
                    const date = row.original.updatedAt || row.original.createdAt;
                    return (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-400 font-black">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] uppercase tracking-[0.1em]">
                                    {formatDate(date)}
                                </span>
                            </div>
                            <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest px-2 py-0.5 bg-emerald-50 rounded-full w-fit">
                                Live
                            </span>
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <AdminRowActions
                        actions={[
                            {
                                label: 'Modify Variable',
                                icon: <Settings2 className="w-4 h-4" />,
                                onClick: () => onEdit(row.original)
                            },
                            {
                                label: 'Revoke Logic',
                                icon: <Trash2 className="w-4 h-4" />,
                                variant: 'danger',
                                onClick: () => onDelete(row.original)
                            }
                        ]}
                    />
                ),
            },
        ],
        [onEdit, onDelete]
    );

    return columns;
};
