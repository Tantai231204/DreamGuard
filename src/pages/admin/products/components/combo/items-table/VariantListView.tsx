import { AdminStatusBadge } from '@/components/admin';
import { Separator } from '@/components/ui/separator';
import ChildComboItems from '../ChildComboItems';
import { getColorHex } from '../combo-utils';
import { VariantActionDropdown } from './VariantActionDropdown';
import { EmptyResults } from './StatsAndFeedback';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Combo } from '../../../types';
import { getAllowedStatusTransitions } from '../../../types';
import type { ComboResponse } from '@/api/services/comboService';

interface VariantListViewProps {
    childCombos: ComboResponse[];
    onEditVariant?: (v: Combo) => void;
    onDeleteVariant?: (v: Combo) => void;
    onUpdateStatus?: (id: string, status: string, name?: string, currentStatus?: string) => void;
}

export function VariantListView({
    childCombos,
    onEditVariant,
    onDeleteVariant,
    onUpdateStatus,
}: VariantListViewProps) {
    if (childCombos.length === 0) return <EmptyResults />;

    return (
        <div className="divide-y-4 divide-gray-50">
            {childCombos.map((child, idx) => (
                <div key={child.id} className={`p-6 transition-all hover:bg-white ${idx % 2 === 0 ? 'bg-gray-50/20' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-md ring-1 ring-gray-100"
                                style={{ backgroundColor: getColorHex(child.color) }}
                            >
                                <span className="text-[10px] font-black mix-blend-difference text-white">{child.size || 'N/A'}</span>
                            </div>
                            <div>
                                <h5 className="text-sm font-black text-gray-800 leading-none">{child.name}</h5>
                                {child.description && (
                                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 max-w-[400px]">
                                        {child.description}
                                    </p>
                                )}
                                <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-widest">{child.sku}</p>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <AdminStatusBadge
                                            status={child.status}
                                            className="h-4 px-1.5 cursor-pointer hover:border-slate-300 transition-all shadow-sm"
                                        />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="center" className="w-40 shadow-xl border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                                        {getAllowedStatusTransitions(child.status).map((s) => {
                                            const normalized = s.toLowerCase();
                                            const colorCls =
                                                normalized === 'published' ? "text-emerald-600 hover:bg-emerald-50" :
                                                    normalized === 'draft' ? "text-amber-600 hover:bg-amber-50" :
                                                        normalized === 'hidden' ? "text-blue-600 hover:bg-blue-50" :
                                                            "text-primary-600 hover:bg-primary-50 text-opacity-70 hover:bg-slate-50";

                                            return (
                                                <DropdownMenuItem
                                                    key={s}
                                                    disabled={child.status === s}
                                                    className={cn(
                                                        "rounded-lg cursor-pointer py-1.5 px-3 text-[11px] font-black uppercase tracking-tight transition-all mb-0.5 last:mb-0",
                                                        child.status === s ? "bg-slate-50 text-slate-300" : colorCls
                                                    )}
                                                    onClick={() => child.status !== s && onUpdateStatus?.(child.id, s, child.name, child.status)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            normalized === 'published' ? "bg-emerald-500" :
                                                                normalized === 'draft' ? "bg-amber-500" :
                                                                    normalized === 'hidden' ? "bg-blue-500" :
                                                                        "bg-slate-400"
                                                        )} />
                                                        {s}
                                                    </div>
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm font-black text-gray-900 leading-none">{(child.salePrice || child.basePrice).toLocaleString('en-US')}₫</div>
                                <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-tighter">Base: {child.basePrice.toLocaleString('en-US')}₫</p>
                            </div>
                            <Separator orientation="vertical" className="h-8 bg-gray-200" />
                            <VariantActionDropdown
                                variant={child as unknown as Combo}
                                onEdit={onEditVariant}
                                onDelete={onDeleteVariant}
                            />
                        </div>
                    </div>
                    <ChildComboItems childId={child.id} childName={child.name} parentChildData={child as unknown as Combo} isDense />
                </div>
            ))}
        </div>
    );
}
