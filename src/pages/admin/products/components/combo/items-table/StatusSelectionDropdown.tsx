import { memo } from 'react';
import { 
    Check, 
    EyeOff, 
    FileEdit, 
    Archive, 
    AlertCircle, 
    Package,
    type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllowedComboStatusTransitions } from '../../../types';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';

interface StatusSelectionDropdownProps {
    id: string;
    name: string;
    status: string;
    totalStock?: number;
    hasPublishedChild?: boolean;
    badgeLabel?: string;
    triggerClassName?: string;
    align?: "start" | "center" | "end";
    onUpdateStatus?: (id: string, status: string, name?: string, currentStatus?: string, totalStock?: number, hasPublishedChild?: boolean) => void;
}

const STATUS_ICONS: Record<string, LucideIcon> = {
    published: Check,
    hidden: EyeOff,
    draft: FileEdit,
    archived: Archive,
    outofstock: AlertCircle,
};

const ICON_COLORS: Record<string, string> = {
    published: "bg-[#10b981] text-white",
    hidden: "bg-[#3b82f6] text-white",
    draft: "bg-[#f97316] text-white",
    archived: "bg-slate-400 text-white",
    outofstock: "bg-rose-500 text-white",
};

const StatusSelectionDropdown = memo(({
    id,
    name,
    status,
    totalStock,
    hasPublishedChild,
    badgeLabel = "Collection",
    triggerClassName,
    align = "center",
    onUpdateStatus,
}: StatusSelectionDropdownProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div 
                    role="button" 
                    tabIndex={0} 
                    className="outline-none focus:ring-0 group cursor-pointer"
                >
                    <AdminStatusBadge 
                        status={status} 
                        className={cn("hover:shadow-md transition-all group-hover:ring-2 group-hover:ring-blue-100", triggerClassName)}
                    />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align={align} 
                className="w-52 p-1 rounded-2xl shadow-2xl border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 mt-1 select-none"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-slate-50/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Status</span>
                    <div className="px-2 py-0.5 rounded-md bg-primary-50 border border-primary-100 shadow-sm">
                        <span className="text-[9px] font-black text-primary-500 uppercase tracking-tight">
                            {badgeLabel}
                        </span>
                    </div>
                </div>
                
                <div className="p-0.5 space-y-1">
                    {getAllowedComboStatusTransitions(status).map((s) => {
                        const normalized = s.toLowerCase();
                        const isActive = status === s;
                        const Icon = STATUS_ICONS[normalized] || Package;
                        const iconBg = ICON_COLORS[normalized] || "bg-slate-300 text-white";

                        return (
                            <DropdownMenuItem
                                key={s}
                                disabled={isActive}
                                className={cn(
                                    "rounded-lg px-2 py-1.5 cursor-pointer transition-all w-full flex items-center justify-between border border-transparent",
                                    isActive 
                                        ? "bg-primary-50 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)] font-bold hover:bg-primary-100/40" 
                                        : "hover:bg-slate-50"
                                )}
                                onClick={() => !isActive && onUpdateStatus?.(id, s, name, status, totalStock, hasPublishedChild)}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm",
                                        iconBg
                                    )}>
                                        <Icon className="h-3 w-3" strokeWidth={3} />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.05em]",
                                        isActive ? "text-[#1e40af]" : "text-slate-500 group-hover:text-slate-900"
                                    )}>
                                        {s}
                                    </span>
                                </div>
                                {isActive && <Check className="h-3 w-3 text-blue-500" strokeWidth={3} />}
                            </DropdownMenuItem>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

StatusSelectionDropdown.displayName = "StatusSelectionDropdown";

export default StatusSelectionDropdown;
