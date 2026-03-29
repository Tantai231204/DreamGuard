import { memo, useCallback, useMemo, useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { cn } from '@/lib/utils';
import { getColorHex, getColorName } from '@/utils/color-utils';
import { Palette, ChevronDown, CheckCircle2, FlaskConical } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface ColorPickerProps {
    color: string;
    colorCode: string;
    onColorChange: (name: string, code: string) => void;
    disabled?: boolean;
}

const ColorPicker = memo(function ColorPicker({
    colorCode,
    onColorChange,
    disabled,
}: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Standardize input code with robust resolution
    const currentHex = useMemo(() => getColorHex(colorCode), [colorCode]);

    // Resolve name with closest-match algorithm
    const detectedColorName = useMemo(() => getColorName(currentHex), [currentHex]);

    const handleChange = useCallback(
        (hex: string) => {
            const colorName = getColorName(hex);
            onColorChange(colorName, hex);
        },
        [onColorChange]
    );

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'w-full h-11 px-3 py-2 flex items-center justify-between text-left font-normal bg-white border border-slate-200/80 rounded-xl transition-all shadow-sm hover:border-slate-300 hover:bg-slate-50',
                        disabled && 'opacity-50 cursor-not-allowed',
                        isOpen && 'ring-4 ring-primary-500/10 border-primary-500 bg-white'
                    )}
                >
                    <div className="flex items-center gap-3 w-full min-w-0">
                        {/* Swatch Bubble */}
                        <div
                            className="w-6 h-6 rounded-full border border-slate-200 shadow-sm shrink-0 transition-transform group-hover:scale-105"
                            style={{ backgroundColor: currentHex }}
                        />

                        {/* Inline Data */}
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wide truncate">
                                {detectedColorName}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 capitalize tabular-nums">
                                {currentHex}
                            </span>
                        </div>
                    </div>

                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                sideOffset={8}
                className="w-auto p-4 rounded-[1.5rem] border-slate-100 shadow-2xl bg-white/95 backdrop-blur-3xl animate-in zoom-in-95"
            >
                <div className="flex flex-col gap-5 w-[240px]">
                    {/* Visual Engine */}
                    <div className="relative group rounded-xl overflow-hidden bg-transparent border border-slate-100 shadow-inner">
                        <HexColorPicker
                            color={currentHex}
                            onChange={handleChange}
                            style={{ width: '100%', height: '180px' }}
                            className="block"
                        />
                    </div>

                    {/* Meta Controls */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <FlaskConical className="w-3 h-3 text-primary-500" />
                                Hex Input
                            </Label>
                            {/* Color Label dynamically generated */}
                            <span className="px-2 py-0.5 rounded border border-primary-100 bg-primary-50 flex items-center gap-1">
                                <Palette className="w-3 h-3 text-primary-600" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-primary-700">
                                    {detectedColorName}
                                </span>
                            </span>
                        </div>

                        <div className="relative">
                            <HexColorInput
                                color={currentHex}
                                onChange={handleChange}
                                prefixed
                                className={cn(
                                    'w-full h-10 pl-4 pr-10 text-sm font-black uppercase rounded-lg tracking-widest',
                                    'border border-slate-200 bg-slate-50 transition-all focus:bg-white',
                                    'focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500',
                                )}
                            />
                            {/* Visual confirmation pin */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
});

export default ColorPicker;

