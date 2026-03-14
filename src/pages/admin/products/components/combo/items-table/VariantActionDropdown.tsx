import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Combo } from '../../../types';

interface VariantActionDropdownProps {
    variant: Combo;
    onEdit?: (v: Combo) => void;
    onDelete?: (v: Combo) => void;
}

export function VariantActionDropdown({
    variant,
    onEdit,
    onDelete,
}: VariantActionDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded hover:bg-slate-100 transition-colors"
                >
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-xl border border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                <DropdownMenuItem
                    className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-primary-600 focus:bg-primary-50 focus:text-primary-700 transition-colors gap-2.5"
                    onClick={() => onEdit?.(variant)}
                >
                    <Edit className="h-4 w-4 opacity-70" />
                    <span className="text-[13px]">Edit Variant</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem
                    className="rounded-lg cursor-pointer py-2 px-3 font-medium text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors gap-2.5"
                    onClick={() => onDelete?.(variant)}
                >
                    <Trash2 className="h-4 w-4 opacity-70" />
                    <span className="text-[13px]">Delete Variant</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
