import { LayoutGrid, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewModeToggleProps {
    mode: 'list' | 'tabs';
    onChange: (m: 'list' | 'tabs') => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
    return (
        <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg border border-gray-200 mr-2">
            <Button
                variant={mode === 'tabs' ? 'secondary' : 'ghost'}
                size="sm"
                className={`h-7 px-2 rounded-md transition-all ${mode === 'tabs' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => onChange('tabs')}
            >
                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-[10px] font-bold">Split View</span>
            </Button>
            <Button
                variant={mode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className={`h-7 px-2 rounded-md transition-all ${mode === 'list' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => onChange('list')}
            >
                <ListFilter className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-[10px] font-bold">List View</span>
            </Button>
        </div>
    );
}
