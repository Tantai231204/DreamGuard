import { MoreVertical, Edit, Copy, Trash2 } from 'lucide-react';
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
    onDuplicate?: (v: Combo) => void;
}

export function VariantActionDropdown({
    variant,
    onEdit,
    onDelete,
    onDuplicate,
}: VariantActionDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-xl border-2 rounded-xl border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => onEdit?.(variant)}>
                    <Edit className="h-3.5 w-3.5 mr-2.5 text-gray-600" />
                    Edit Variant
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => onDuplicate?.(variant)}>
                    <Copy className="h-3.5 w-3.5 mr-2.5 text-emerald-500" />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer py-2 text-red-600 font-bold focus:bg-red-50 focus:text-red-700" onClick={() => onDelete?.(variant)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2.5" />
                    Delete Variant
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
