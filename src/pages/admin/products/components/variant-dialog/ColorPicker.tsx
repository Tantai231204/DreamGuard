import { memo, useCallback, useMemo } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { cn } from '@/lib/utils';

/* ─── Color Name Detection ─────────────────────────────── */
const COLOR_NAMES: Record<string, string> = {
    '#FFFFFF': 'White',
    '#F5F5F5': 'White Smoke',
    '#000000': 'Black',
    '#FF0000': 'Red',
    '#DC143C': 'Crimson',
    '#B22222': 'Firebrick',
    '#8B0000': 'Dark Red',
    '#FF6347': 'Tomato',
    '#FF4500': 'Orange Red',
    '#FFA500': 'Orange',
    '#FF8C00': 'Dark Orange',
    '#FFD700': 'Gold',
    '#FFFF00': 'Yellow',
    '#FFFFE0': 'Light Yellow',
    '#00FF00': 'Lime',
    '#32CD32': 'Lime Green',
    '#228B22': 'Forest Green',
    '#008000': 'Green',
    '#006400': 'Dark Green',
    '#90EE90': 'Light Green',
    '#00FFFF': 'Cyan',
    '#008B8B': 'Dark Cyan',
    '#20B2AA': 'Light Sea Green',
    '#40E0D0': 'Turquoise',
    '#00CED1': 'Dark Turquoise',
    '#0000FF': 'Blue',
    '#000080': 'Navy',
    '#1E90FF': 'Dodger Blue',
    '#4169E1': 'Royal Blue',
    '#6495ED': 'Cornflower Blue',
    '#87CEEB': 'Sky Blue',
    '#ADD8E6': 'Light Blue',
    '#4682B4': 'Steel Blue',
    '#0047AB': 'Cobalt Blue',
    '#800080': 'Purple',
    '#8B008B': 'Dark Magenta',
    '#9932CC': 'Dark Orchid',
    '#BA55D3': 'Medium Orchid',
    '#DA70D6': 'Orchid',
    '#EE82EE': 'Violet',
    '#FF00FF': 'Magenta',
    '#FF69B4': 'Hot Pink',
    '#FFC0CB': 'Pink',
    '#FFB6C1': 'Light Pink',
    '#DB7093': 'Pale Violet Red',
    '#C71585': 'Medium Violet Red',
    '#A52A2A': 'Brown',
    '#8B4513': 'Saddle Brown',
    '#D2691E': 'Chocolate',
    '#CD853F': 'Peru',
    '#DEB887': 'Burly Wood',
    '#F5DEB3': 'Wheat',
    '#D2B48C': 'Tan',
    '#BC8F8F': 'Rosy Brown',
    '#808080': 'Gray',
    '#A9A9A9': 'Dark Gray',
    '#C0C0C0': 'Silver',
    '#D3D3D3': 'Light Gray',
    '#2F4F4F': 'Dark Slate Gray',
    '#708090': 'Slate Gray',
    '#F0E68C': 'Khaki',
    '#BDB76B': 'Dark Khaki',
    '#E6E6FA': 'Lavender',
    '#FFF0F5': 'Lavender Blush',
    '#FFE4E1': 'Misty Rose',
    '#FAEBD7': 'Antique White',
    '#FAF0E6': 'Linen',
    '#FFF5EE': 'Seashell',
    '#F5F5DC': 'Beige',
    '#FFFAF0': 'Floral White',
    '#FFFFF0': 'Ivory',
    '#F0FFF0': 'Honeydew',
    '#F5FFFA': 'Mint Cream',
    '#F0FFFF': 'Azure',
    '#E0FFFF': 'Light Cyan',
    '#AFEEEE': 'Pale Turquoise',
    '#7FFFD4': 'Aquamarine',
    '#00FA9A': 'Medium Spring Green',
    '#98FB98': 'Pale Green',
    '#9ACD32': 'Yellow Green',
    '#6B8E23': 'Olive Drab',
    '#808000': 'Olive',
    '#556B2F': 'Dark Olive Green',
    '#66CDAA': 'Medium Aquamarine',
    '#8FBC8F': 'Dark Sea Green',
    '#2E8B57': 'Sea Green',
    '#3CB371': 'Medium Sea Green',
    '#00FF7F': 'Spring Green',
    '#7CFC00': 'Lawn Green',
    '#7FFF00': 'Chartreuse',
    '#ADFF2F': 'Green Yellow',
};

const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [0, 0, 0];
};

const colorDistance = (hex1: string, hex2: string): number => {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
};

const getColorName = (hex: string): string => {
    const normalizedHex = hex.toUpperCase();
    if (COLOR_NAMES[normalizedHex]) return COLOR_NAMES[normalizedHex];

    let closestName = 'Custom';
    let minDistance = Infinity;

    for (const [colorHex, name] of Object.entries(COLOR_NAMES)) {
        const distance = colorDistance(normalizedHex, colorHex);
        if (distance < minDistance) {
            minDistance = distance;
            closestName = name;
        }
    }

    // If too far from any known color, return Custom
    return minDistance < 60 ? closestName : 'Custom';
};

/* ─── Props ─────────────────────────────────────────────── */
export interface ColorPickerProps {
    color: string;
    colorCode: string;
    onColorChange: (name: string, code: string) => void;
    disabled?: boolean;
}

/* ─── Component ─────────────────────────────────────────── */
const ColorPicker = memo(function ColorPicker({
    colorCode,
    onColorChange,
    disabled,
}: ColorPickerProps) {
    const currentHex = colorCode || '#f5f5f5';
    const isValidHex = /^#[0-9A-Fa-f]{6}$/i.test(currentHex);

    const detectedColorName = useMemo(() => getColorName(currentHex), [currentHex]);

    const handleChange = useCallback(
        (hex: string) => {
            const colorName = getColorName(hex);
            onColorChange(colorName, hex);
        },
        [onColorChange]
    );

    return (
        <div className={cn('flex gap-4', disabled && 'opacity-50 pointer-events-none')}>
            {/* Color Picker */}
            <HexColorPicker
                color={currentHex}
                onChange={handleChange}
                style={{ width: '180px', height: '180px' }}
            />

            {/* Hex Input & Preview */}
            <div className="flex flex-col gap-3 flex-1">
                <div className="relative">
                    <div
                        className="w-full h-20 rounded-xl border border-gray-200 shadow-inner"
                        style={{ backgroundColor: isValidHex ? currentHex : '#f5f5f5' }}
                    />
                    <span className="absolute bottom-2 left-3 text-xs font-medium text-white drop-shadow-md bg-black/30 px-2 py-0.5 rounded">
                        {detectedColorName}
                    </span>
                </div>
                <div className="space-y-1.5">
                    <span className="text-xs text-gray-500 font-medium">HEX Code</span>
                    <HexColorInput
                        color={currentHex}
                        onChange={handleChange}
                        prefixed
                        className={cn(
                            'w-full h-10 px-3 text-sm font-mono uppercase rounded-lg',
                            'border border-slate-200 bg-white transition-all',
                            'focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400'
                        )}
                    />
                </div>
            </div>
        </div>
    );
});

export default ColorPicker;
