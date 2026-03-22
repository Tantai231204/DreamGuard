import type { ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminRowActionItem {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info';
  component?: ReactNode; // For Links or custom wrappers
}

interface AdminRowActionsProps {
  actions?: AdminRowActionItem[];
  align?: 'start' | 'end' | 'center';
  width?: string;
  sections?: AdminRowActionItem[][]; // For grouped actions with separators
}

export function AdminRowActions({ 
  actions, 
  sections,
  align = 'end', 
  width = 'w-52' 
}: AdminRowActionsProps) {
  
  const renderItem = (item: AdminRowActionItem, index: number) => {
    // Đen (Slate/Black) cho Action mặc định
    let variantClass = "text-slate-700 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900";
    if (item.variant === 'danger') variantClass = "text-red-600 hover:text-red-700 focus:bg-red-50 focus:text-red-700";
    if (item.variant === 'success') variantClass = "text-emerald-700 hover:text-emerald-800 focus:bg-emerald-50 focus:text-emerald-800";
    if (item.variant === 'warning') variantClass = "text-amber-700 hover:text-amber-800 focus:bg-amber-50 focus:text-amber-800";

    return (
      <DropdownMenuItem
        key={index}
        onClick={item.onClick}
        asChild={!!item.component}
        className={`rounded-lg cursor-pointer py-2 px-3 font-medium transition-colors gap-2.5 ${variantClass}`}
      >
        {item.component ? (
          item.component
        ) : (
          <>
            <span className="opacity-70">{item.icon}</span>
            <span className="text-[13px]">{item.label}</span>
          </>
        )}
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded hover:bg-slate-100 dropdown-trigger transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        className={`${width} shadow-xl border border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100 z-50`}
      >
        {sections ? (
          sections.map((section, sIndex) => (
            <div key={sIndex}>
              {section.map((item, iIndex) => renderItem(item, iIndex))}
              {sIndex < sections.length - 1 && <DropdownMenuSeparator className="my-1 bg-slate-100" />}
            </div>
          ))
        ) : (
          actions?.map((item, index) => renderItem(item, index))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
