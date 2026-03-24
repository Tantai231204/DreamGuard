import { Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserActions() {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 shadow-xl border border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-50 mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by Role</span>
          </div>
          <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors text-[13px]">All Roles</DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors text-[13px]">Admin</DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors text-[13px]">Moderator</DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors text-[13px]">Customer</DropdownMenuItem>
          
          <DropdownMenuSeparator className="my-1 bg-slate-100" />
          
          <div className="px-3 py-2 border-b border-slate-50 mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by Status</span>
          </div>
          <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors text-[13px]">All Status</DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors text-[13px]">Active</DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors text-[13px]">Inactive</DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors text-[13px]">Banned</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" className="gap-2">
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  );
}
